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
    name: '주문 생성',
    description: '새로운 주문을 생성합니다.',
    category: '📦 주문 관리',
    func: (params) => orderAPI.createOrder({
      storeId: parseInt(params?.storeId || '1'),
      recipientName: params?.recipientName || '테스트',
      paymentMethod: params?.paymentMethod || 'CARD',
      totalAmount: parseInt(params?.totalAmount || '1000'),
      items: JSON.parse(params?.items || '[{"productId":1,"name":"상품","quantity":1,"price":1000}]'),
    }),
    parameterList: [
      { name: 'storeId', type: '숫자', required: true, defaultValue: '1' },
      { name: 'recipientName', type: '문자열', required: true, defaultValue: '홍길동' },
      { name: 'paymentMethod', type: '문자열', required: true, defaultValue: 'CARD' },
      { name: 'totalAmount', type: '숫자', required: true, defaultValue: '1000' },
      { name: 'items', type: 'JSON', required: true, defaultValue: '[{"productId":1,"name":"상품","quantity":1,"price":1000}]' },
    ],
    httpMethod: 'POST',
    endpointUrl: '/api/order/orders'
  },
  {
    name: '주문 상세 조회',
    description: '특정 주문의 상세 정보를 조회합니다',
    category: '📦 주문 관리',
    func: (parameters) => orderAPI.getOrder(parameters?.orderId || '1'),
    parameterList: [
      { name: 'orderId', type: '문자열', required: true, description: '조회할 주문의 고유 식별자' }
    ],
    httpMethod: 'GET',
    endpointUrl: '/api/order/orders/{orderId}'
  },
  {
    name: '주문 상태 조회',
    description: '특정 주문의 현재 상태를 조회합니다.',
    category: '📦 주문 관리',
    func: (params) => orderAPI.getOrderStatus(params?.orderId || ''),
    parameterList: [
      { name: 'orderId', type: '문자열', required: true, description: '조회할 주문 ID' },
    ],
    httpMethod: 'GET',
    endpointUrl: '/api/order/orders/status/{orderId}'
  },
  {
    name: '내 주문 목록 상세 조회',
    description: '인증된 사용자의 주문 목록을 페이지네이션으로 상세 조회합니다',
    category: '📦 주문 관리',
    func: (parameters) => {
      const page = parseInt(parameters?.page || '0');
      const size = parseInt(parameters?.size || '10');
      return orderAPI.getUserOrders(page, size);
    },
    parameterList: [
      { name: 'page', type: '숫자', required: false, defaultValue: '0' },
      { name: 'size', type: '숫자', required: false, defaultValue: '10' }
    ],
    httpMethod: 'GET',
    endpointUrl: '/api/order/users/me/orders'
  },
  {
    name: '주문 취소',
    description: '특정 주문을 취소합니다. 취소 사유가 필요합니다.',
    category: '📦 주문 관리',
    func: (params) => orderAPI.cancelOrder(params?.orderId || '', params?.cancelReason || '단순 변심'),
    parameterList: [
      { name: 'orderId', type: '문자열', required: true, description: '취소할 주문 ID' },
      { name: 'cancelReason', type: '문자열', required: true, defaultValue: '단순 변심', description: '주문 취소 사유' },
    ],
    httpMethod: 'POST',
    endpointUrl: '/api/order/orders/{orderId}/cancel'
  },
  {
    name: '주문 수령 등록',
    description: '주문한 상품을 수령했음을 등록합니다.',
    category: '📦 주문 관리',
    func: (params) => orderAPI.receiveOrder(params?.orderId || ''),
    parameterList: [
      { name: 'orderId', type: '문자열', required: true, description: '수령 등록할 주문 ID' },
    ],
    httpMethod: 'POST',
    endpointUrl: '/api/order/orders/{orderId}/receive'
  },
  {
    name: '주문 상태 변경 (관리자)',
    description: '주문의 상태를 단계별로 변경합니다. (관리자용)',
    category: '📦 주문 관리',
    func: (params) => orderAPI.updateOrderStatus(params?.orderId || '', params?.status || ''),
    parameterList: [
      { name: 'orderId', type: '문자열', required: true, description: '상태 변경할 주문 ID' },
    ],
    httpMethod: 'PATCH',
    endpointUrl: '/api/order/orders/{orderId}',
    customComponent: 'OrderStatusUpdateModal', // 전용 컴포넌트 사용을 위한 식별자
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
  {
    name: '결제 준비',
    description: '결제를 시작하기 전에 서버에 결제 정보를 등록합니다.',
    category: '💳 결제',
    func: (params) => paymentAPI.preparePayment(params?.orderId || '', {
      storeId: parseInt(params?.storeId || '1'),
      items: JSON.parse(params?.items || '[{"productId":1,"name":"상품","quantity":1,"price":1000}]'),
    }),
    parameterList: [
      { name: 'orderId', type: '문자열', required: true, description: '결제를 준비할 주문 ID' },
      { name: 'storeId', type: '숫자', required: true, defaultValue: '1' },
      { name: 'items', type: 'JSON', required: true, defaultValue: '[{"productId":1,"name":"상품","quantity":1,"price":1000}]' },
    ],
    httpMethod: 'POST',
    endpointUrl: '/api/order/payment/orders/{orderId}/prepare'
  },
  {
    name: '결제 상태 조회',
    description: '특정 결제의 상태를 조회합니다.',
    category: '💳 결제',
    func: (params) => paymentAPI.getPaymentStatus(params?.paymentId || ''),
    parameterList: [
      { name: 'paymentId', type: '문자열', required: true, description: '조회할 결제 ID' },
    ],
    httpMethod: 'GET',
    endpointUrl: '/api/order/payment/{paymentId}/status'
  },

  // 📱 QR 코드 관련 API
  {
    name: '주문 QR 코드 생성',
    description: '주문 수령용 QR 코드를 생성합니다 (Base64 이미지)',
    category: '📱 QR 코드',
    func: (params) => qrAPI.getQrCodeBase64(params?.orderId || '', parseInt(params?.size || '200')),
    parameterList: [
      { name: 'orderId', type: '문자열', required: true, description: 'QR 코드를 생성할 주문 ID' },
      { name: 'size', type: '숫자', required: false, defaultValue: '200' },
    ],
    httpMethod: 'GET',
    endpointUrl: '/api/order/qr/orders/{orderId}'
  },
  {
    name: '결제 QR 코드 생성',
    description: '결제용 QR 코드를 생성합니다 (Base64 이미지)',
    category: '📱 QR 코드',
    func: (params) => qrAPI.getPaymentQrCodeAsBase64(params?.merchantUid || '', parseInt(params?.size || '200')),
    parameterList: [
      { name: 'merchantUid', type: '문자열', required: true, description: 'QR 코드를 생성할 결제 주문 번호' },
      { name: 'size', type: '숫자', required: false, defaultValue: '200' },
    ],
    httpMethod: 'GET',
    endpointUrl: '/api/order/qr/payment/{merchantUid}'
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
