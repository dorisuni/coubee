// 백엔드 API 연동을 위한 서비스 함수들
import { AuthService } from "./auth";
import { config } from "../config/env";

const API_BASE_URL = config.apiBaseUrl;

// 로그인 API 인터페이스
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  data: {
    userInfo: {
      username: string;
      nickname: string;
      name: string;
      email: string;
      phoneNum: string;
      gender: string;
      age: number;
      profileImageUrl: string;
      isInfoRegister: boolean;
    };
    accessRefreshToken: {
      access: {
        token: string;
        expiresIn: number;
      };
      refresh: {
        token: string;
        expiresIn: number;
      };
    };
  };
}

export interface RefreshResponse {
  data: {
    access: {
      token: string;
      expiresIn: number;
    };
  };
}

// 토큰 리프레시 시도 중인지 추적
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// 인증된 API 요청 헬퍼 (토큰 리프레시 포함)
async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response | null> {
  try {
    const token = await AuthService.getToken();

    const makeRequest = async (authToken?: string) => {
      return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
          ...options.headers,
        },
      });
    };

    let response = await makeRequest(token || undefined);

    // 푸시 토큰 관련 요청은 별도 처리 (리프레시 시도하지 않음)
    if (url.includes("/push-tokens")) {
      if (response.status === 401) {
        console.log(
          "Push token request failed with 401, not attempting refresh"
        );
        return null;
      }
      return response;
    }

    // 일반 API 요청의 401 처리
    if (response.status === 401 && token) {
      console.log("Received 401, attempting token refresh...");

      // 이미 리프레시 중인 경우 대기
      if (isRefreshing && refreshPromise) {
        const refreshSuccess = await refreshPromise;
        if (refreshSuccess) {
          const newToken = await AuthService.getToken();
          response = await makeRequest(newToken || undefined);
        } else {
          console.log("Token refresh failed during wait, logging out...");
          await handleTokenExpiredLogout();
          return null;
        }
      } else {
        // 토큰 리프레시 시도
        const refreshSuccess = await attemptTokenRefresh();
        if (refreshSuccess) {
          const newToken = await AuthService.getToken();
          response = await makeRequest(newToken || undefined);

          // 두 번째 401: 완전 로그아웃
          if (response.status === 401) {
            console.log("Second 401 after refresh, logging out...");
            await handleTokenExpiredLogout();
            return null;
          }
        } else {
          console.log("Token refresh failed, logging out...");
          await handleTokenExpiredLogout();
          return null;
        }
      }
    }

    return response;
  } catch (error) {
    console.error("API request failed:", error);
    return null;
  }
}

// 토큰 리프레시 함수
async function attemptTokenRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = performTokenRefresh();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

async function performTokenRefresh(): Promise<boolean> {
  try {
    const refreshToken = await AuthService.getRefreshToken();
    if (!refreshToken) {
      console.log("No refresh token available");
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/user/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (response.ok) {
      const data: RefreshResponse = await response.json();
      await AuthService.setToken(data.data.access.token);

      console.log("Token refresh successful");
      return true;
    } else {
      console.log("Token refresh failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error during token refresh:", error);
    return false;
  }
}

// 토큰 만료로 인한 자동 로그아웃 처리
async function handleTokenExpiredLogout(): Promise<void> {
  try {
    // 1. 로컬에 저장된 푸시 토큰으로 백엔드에서 삭제
    const pushToken = await AuthService.getPushToken();
    if (pushToken) {
      await deleteTokenFromBackend(pushToken);
    }

    // 2. 인증 데이터 모두 삭제 (푸시 토큰 포함)
    await AuthService.clearAll();

    // 3. 로그인 화면으로 이동 (React Navigation 사용시)
    // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });

    console.log("Automatic logout completed");
  } catch (error) {
    console.error("Error during automatic logout:", error);
  }
}

// 푸시 토큰을 백엔드 서버로 전송
export async function sendTokenToBackend(token: string): Promise<boolean> {
  try {
    const response = await authenticatedFetch("/user/notification/token", {
      method: "POST",
      body: JSON.stringify({
        notificationToken: token,
      }),
    });

    if (response?.ok) {
      console.log("Push token sent successfully");
      return true;
    } else {
      console.error("Failed to send push token:", response?.status);
      return false;
    }
  } catch (error) {
    console.error("Error sending push token:", error);
    return false;
  }
}

// 푸시 토큰 삭제 (로그아웃 시)
export async function deleteTokenFromBackend(token: string): Promise<boolean> {
  try {
    const response = await authenticatedFetch(
      `/user/notification/token/delete`,
      {
        method: "POST",
        body: JSON.stringify({ notificationToken: token }),
      }
    );

    if (response?.ok) {
      console.log("Push token deleted successfully");
      return true;
    } else {
      console.error("Failed to delete push token:", response?.status);
      return false;
    }
  } catch (error) {
    console.error("Error deleting push token:", error);
    return false;
  }
}

// 로그인 API
export async function loginUser(
  credentials: LoginRequest
): Promise<LoginResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (response.ok) {
      const data: LoginResponse = await response.json();

      console.log("Login successful");
      return data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("Login failed:", response.status, errorData);
      return null;
    }
  } catch (error) {
    console.error("Login request failed:", error);
    return null;
  }
}

// 사용자 로그아웃 처리 (수동 로그아웃)
export async function handleUserLogout(): Promise<void> {
  try {
    // 1. 서버에 로그아웃 요청 (optional)
    try {
      // await authenticatedFetch("/user/auth/logout", { method: "POST" });
    } catch (error) {
      console.log("Server logout request failed (continuing anyway):", error);
    }

    // 2. 로컬에 저장된 푸시 토큰으로 백엔드에서 삭제
    const pushToken = await AuthService.getPushToken();
    if (pushToken) {
      await deleteTokenFromBackend(pushToken);
    }

    // 3. 인증 데이터 모두 삭제 (푸시 토큰 포함)
    await AuthService.clearAll();

    // 4. 리프레시 상태 초기화
    isRefreshing = false;
    refreshPromise = null;

    console.log("Manual logout completed");
  } catch (error) {
    console.error("Error during manual logout:", error);
    throw error;
  }
}

// Default export for Expo Router compatibility
export default { loginUser, sendTokenToBackend, deleteTokenFromBackend, handleUserLogout };
