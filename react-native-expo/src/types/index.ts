// 공통 타입 정의

export interface User {
  userId: number;
  username: string;
  nickName?: string;
  role: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId: string;
  paymentId: string;
  orderName: string;
  amount: number;
  buyerName: string;
  status: string;
  storeId: number;
  recipientName: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentConfig {
  storeId: string;
  channelKeys: {
    [key: string]: string;
  };
}

export type PaymentMethod = 'CARD' | 'KAKAOPAY' | 'TOSSPAY';

export type OrderStatus = 
  | 'PENDING'    // 결제 대기
  | 'PAID'       // 결제 완료
  | 'PREPARING'  // 준비 중
  | 'PREPARED'   // 준비 완료
  | 'RECEIVED'   // 수령 완료
  | 'CANCELLED'  // 취소
  | 'FAILED';    // 실패

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '준비 중',
  PREPARED: '준비 완료',
  RECEIVED: '수령 완료',
  CANCELLED: '취소',
  FAILED: '실패'
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: '신용카드',
  KAKAOPAY: '카카오페이',
  TOSSPAY: '토스페이'
};
