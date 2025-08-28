import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { encode, decode } from 'base-64';

// API 기본 설정
const BASE_URL = 'https://coubee-api.murkui.com';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// 토큰 새로고침 상태 관리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      if (token) {
        // 헤더가 없으면 초기화
        if (!config.headers) {
          config.headers = {};
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
      // 큐에 있는 요청들을 재시도
      resolve(apiClient(config));
    }
  });

  failedQueue = [];
};

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 관리 함수들
export const tokenManager = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async removeTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
    ]);
  },

  async isLoggedIn(): Promise<boolean> {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return !!(accessToken && refreshToken);
  },

  async getUserInfoFromToken(): Promise<{ userId: number } | null> {
    const token = await this.getAccessToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(decode(payloadBase64));
      return { userId: payload.userId || payload.sub || payload.id };
    } catch (e) {
      console.error("토큰 디코딩 실패", e);
      return null;
    }
  },

  // 레거시 호환성을 위한 메서드들
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await this.getAccessToken();
  },

  async removeToken(): Promise<void> {
    await this.removeTokens();
  }
};

// 요청 인터셉터: 모든 요청에 인증 토큰 자동 포함
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('토큰 조회 실패:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 자동 토큰 새로고침
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 토큰 새로고침이 진행 중인 경우, 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenManager.getRefreshToken();

        if (!refreshToken) {
          // 리프레시 토큰이 없으면 로그아웃 처리
          await tokenManager.removeTokens();
          processQueue(new Error('No refresh token available'), null);
          return Promise.reject(new Error('No refresh token available'));
        }

        // 토큰 새로고침 요청 - 별도의 axios 인스턴스 사용하여 무한 루프 방지
        const refreshResponse = await axios.post(`${BASE_URL}/api/user/auth/refresh`, {
          refreshToken: refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // 응답 구조 분석 및 토큰 추출
        let accessToken: string;
        let newRefreshToken: string;

        // 응답 구조에 따른 토큰 추출
        if (refreshResponse.data?.data?.accessRefreshToken) {
          // 로그인과 같은 구조인 경우
          accessToken = refreshResponse.data.data.accessRefreshToken.access.token;
          newRefreshToken = refreshResponse.data.data.accessRefreshToken.refresh.token;
        } else if (refreshResponse.data?.data?.access && refreshResponse.data?.data?.refresh) {
          // 직접 access/refresh 구조인 경우
          accessToken = refreshResponse.data.data.access.token;
          newRefreshToken = refreshResponse.data.data.refresh.token;
        } else if (refreshResponse.data?.accessToken && refreshResponse.data?.refreshToken) {
          // 직접 accessToken/refreshToken 구조인 경우
          accessToken = refreshResponse.data.accessToken;
          newRefreshToken = refreshResponse.data.refreshToken;
        } else {
          throw new Error('Invalid refresh response structure');
        }

        if (!accessToken || !newRefreshToken) {
          throw new Error('Missing tokens in refresh response');
        }

        // 새 토큰들 저장
        await tokenManager.saveTokens(accessToken, newRefreshToken);

        // axios 기본 헤더 업데이트
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // 원래 요청에 새 토큰 적용
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // 대기 중인 요청들 처리
        processQueue(null, accessToken);

        // 원래 요청 재시도
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // 토큰 새로고침 실패 시 모든 토큰 삭제
        await tokenManager.removeTokens();

        // axios 기본 헤더에서도 제거
        delete apiClient.defaults.headers.common['Authorization'];

        // 대기 중인 모든 요청들을 거부
        processQueue(refreshError, null);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API 응답 타입 정의
interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

// 로그인 관련 타입
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
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
  userId: number;
  username: string;
}

// 회원가입 관련 타입
interface RegisterRequest {
  username: string;
  password: string;
  nickName: string;
  role: string;
}

// 주문 관련 타입
interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

interface CreateOrderRequest {
  storeId: number;
  recipientName: string;
  paymentMethod: string;
  items: OrderItem[];
}

interface OrderResponse {
  orderId: string;
  paymentId: string;
  orderName: string;
  amount: number;
  buyerName: string;
  status: string;
}

// 결제 설정 관련 타입
interface PaymentConfig {
  storeId: string;
  channelKeys: {
    [key: string]: string;
  };
}

interface PreparePaymentRequest {
  storeId: number;
  items: OrderItem[];
}

// API 함수들
export const authAPI = {
  // 회원가입
  async register(data: RegisterRequest): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/api/user/auth/signup', data);
    return response.data;
  },

  // 로그인
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await apiClient.post('/api/user/auth/login', data);

    // 로그인 성공 시 토큰들 저장
    if (response.data.data?.accessRefreshToken) {
      const { access, refresh } = response.data.data.accessRefreshToken;
      await tokenManager.saveTokens(access.token, refresh.token);

      // axios 기본 헤더에도 설정
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access.token}`;
    }

    return response.data;
  },

  // 로그아웃
  async logout(): Promise<void> {
    await tokenManager.removeTokens();
    // axios 기본 헤더에서도 제거
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const orderAPI = {
  // 주문 생성
  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> {
    const response: AxiosResponse<ApiResponse<OrderResponse>> = await apiClient.post('/api/order/orders', data);
    return response.data;
  },

  // 주문 조회
  async getOrder(orderId: string): Promise<ApiResponse<OrderResponse>> {
    const response: AxiosResponse<ApiResponse<OrderResponse>> = await apiClient.get(`/api/order/orders/${orderId}`);
    return response.data;
  },

  // 내 주문 목록 조회
  async getUserOrders(page: number = 0, size: number = 10): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/users/me/orders?page=${page}&size=${size}`);
    return response.data;
  },

  // 주문 수령 등록
  async receiveOrder(orderId: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post(`/api/order/orders/${orderId}/receive`, {});
    return response.data;
  },

  // 주문 상태 변경
  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.patch(`/api/order/orders/${orderId}`, { status });
    return response.data;
  },

  // 주문 상태 조회
  async getOrderStatus(orderId: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/orders/status/${orderId}`);
    return response.data;
  },

  // 주문 취소
  async cancelOrder(orderId: string, reason: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post(`/api/order/orders/${orderId}/cancel`, { cancelReason: reason });
    return response.data;
  }
};

export const paymentAPI = {
  // 결제 설정 조회
  async getPaymentConfig(): Promise<ApiResponse<PaymentConfig>> {
    const response: AxiosResponse<ApiResponse<PaymentConfig>> = await apiClient.get('/api/order/payment/config');
    return response.data;
  },

  // 결제 준비
  async preparePayment(orderId: string, data: PreparePaymentRequest): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post(`/api/order/payment/orders/${orderId}/prepare`, data);
    return response.data;
  },

  // 결제 상태 조회
  async getPaymentStatus(paymentId: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/payment/${paymentId}/status`);
    return response.data;
  }
};

export const qrAPI = {
  // QR 코드 생성 (인증 토큰이 포함된 URL 반환)
  async getQrCodeUrl(orderId: string, size: number = 200): Promise<string> {
    const token = await tokenManager.getToken();
    // React Native에서는 Image 컴포넌트가 헤더를 지원하지 않으므로
    // 토큰을 쿼리 파라미터로 전달하거나 별도 처리가 필요
    return `${BASE_URL}/api/order/qr/orders/${orderId}?size=${size}`;
  },

  // QR 코드 이미지를 Base64로 가져오기 (React Native용)
  async getQrCodeBase64(orderId: string, size: number = 200): Promise<string> {
    try {
      const response: AxiosResponse<any> = await apiClient.get(
        `/api/order/qr/orders/${orderId}?size=${size}`,
        { responseType: 'arraybuffer' }
      );

      // ArrayBuffer를 Base64로 변환
      const base64 = encode(
        new Uint8Array(response.data)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      return `data:image/png;base64,${base64}`;
    } catch (error: any) {
      throw new Error(`QR 코드 로드 실패: ${error.response?.status || error.message}`);
    }
  },

  // 결제 QR 코드 이미지를 Base64로 가져오기
  async getPaymentQrCodeAsBase64(merchantUid: string, size: number = 200): Promise<string> {
    try {
      const response: AxiosResponse<any> = await apiClient.get(
        `/api/order/qr/payment/${merchantUid}?size=${size}`,
        { responseType: 'arraybuffer' }
      );

      const base64 = encode(
        new Uint8Array(response.data)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      return `data:image/png;base64,${base64}`;
    } catch (error: any) {
      throw new Error(`결제 QR 코드 로드 실패: ${error.response?.status || error.message}`);
    }
  }
};

// 통계 관련 API
export const statisticsAPI = {
  // 일일 통계 조회 (관리자 전용)
  async getDailyStatistics(date: string, storeId?: number): Promise<ApiResponse<any>> {
    let url = `/api/order/reports/admin/sales/daily?date=${date}`;
    if (storeId) url += `&storeId=${storeId}`;
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(url);
    return response.data;
  },

  // 주간 통계 조회 (관리자 전용)
  async getWeeklyStatistics(weekStartDate: string, storeId?: number): Promise<ApiResponse<any>> {
    let url = `/api/order/reports/admin/sales/weekly?weekStartDate=${weekStartDate}`;
    if (storeId) url += `&storeId=${storeId}`;
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(url);
    return response.data;
  },

  // 월간 통계 조회 (관리자 전용)
  async getMonthlyStatistics(year: number, month: number, storeId?: number): Promise<ApiResponse<any>> {
    let url = `/api/order/reports/admin/sales/monthly?year=${year}&month=${month}`;
    if (storeId) url += `&storeId=${storeId}`;
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(url);
    return response.data;
  }
};

// 추가 API 엔드포인트들 (coubee-be-order 백엔드 테스트용)
export const additionalAPI = {

  // 상품 관리 API
  getProductList: async (storeId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/stores/${storeId}/products`);
    return response.data;
  },

  getProductDetail: async (productId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/products/${productId}`);
    return response.data;
  },

  createProduct: async (storeId: number, productData: any): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post(`/api/order/stores/${storeId}/products`, productData);
    return response.data;
  },

  // 주문 관리 API (기존 orderAPI 확장)
  getAllOrders: async (page: number = 0, size: number = 10): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/orders?page=${page}&size=${size}`);
    return response.data;
  },

  getStoreOrders: async (storeId: number, page: number = 0, size: number = 10): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/stores/${storeId}/orders?page=${page}&size=${size}`);
    return response.data;
  },

  cancelOrder: async (orderId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.delete(`/api/order/orders/${orderId}`);
    return response.data;
  },

  // 통계 API
  getStoreStatistics: async (storeId: number, startDate?: string, endDate?: string): Promise<ApiResponse<any>> => {
    let url = `/api/order/stores/${storeId}/statistics`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(url);
    return response.data;
  },

  getDailySales: async (storeId: number, date: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/stores/${storeId}/sales/daily?date=${date}`);
    return response.data;
  },

  // 사용자 관리 API
  getUserProfile: async (userId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/user/users/${userId}/profile`);
    return response.data;
  },

  updateUserProfile: async (userId: number, profileData: any): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(`/api/user/users/${userId}/profile`, profileData);
    return response.data;
  },

  // 알림 API
  getNotificationList: async (userId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/users/${userId}/notifications`);
    return response.data;
  },

  markNotificationAsRead: async (notificationId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.patch(`/api/order/notifications/${notificationId}/read`);
    return response.data;
  },

  // 리뷰 API
  getProductReviews: async (productId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/products/${productId}/reviews`);
    return response.data;
  },

  createReview: async (orderId: string, reviewData: any): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post(`/api/order/orders/${orderId}/review`, reviewData);
    return response.data;
  },

  // 쿠폰 API
  getUserCoupons: async (userId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/users/${userId}/coupons`);
    return response.data;
  },

  useCoupon: async (couponId: number, orderId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post(`/api/order/coupons/${couponId}/use`, { orderId: orderId });
    return response.data;
  }
};

export default apiClient;
