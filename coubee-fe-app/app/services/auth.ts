import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'userToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ID_KEY = 'userId';
const PUSH_TOKEN_KEY = 'pushToken';

export class AuthService {
  // JWT 토큰 저장
  static async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  // JWT 토큰 조회
  static async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  // Refresh Token 저장
  static async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  // Refresh Token 조회
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  // 사용자 ID 저장
  static async setUserId(userId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_ID_KEY, userId);
    } catch (error) {
      console.error('Error saving user ID:', error);
      throw error;
    }
  }

  // 사용자 ID 조회
  static async getUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(USER_ID_KEY);
    } catch (error) {
      console.error('Error retrieving user ID:', error);
      return null;
    }
  }

  // Push Token 저장
  static async setPushToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving push token:', error);
      throw error;
    }
  }

  // Push Token 조회
  static async getPushToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving push token:', error);
      return null;
    }
  }

  // JWT 토큰 삭제
  static async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // 모든 인증 데이터 삭제 (완전 로그아웃)
  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_ID_KEY),
        SecureStore.deleteItemAsync(PUSH_TOKEN_KEY)
      ]);
      console.log('All auth data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // JWT 만료 시간 확인
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // 파싱 실패시 만료된 것으로 간주
    }
  }

  // 토큰 유효성 검사
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        return false;
      }

      // 토큰이 만료되었는지 확인
      if (this.isTokenExpired(token)) {
        await this.removeToken(); // 만료된 토큰 삭제
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // 로그인 처리 (토큰 및 사용자 정보 저장)
  static async login(token: string, refreshToken?: string, userId?: string): Promise<void> {
    try {
      await this.setToken(token);
      
      if (refreshToken) {
        await this.setRefreshToken(refreshToken);
      }
      
      if (userId) {
        await this.setUserId(userId);
      }
      
      console.log('Login successful, tokens saved');
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }
}

// Default export for Expo Router compatibility
export default AuthService;