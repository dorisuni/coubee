import { authAPI, orderAPI, paymentAPI, qrAPI, 추가API } from '../api/client';

export interface 매개변수정보 {
  이름: string;
  타입: string;
  필수여부: boolean;
  기본값?: string;
  설명?: string;
  예시?: string;
}

export interface API엔드포인트 {
  이름: string;
  설명: string;
  카테고리: string;
  함수: (매개변수들?: Record<string, string>) => Promise<any>;
  매개변수목록?: 매개변수정보[];
  HTTP메서드?: string;
  엔드포인트URL?: string;
}

export const 전체API목록 = (사용자아이디: number): API엔드포인트[] => [
  // 🔐 인증 관련 API
  {
    이름: '로그아웃',
    설명: '현재 사용자를 로그아웃합니다',
    카테고리: '🔐 인증',
    함수: () => authAPI.logout(),
    HTTP메서드: 'POST',
    엔드포인트URL: '/api/user/auth/logout'
  },

  // 📦 주문 관리 API
  {
    이름: '사용자 주문 목록 조회',
    설명: '현재 사용자의 주문 목록을 페이지네이션으로 조회합니다',
    카테고리: '📦 주문 관리',
    함수: (매개변수들) => {
      const 페이지 = parseInt(매개변수들?.페이지 || '0');
      const 크기 = parseInt(매개변수들?.크기 || '10');
      return orderAPI.getUserOrders(사용자아이디, 페이지, 크기);
    },
    매개변수목록: [
      {
        이름: '페이지',
        타입: '숫자',
        필수여부: false,
        기본값: '0',
        설명: '조회할 페이지 번호 (0부터 시작)',
        예시: '0'
      },
      {
        이름: '크기',
        타입: '숫자',
        필수여부: false,
        기본값: '10',
        설명: '한 페이지당 표시할 주문 수',
        예시: '10'
      }
    ],
    HTTP메서드: 'GET',
    엔드포인트URL: `/api/order/users/${사용자아이디}/orders`
  },

  {
    이름: '전체 주문 목록 조회',
    설명: '시스템의 모든 주문 목록을 조회합니다 (관리자용)',
    카테고리: '📦 주문 관리',
    함수: (매개변수들) => {
      const 페이지 = parseInt(매개변수들?.페이지 || '0');
      const 크기 = parseInt(매개변수들?.크기 || '10');
      return 추가API.전체주문목록조회(페이지, 크기);
    },
    매개변수목록: [
      {
        이름: '페이지',
        타입: '숫자',
        필수여부: false,
        기본값: '0',
        설명: '조회할 페이지 번호',
        예시: '0'
      },
      {
        이름: '크기',
        타입: '숫자',
        필수여부: false,
        기본값: '10',
        설명: '한 페이지당 표시할 주문 수',
        예시: '10'
      }
    ],
    HTTP메서드: 'GET',
    엔드포인트URL: '/api/order/orders'
  },

  {
    이름: '주문 상세 조회',
    설명: '특정 주문의 상세 정보를 조회합니다',
    카테고리: '📦 주문 관리',
    함수: (매개변수들) => orderAPI.getOrder(매개변수들?.주문ID || '1'),
    매개변수목록: [
      {
        이름: '주문ID',
        타입: '문자열',
        필수여부: true,
        설명: '조회할 주문의 고유 식별자',
        예시: 'ORDER_123456789'
      }
    ],
    HTTP메서드: 'GET',
    엔드포인트URL: '/api/order/orders/{주문ID}'
  },

  {
    이름: '주문 수령 등록',
    설명: '주문이 수령되었음을 시스템에 등록합니다',
    카테고리: '📦 주문 관리',
    함수: (매개변수들) => orderAPI.receiveOrder(매개변수들?.주문ID || '1'),
    매개변수목록: [
      {
        이름: '주문ID',
        타입: '문자열',
        필수여부: true,
        설명: '수령할 주문의 고유 식별자',
        예시: 'ORDER_123456789'
      }
    ],
    HTTP메서드: 'POST',
    엔드포인트URL: '/api/order/orders/{주문ID}/receive'
  },

  {
    이름: '주문 상태 변경',
    설명: '주문의 상태를 변경합니다',
    카테고리: '📦 주문 관리',
    함수: (매개변수들) => orderAPI.updateOrderStatus(
      매개변수들?.주문ID || '1',
      매개변수들?.상태 || 'COMPLETED'
    ),
    매개변수목록: [
      {
        이름: '주문ID',
        타입: '문자열',
        필수여부: true,
        설명: '상태를 변경할 주문의 ID',
        예시: 'ORDER_123456789'
      },
      {
        이름: '상태',
        타입: '문자열',
        필수여부: true,
        설명: '변경할 주문 상태 (PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED)',
        예시: 'COMPLETED'
      }
    ],
    HTTP메서드: 'PATCH',
    엔드포인트URL: '/api/order/orders/{주문ID}'
  },

  {
    이름: '주문 취소',
    설명: '특정 주문을 취소합니다',
    카테고리: '📦 주문 관리',
    함수: (매개변수들) => 추가API.주문취소(매개변수들?.주문ID || '1'),
    매개변수목록: [
      {
        이름: '주문ID',
        타입: '문자열',
        필수여부: true,
        설명: '취소할 주문의 고유 식별자',
        예시: 'ORDER_123456789'
      }
    ],
    HTTP메서드: 'DELETE',
    엔드포인트URL: '/api/order/orders/{주문ID}'
  },

  // 💳 결제 관련 API
  {
    이름: '결제 설정 조회',
    설명: '시스템의 결제 설정 정보를 조회합니다',
    카테고리: '💳 결제',
    함수: () => paymentAPI.getPaymentConfig(),
    HTTP메서드: 'GET',
    엔드포인트URL: '/api/order/payment/config'
  },

  {
    이름: '결제 준비',
    설명: '주문에 대한 결제를 준비합니다',
    카테고리: '💳 결제',
    함수: (매개변수들) => {
      const 준비데이터 = {
        storeId: parseInt(매개변수들?.매장ID || '1'),
        items: [{
          productId: parseInt(매개변수들?.상품ID || '1'),
          name: 매개변수들?.상품명 || '테스트 상품',
          quantity: parseInt(매개변수들?.수량 || '1'),
          price: parseInt(매개변수들?.가격 || '1000')
        }]
      };
      return paymentAPI.preparePayment(매개변수들?.주문ID || '1', 준비데이터);
    },
    매개변수목록: [
      {
        이름: '주문ID',
        타입: '문자열',
        필수여부: true,
        설명: '결제할 주문의 ID',
        예시: 'ORDER_123456789'
      },
      {
        이름: '매장ID',
        타입: '숫자',
        필수여부: true,
        설명: '매장 식별자',
        예시: '1'
      },
      {
        이름: '상품ID',
        타입: '숫자',
        필수여부: true,
        설명: '상품 식별자',
        예시: '1'
      },
      {
        이름: '상품명',
        타입: '문자열',
        필수여부: true,
        설명: '상품 이름',
        예시: '아메리카노'
      },
      {
        이름: '수량',
        타입: '숫자',
        필수여부: true,
        설명: '주문 수량',
        예시: '2'
      },
      {
        이름: '가격',
        타입: '숫자',
        필수여부: true,
        설명: '단위 가격',
        예시: '4500'
      }
    ],
    HTTP메서드: 'POST',
    엔드포인트URL: '/api/order/payment/orders/{주문ID}/prepare'
  },

  {
    이름: '결제 상태 조회',
    설명: '특정 결제의 현재 상태를 조회합니다',
    카테고리: '💳 결제',
    함수: (매개변수들) => paymentAPI.getPaymentStatus(매개변수들?.결제ID || '1'),
    매개변수목록: [
      {
        이름: '결제ID',
        타입: '문자열',
        필수여부: true,
        설명: '조회할 결제의 고유 식별자',
        예시: 'PAYMENT_123456789'
      }
    ],
    HTTP메서드: 'GET',
    엔드포인트URL: '/api/order/payment/{결제ID}/status'
  },

  // 📱 QR 코드 관련 API
  {
    이름: 'QR 코드 URL 조회',
    설명: '주문 수령용 QR 코드 URL을 생성합니다',
    카테고리: '📱 QR 코드',
    함수: async (매개변수들) => {
      const 크기 = parseInt(매개변수들?.크기 || '200');
      const url = await qrAPI.getQrCodeUrl(매개변수들?.주문ID || '1', 크기);
      return { qrUrl: url, 크기 };
    },
    매개변수목록: [
      {
        이름: '주문ID',
        타입: '문자열',
        필수여부: true,
        설명: 'QR 코드를 생성할 주문의 ID',
        예시: 'ORDER_123456789'
      },
      {
        이름: '크기',
        타입: '숫자',
        필수여부: false,
        기본값: '200',
        설명: 'QR 코드 이미지 크기 (픽셀)',
        예시: '300'
      }
    ],
    HTTP메서드: 'GET',
    엔드포인트URL: '/api/order/qr/orders/{주문ID}'
  },

  {
    이름: 'QR 코드 Base64 이미지 조회',
    설명: '주문 수령용 QR 코드를 Base64 인코딩된 이미지로 조회합니다',
    카테고리: '📱 QR 코드',
    함수: async (매개변수들) => {
      const 크기 = parseInt(매개변수들?.크기 || '200');
      const base64 = await qrAPI.getQrCodeBase64(매개변수들?.주문ID || '1', 크기);
      return { qrBase64: base64, 크기 };
    },
    매개변수목록: [
      {
        이름: '주문ID',
        타입: '문자열',
        필수여부: true,
        설명: 'QR 코드를 생성할 주문의 ID',
        예시: 'ORDER_123456789'
      },
      {
        이름: '크기',
        타입: '숫자',
        필수여부: false,
        기본값: '200',
        설명: 'QR 코드 이미지 크기 (픽셀)',
        예시: '300'
      }
    ],
    HTTP메서드: 'GET',
    엔드포인트URL: '/api/order/qr/orders/{주문ID}'
  }
];

// 카테고리별 API 그룹화 함수
export const 카테고리별API그룹화 = (API목록: API엔드포인트[]): Record<string, API엔드포인트[]> => {
  return API목록.reduce((그룹, api) => {
    const 카테고리 = api.카테고리;
    if (!그룹[카테고리]) {
      그룹[카테고리] = [];
    }
    그룹[카테고리].push(api);
    return 그룹;
  }, {} as Record<string, API엔드포인트[]>);
};

// API 검색 함수
export const API검색 = (API목록: API엔드포인트[], 검색어: string): API엔드포인트[] => {
  const 소문자검색어 = 검색어.toLowerCase();
  return API목록.filter(api => 
    api.이름.toLowerCase().includes(소문자검색어) ||
    api.설명.toLowerCase().includes(소문자검색어) ||
    api.카테고리.toLowerCase().includes(소문자검색어)
  );
};
