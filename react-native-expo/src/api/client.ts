import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { encode, decode } from 'base-64';

// API 기본 설정
const BASE_URL = 'https://coubee-api.murkui.com';
const TOKEN_KEY = 'accessToken';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 인증 토큰 자동 포함
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
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

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 토큰 삭제
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// 토큰 관리 함수들
export const tokenManager = {
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return !!token;
  },

  async getUserInfoFromToken(): Promise<{ userId: number } | null> {
    const token = await this.getToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(decode(payloadBase64));
      return { userId: payload.userId || payload.sub || payload.id };
    } catch (e) {
      console.error("토큰 디코딩 실패", e);
      return null;
    }
  }
};

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
  totalAmount: number;
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
    return response.data;
  },

  // 로그아웃
  async logout(): Promise<void> {
    await tokenManager.removeToken();
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

  // 사용자 주문 목록 조회
  async getUserOrders(userId: number, page: number = 0, size: number = 10): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/users/${userId}/orders?page=${page}&size=${size}`);
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
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(`/api/order/orders/${orderId}/status`);
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
