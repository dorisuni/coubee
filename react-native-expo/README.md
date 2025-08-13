# 🍯 Coubee 결제 앱 (React Native Expo)

이 프로젝트는 Coubee 백엔드 API와 PortOne V2 결제 시스템을 통합한 완전한 모바일 결제 애플리케이션입니다.

## 📋 프로젝트 개요

Coubee 결제 앱은 매장에서 주문과 결제를 처리하는 모바일 애플리케이션입니다. 고객은 앱을 통해 상품을 주문하고, 다양한 결제 수단으로 결제한 후, QR 코드를 통해 주문을 수령할 수 있습니다.

### ✅ 주요 기능
- **사용자 인증**: 로그인/회원가입 기능
- **동적 주문 생성**: 백엔드 API를 통한 실시간 주문 생성
- **결제 처리**: PortOne V2를 통한 다양한 결제 수단 지원
  - 신용카드
  - 카카오페이
  - 토스페이
- **QR 코드 생성**: 결제 완료 후 수령용 QR 코드 자동 생성
- **보안 토큰 관리**: Expo SecureStore를 통한 안전한 토큰 저장

### 🔧 기술 스택
- **React Native**: 0.76.3
- **Expo**: ^53.0.20
- **PortOne React Native SDK**: ^0.4.0-alpha.1
- **Axios**: API 통신
- **Expo SecureStore**: 보안 토큰 저장
- **TypeScript**: 타입 안전성

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18.x 이상
- npm 또는 yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (Android 개발용)
- Xcode (iOS 개발용, macOS만)

### 환경 변수 설정
프로젝트 실행 전에 백엔드 API 서버가 실행되어야 합니다:
- **개발 환경**: `http://localhost:8080` (기본값)
- **운영 환경**: `https://coubee-api.murkui.com`

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 시작
```bash
npx expo start
```

### 3. 앱 실행
- **Android**: Expo Go 앱에서 QR 코드 스캔
- **iOS**: 카메라 앱에서 QR 코드 스캔
- **개발 빌드**: `npx expo run:android` 또는 `npx expo run:ios`

## 📱 사용 방법

### 1. 로그인
- 기본 테스트 계정: `test_user` / `1234`
- 또는 새 계정 회원가입

### 2. 주문 및 결제
1. 매장 ID, 수령인 이름 입력
2. 결제 방법 선택 (카드/카카오페이/토스페이)
3. 상품 정보 입력 (상품명, 수량, 단가)
4. "결제 시작" 버튼 클릭
5. PortOne 결제창에서 결제 진행

### 3. QR 코드 수령
- 결제 완료 후 자동으로 QR 코드 모달 표시
- 매장에서 QR 코드를 스캔하여 주문 수령

## 🏗️ 프로젝트 구조

```
react-native-expo/
├── App.tsx                # 메인 앱 컴포넌트
├── app.json              # Expo 설정 파일
├── package.json          # 의존성 및 스크립트
├── tsconfig.json         # TypeScript 설정
├── babel.config.js       # Babel 설정
├── assets/               # 이미지 및 아이콘
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
└── src/
    ├── api/
    │   └── client.ts     # API 클라이언트 및 인증 관리
    ├── screens/
    │   ├── LoginScreen.tsx    # 로그인/회원가입 화면
    │   └── MainScreen.tsx     # 메인 결제 화면
    └── types/
        └── index.ts      # TypeScript 타입 정의
```

## 🔐 백엔드 API 레퍼런스

이 섹션은 프론트엔드 개발자가 백엔드 API를 올바르게 사용할 수 있도록 상세한 정보를 제공합니다.

### 🔑 인증 시스템

모든 API 요청은 JWT 토큰을 통한 인증이 필요합니다 (일부 공개 엔드포인트 제외).

#### 인증 헤더
```
Authorization: Bearer {JWT_TOKEN}
```

#### 자동 추가되는 헤더 (Gateway에서 처리)
- `X-Auth-UserId`: 사용자 ID
- `X-Auth-UserName`: 사용자명
- `X-Auth-UserNickName`: 사용자 닉네임
- `X-Auth-Role`: 사용자 역할 (USER, ADMIN, SUPER_ADMIN)

### 📝 주문 관리 API

#### 1. 주문 생성
**POST** `/api/order/orders`

**인증**: 필수 (`X-Auth-UserId` 헤더 필요)

**요청 본문**:
```json
{
  "storeId": 1,
  "recipientName": "홍길동",
  "paymentMethod": "CARD",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

**요청 필드**:
| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| storeId | Long | ✅ | 매장 ID | 1 |
| recipientName | String | ✅ | 수령인 이름 | "홍길동" |
| paymentMethod | String | ✅ | 결제 방법 | "CARD", "KAKAOPAY", "TOSSPAY" |
| items | Array | ✅ | 주문 상품 목록 | - |
| items[].productId | Long | ✅ | 상품 ID | 1 |
| items[].quantity | Integer | ✅ | 주문 수량 (최소 1) | 2 |

**응답 (201 Created)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "데이터 생성 요청이 성공하였습니다.",
  "data": {
    "orderId": "order_b7833686f25b48e0862612345678abcd",
    "paymentId": "order_b7833686f25b48e0862612345678abcd",
    "amount": 200,
    "orderName": "테스트 상품 1 외 1건",
    "buyerName": "홍길동"
  }
}
```

#### 2. 주문 상세 조회
**GET** `/api/order/orders/{orderId}`

**인증**: 불필요 (공개 엔드포인트)

**경로 매개변수**:
| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| orderId | String | 주문 ID | order_b7833686f25b48e0862612345678abcd |

**응답 (200 OK)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "조회 성공",
  "data": {
    "orderId": "order_b7833686f25b48e0862612345678abcd",
    "userId": 1,
    "storeId": 1,
    "status": "PAID",
    "totalAmount": 200,
    "recipientName": "홍길동",
    "orderToken": "abcdef123456",
    "orderQR": "b3JkZXJfYjc4MzM2ODZmMjViNDhlMDg2MjYxMjM0NTY3OGFiY2Q=",
    "createdAt": "2023-06-01T14:30:00",
    "paidAtUnix": 1672531200,
    "items": [
      {
        "productId": 1,
        "productName": "테스트 상품 1",
        "quantity": 2,
        "price": 100,
        "totalPrice": 200,
        "eventType": "PURCHASE"
      }
    ],
    "payment": {
      "paymentId": "payment_01H1J5BFXCZDMG8RP0WCTFSN5Y",
      "pgProvider": "kakaopay",
      "method": "card",
      "amount": 25000,
      "status": "PAID",
      "paidAt": "2023-06-01T14:35:00"
    }
  }
}
```

#### 3. 주문 상태 조회
**GET** `/api/order/orders/status/{orderId}`

**인증**: 불필요 (공개 엔드포인트)

**경로 매개변수**:
| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| orderId | String | 주문 ID | order_01H1J5BFXCZDMG8RP0WCTFSN5Y |

**응답 (200 OK)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "조회 성공",
  "data": {
    "orderId": "order_01H1J5BFXCZDMG8RP0WCTFSN5Y",
    "status": "PAID"
  }
}
```

**주문 상태 값**:
| 상태 | 설명 |
|------|------|
| PENDING | 결제 대기 |
| PAID | 결제 완료 |
| PREPARING | 준비 중 |
| PREPARED | 준비 완료 |
| RECEIVED | 수령 완료 |
| CANCELLED | 취소 |
| FAILED | 실패 |

#### 4. 사용자 주문 목록 조회
**GET** `/api/order/users/{userId}/orders`

**인증**: 필수

**경로 매개변수**:
| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| userId | Long | 사용자 ID | 1 |

**쿼리 매개변수**:
| 매개변수 | 타입 | 기본값 | 설명 | 예시 |
|----------|------|--------|------|------|
| page | int | 0 | 페이지 번호 | 0 |
| size | int | 10 | 페이지 크기 | 10 |

**응답 (200 OK)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "조회 성공",
  "data": {
    "orders": [
      {
        "orderId": "order_01H1J5BFXCZDMG8RP0WCTFSN5Y",
        "storeId": 1,
        "status": "PAID",
        "totalAmount": 25000,
        "createdAt": "2023-06-01T14:30:00",
        "orderName": "테스트 상품 1 외 1건"
      }
    ],
    "pageInfo": {
      "page": 0,
      "size": 10,
      "totalPages": 5,
      "totalElements": 42,
      "first": true,
      "last": false
    }
  }
}
```

#### 5. 주문 수령 처리
**POST** `/api/order/orders/{orderId}/receive`

**인증**: 불필요 (공개 엔드포인트)

**경로 매개변수**:
| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| orderId | String | 주문 ID | order_b7833686f25b48e0862612345678abcd |

**응답 (201 Created)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "데이터 생성 요청이 성공하였습니다.",
  "data": {
    "orderId": "order_b7833686f25b48e0862612345678abcd",
    "status": "RECEIVED",
    // ... 기타 주문 상세 정보
  }
}
```

#### 6. 주문 취소
**POST** `/api/order/orders/{orderId}/cancel`

**인증**: 필수

**경로 매개변수**:
| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| orderId | String | 주문 ID | order_b7833686f25b48e0862612345678abcd |

**요청 본문**:
```json
{
  "cancelReason": "고객 요청에 의한 취소"
}
```

**요청 필드**:
| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| cancelReason | String | ✅ | 취소 사유 | "고객 요청에 의한 취소" |

**응답 (201 Created)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "데이터 생성 요청이 성공하였습니다.",
  "data": {
    "orderId": "order_b7833686f25b48e0862612345678abcd",
    "status": "CANCELLED",
    // ... 기타 주문 상세 정보
  }
}
```

#### 7. 주문 상태 업데이트 (관리자 전용)
**PATCH** `/api/order/orders/{orderId}`

**인증**: 필수 (ADMIN 또는 SUPER_ADMIN 권한 필요)

**경로 매개변수**:
| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| orderId | String | 주문 ID | order_b7833686f25b48e0862612345678abcd |

**요청 본문**:
```json
{
  "status": "PREPARING",
  "reason": "음식 준비 시작"
}
```

**요청 필드**:
| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| status | String | ✅ | 새로운 주문 상태 | "PREPARING" |
| reason | String | ❌ | 상태 변경 사유 (최대 500자) | "음식 준비 시작" |

**응답 (200 OK)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "Order status has been updated",
  "data": {
    "orderId": "order_533d1397b23848638b6b177e93c941f9",
    "previousStatus": "PAID",
    "currentStatus": "PREPARING",
    "reason": "음식 준비 시작",
    "updatedAt": "2025-01-23T10:05:25",
    "updatedByUserId": 123
  }
}
```

### 💳 결제 관리 API

#### 1. 결제 설정 조회
**GET** `/api/order/payment/config`

**인증**: 필수

**응답 (200 OK)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "조회 성공",
  "data": {
    "storeId": "store-12345678-1234-1234-1234-123456789012",
    "channelKeys": {
      "CARD": "channel-key-card-12345678-1234-1234-1234-123456789012",
      "KAKAOPAY": "channel-key-kakaopay-12345678-1234-1234-1234-123456789012",
      "TOSSPAY": "channel-key-tosspay-12345678-1234-1234-1234-123456789012"
    }
  }
}
```

#### 2. 결제 준비
**POST** `/api/order/payment/orders/{orderId}/prepare`

**인증**: 필수

**경로 매개변수**:
| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| orderId | String | 주문 ID | order_b7833686f25b48e0862612345678abcd |

**요청 본문**:
```json
{
  "storeId": 1,
  "items": [
    {
      "itemId": 11,
      "quantity": 2
    }
  ]
}
```

**요청 필드**:
| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| storeId | Long | ✅ | 매장 ID | 1 |
| items | Array | ✅ | 결제 상품 목록 | - |
| items[].itemId | Long | ✅ | 상품 ID | 11 |
| items[].quantity | Integer | ✅ | 구매 수량 | 2 |

**응답 (200 OK)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "데이터 생성 요청이 성공하였습니다.",
  "data": {
    "buyerName": "홍길동",
    "name": "테스트 상품 1 외 1건",
    "amount": 200,
    "merchantUid": "order_b7833686f25b48e0862612345678abcd"
  }
}
```

#### 3. 결제 상태 조회
**GET** `/api/order/payment/{paymentId}/status`

**인증**: 필수

**경로 매개변수**:
| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| paymentId | String | 결제 ID | imp_123456789 |

**응답 (200 OK)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "조회 성공",
  "data": {
    // PortOne SDK의 PaymentGetResponse 객체
    "id": "imp_123456789",
    "status": "PAID",
    "amount": {
      "total": 200,
      "currency": "KRW"
    },
    "paidAt": "2023-06-01T14:35:00Z"
    // ... 기타 결제 정보
  }
}
```

### � QR 코드 API

#### 1. 주문 QR 코드 생성
**GET** `/api/order/qr/orders/{orderId}`

**인증**: 필수

**경로 매개변수**:
| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| orderId | String | 주문 ID | order_b7833686f25b48e0862612345678abcd |

**쿼리 매개변수**:
| 매개변수 | 타입 | 기본값 | 설명 | 예시 |
|----------|------|--------|------|------|
| size | int | 200 | QR 코드 크기 (픽셀) | 200 |

**응답 (200 OK)**:
- **Content-Type**: `image/png`
- **Body**: PNG 이미지 바이너리 데이터

#### 2. 결제 QR 코드 생성
**GET** `/api/order/qr/payment/{merchantUid}`

**인증**: 필수

**경로 매개변수**:
| 매개변수 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| merchantUid | String | Merchant UID | order_b7833686f25b48e0862612345678abcd |

**쿼리 매개변수**:
| 매개변수 | 타입 | 기본값 | 설명 | 예시 |
|----------|------|--------|------|------|
| size | int | 200 | QR 코드 크기 (픽셀) | 200 |

**응답 (200 OK)**:
- **Content-Type**: `image/png`
- **Body**: PNG 이미지 바이너리 데이터

### 🔧 웹훅 API

#### PortOne 결제 웹훅
**POST** `/api/order/webhook/portone`

**인증**: 불필요 (PortOne에서 호출)

**헤더**:
| 헤더 | 타입 | 설명 |
|------|------|------|
| webhook-id | String | 웹훅 ID |
| webhook-signature | String | 웹훅 서명 |
| webhook-timestamp | String | 웹훅 타임스탬프 |

**요청 본문**: PortOne V2 웹훅 페이로드

**응답 (200 OK)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "Webhook processed successfully",
  "data": "OK"
}
```

### 🏥 헬스체크 API

#### 서비스 상태 확인
**GET** `/api/health`

**인증**: 불필요

**응답 (200 OK)**:
```json
{
  "success": true,
  "code": "OK",
  "message": "조회 성공",
  "data": {
    "status": "UP",
    "service": "coubee-be-order",
    "timestamp": "2023-06-01T14:30:00",
    "version": "1.0.0"
  }
}
```

## � 프론트엔드 개발자를 위한 사용 팁

### 🔐 인증 처리
```typescript
// API 클라이언트에서 자동으로 JWT 토큰을 헤더에 추가
const token = await tokenManager.getToken();
const response = await apiClient.get('/api/order/orders/123', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 📱 QR 코드 이미지 처리
```typescript
// React Native에서 QR 코드를 Base64로 가져오기
const qrCodeBase64 = await qrAPI.getQrCodeBase64(orderId, 200);

// Image 컴포넌트에서 사용
<Image
  source={{ uri: qrCodeBase64 }}
  style={{ width: 200, height: 200 }}
/>
```

### 🔄 주문 상태 폴링
```typescript
// 주문 상태를 주기적으로 확인
const pollOrderStatus = async (orderId: string) => {
  const interval = setInterval(async () => {
    try {
      const response = await orderAPI.getOrderStatus(orderId);
      if (response.data.status === 'RECEIVED') {
        clearInterval(interval);
        // 주문 완료 처리
      }
    } catch (error) {
      console.error('주문 상태 조회 실패:', error);
    }
  }, 3000); // 3초마다 확인
};
```

### 🎯 에러 처리 패턴
```typescript
try {
  const response = await orderAPI.createOrder(orderData);
  // 성공 처리
} catch (error: any) {
  if (error.response?.status === 401) {
    // 인증 실패 - 로그인 페이지로 이동
    await tokenManager.clearToken();
    navigation.navigate('Login');
  } else if (error.response?.status === 400) {
    // 잘못된 요청 - 사용자에게 오류 메시지 표시
    Alert.alert('오류', error.response.data.message);
  } else {
    // 기타 오류
    Alert.alert('오류', '네트워크 오류가 발생했습니다.');
  }
}
```

### 📊 페이지네이션 처리
```typescript
const [orders, setOrders] = useState([]);
const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMoreOrders = async () => {
  try {
    const response = await orderAPI.getUserOrders(userId, page, 10);
    setOrders(prev => [...prev, ...response.data.orders]);
    setHasMore(!response.data.pageInfo.last);
    setPage(prev => prev + 1);
  } catch (error) {
    console.error('주문 목록 로드 실패:', error);
  }
};
```

## ⚙️ 앱 설정

### app.json 주요 설정
- **Android Queries**: 외부 결제 앱 호출을 위한 스키마 및 패키지 설정
- **iOS Info.plist**: LSApplicationQueriesSchemes 설정
- **PortOne Plugin**: 결제 SDK 플러그인 설정

### 지원하는 결제 앱
- 카카오톡 (카카오페이)
- 토스 (토스페이)
- 각종 은행 앱 (KB국민, 우리, 신한, 하나 등)

## 🔒 보안 기능

### 토큰 관리
- JWT 토큰을 Expo SecureStore에 암호화 저장
- 자동 토큰 갱신 및 만료 처리
- 모든 API 요청에 자동 인증 헤더 포함

### 에러 처리
- 네트워크 오류 처리
- 인증 실패 시 자동 로그아웃
- 사용자 친화적 오류 메시지

## 🧪 테스트

### 테스트 계정
- **사용자명**: test_user
- **비밀번호**: 1234

### 테스트 데이터
- **매장 ID**: 1
- **상품 ID**: 1
- **테스트 상품**: 테스트 상품 (500원)

## 📝 개발 노트

### payment-test-v3.html과의 차이점
1. **React Native 환경**: 웹 API 대신 React Native 컴포넌트 사용
2. **보안 저장소**: SessionStorage 대신 Expo SecureStore 사용
3. **이미지 처리**: FileReader 대신 Base64 변환 사용
4. **네이티브 설정**: 외부 앱 호출을 위한 추가 설정

### 주요 구현 사항
- 완전한 동적 결제 플로우 구현
- 백엔드 API와의 완전한 통합
- 한국어 UI/UX
- 모바일 최적화된 디자인

## 🚨 주의사항

1. **실제 결제**: 테스트 환경에서만 사용하세요
2. **API 키**: 실제 PortOne API 키가 백엔드에 설정되어야 합니다
3. **네트워크**: 백엔드 서버가 실행 중이어야 합니다
4. **권한**: 관리자 전용 API는 적절한 권한 확인이 필요합니다
5. **토큰 만료**: JWT 토큰 만료 시 자동 갱신 또는 재로그인 처리

## 🔄 업데이트 로그

- **v1.0.0**: 초기 구현 완료
  - 로그인/회원가입 기능
  - 동적 주문 생성 및 결제
  - QR 코드 생성 및 표시
  - 외부 결제 앱 연동 설정
  - 백엔드 API 완전 통합
