import { authAPI, orderAPI, paymentAPI, qrAPI, additionalAPI } from '../api/client';

export interface ParameterInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  example?: string;
}

export interface ApiEndpoint {
  name: string;
  description: string;
  category: string;
  func: (parameters?: Record<string, string>) => Promise<any>;
  parameterList?: ParameterInfo[];
  httpMethod?: string;
  endpointUrl?: string;
}

// 전체 API 엔드포인트 목록 (coubee-be-order 백엔드의 모든 엔드포인트)
export const getAllApiList = (userId: number): ApiEndpoint[] => [
  // 🔐 인증 관련 API
  {
    name: '로그아웃',
    description: '현재 사용자를 로그아웃합니다',
    category: '🔐 인증',
    func: () => authAPI.logout(),
    httpMethod: 'POST',
    endpointUrl: '/api/user/auth/logout'
  },

  // 📦 주문 관리 API
  {
    name: '사용자 주문 목록 조회',
    description: '현재 사용자의 주문 목록을 페이지네이션으로 조회합니다',
    category: '📦 주문 관리',
    func: (parameters) => {
      const page = parseInt(parameters?.page || '0');
      const size = parseInt(parameters?.size || '10');
      return orderAPI.getUserOrders(userId, page, size);
    },
    parameterList: [
      {
        name: 'page',
        type: '숫자',
        required: false,
        defaultValue: '0',
        description: '조회할 페이지 번호 (0부터 시작)',
        example: '0'
      },
      {
        name: 'size',
        type: '숫자',
        required: false,
        defaultValue: '10',
        description: '한 페이지당 표시할 주문 수',
        example: '10'
      }
    ],
    httpMethod: 'GET',
    endpointUrl: `/api/order/users/${userId}/orders`
  },

  {
    name: '전체 주문 목록 조회',
    description: '시스템의 모든 주문 목록을 조회합니다 (관리자용)',
    category: '📦 주문 관리',
    func: (parameters) => {
      const page = parseInt(parameters?.page || '0');
      const size = parseInt(parameters?.size || '10');
      return additionalAPI.getAllOrders(page, size);
    },
    parameterList: [
      {
        name: 'page',
        type: '숫자',
        required: false,
        defaultValue: '0',
        description: '조회할 페이지 번호',
        example: '0'
      },
      {
        name: 'size',
        type: '숫자',
        required: false,
        defaultValue: '10',
        description: '한 페이지당 표시할 주문 수',
        example: '10'
      }
    ],
    httpMethod: 'GET',
    endpointUrl: '/api/order/orders'
  },

  {
    name: '주문 상세 조회',
    description: '특정 주문의 상세 정보를 조회합니다',
    category: '📦 주문 관리',
    func: (parameters) => orderAPI.getOrder(parameters?.orderId || '1'),
    parameterList: [
      {
        name: 'orderId',
        type: '문자열',
        required: true,
        description: '조회할 주문의 고유 식별자',
        example: 'ORDER_123456789'
      }
    ],
    httpMethod: 'GET',
    endpointUrl: '/api/order/orders/{orderId}'
  },

  // 💳 결제 관련 API
  {
    name: '결제 설정 조회',
    description: '시스템의 결제 설정 정보를 조회합니다',
    category: '💳 결제',
    func: () => paymentAPI.getPaymentConfig(),
    httpMethod: 'GET',
    endpointUrl: '/api/order/payment/config'
  },

  // 📱 QR 코드 관련 API
  {
    name: 'QR 코드 URL 조회',
    description: '주문 수령용 QR 코드 URL을 생성합니다',
    category: '📱 QR 코드',
    func: async (parameters) => {
      const size = parseInt(parameters?.size || '200');
      const url = await qrAPI.getQrCodeUrl(parameters?.orderId || '1', size);
      return { qrUrl: url, size };
    },
    parameterList: [
      {
        name: 'orderId',
        type: '문자열',
        required: true,
        description: 'QR 코드를 생성할 주문의 ID',
        example: 'ORDER_123456789'
      }
    ],
    httpMethod: 'GET',
    endpointUrl: '/api/order/qr/orders/{orderId}'
  },

  // 🏪 매장 관리 API
  {
    name: '매장 목록 조회',
    description: '시스템에 등록된 모든 매장 목록을 조회합니다',
    category: '🏪 매장 관리',
    func: () => additionalAPI.getStoreList(),
    httpMethod: 'GET',
    endpointUrl: '/api/order/stores'
  }
];

// 카테고리별 API 그룹화 함수
export const groupApisByCategory = (apiList: ApiEndpoint[]): Record<string, ApiEndpoint[]> => {
  return apiList.reduce((groups, api) => {
    const category = api.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(api);
    return groups;
  }, {} as Record<string, ApiEndpoint[]>);
};

// API 검색 함수
export const searchApis = (apiList: ApiEndpoint[], searchTerm: string): ApiEndpoint[] => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return apiList.filter(api =>
    api.name.toLowerCase().indexOf(lowerSearchTerm) !== -1 ||
    api.description.toLowerCase().indexOf(lowerSearchTerm) !== -1 ||
    api.category.toLowerCase().indexOf(lowerSearchTerm) !== -1
  );
};