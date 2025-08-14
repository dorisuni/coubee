# 🍯 Coubee 안드로이드 결제 및 API 테스트 앱

이 프로젝트는 Coubee 백엔드 API와 PortOne V2 결제 시스템을 통합한, API 테스트와 실제 결제 기능 모두를 갖춘 종합적인 모바일 애플리케이션입니다.

## 📋 프로젝트 개요

이 앱은 두 가지 주요 목적을 가집니다:
1.  **완전한 결제 기능 테스트**: 고객이 앱을 통해 상품을 주문하고, PortOne을 통해 다양한 수단으로 결제한 후, QR 코드로 주문을 수령하는 전체 과정을 테스트합니다.
2.  **백엔드 API 테스트**: `coubee-be-order`의 모든 API 엔드포인트를 테스트할 수 있는 종합적인 도구를 제공합니다.
2.  **TestPayment.html**: PortOne V2 결제 테스트를 위한 HTML 파일입니다. HTML 테스트를 원하시면 이 파일을 Live Server로 실행하여 테스트할 수 있습니다.
### ✅ 주요 기능

#### 결제 기능
- **사용자 인증**: 로그인/회원가입 및 JWT 토큰 자동 관리
- **동적 주문 생성**: 백엔드 API를 통한 실시간 주문 생성
- **결제 처리**: PortOne V2를 통한 다양한 결제 수단 지원 (신용카드, 카카오페이, 토스페이)
- **QR 코드 생성**: 결제 완료 후 수령용 QR 코드 자동 생성
- **보안 토큰 관리**: Expo SecureStore를 통한 안전한 토큰 저장

#### API 테스트 기능
- **25개 이상의 API 엔드포인트** 지원
- **카테고리별 분류**: 인증, 주문, 결제, QR코드, 매장, 상품, 통계, 사용자, 알림, 리뷰, 쿠폰
- **실시간 검색**: API 이름, 설명, 카테고리로 검색 가능
- **매개변수 자동 입력**: 각 API에 필요한 매개변수를 직관적인 폼으로 입력
- **응답 뷰어**: JSON 응답을 가독성 좋게 포맷팅하여 표시
- **호출 기록**: 최근 API 호출 기록 유지

### 🔧 기술 스택
- **React Native**: 0.76.3
- **Expo**: 53.0.20
- **TypeScript**: 5.3.3
- **Axios**: 1.11.0 (HTTP 클라이언트)
- **PortOne React Native SDK**: 0.4.0-alpha.1 (결제)
- **Expo Secure Store**: 토큰 보안 저장

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18.x 이상
- Yarn v1 (Classic)
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (Android 개발용)
- 백엔드 API 서버 실행 (`http://localhost:8080` 또는 `https://coubee-api.murkui.com`)

### 1. 의존성 설치
프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 필요한 모든 의존성을 설치합니다.
```bash
yarn install
```

### 2. 개발 서버 시작 및 앱 실행
다음 스크립트를 사용하여 개발 서버를 시작하고 원하는 플랫폼에서 앱을 실행할 수 있습니다.

- **통합 개발 서버 시작**:
  ```bash
  yarn start
  ```
  위 명령어를 실행하면 터미널에 QR 코드가 나타납니다. Expo Go 앱을 사용하여 이 QR 코드를 스캔하면 모바일 기기에서 앱을 바로 열 수 있습니다.

- **플랫폼별 실행**:
  - Android: `yarn android`
  - iOS: `yarn ios`
  - Web: `yarn web`

### 3. 기타 유용한 스크립트
- **캐시 클리어**: Metro 번들러의 캐시를 지우고 싶을 때 사용합니다.
  ```bash
  yarn clear-cache
  ```
- **린트 검사**: 코드 스타일과 잠재적 오류를 검사합니다.
  ```bash
  yarn lint
  ```
- **프로젝트 초기화**: `node_modules`와 Expo 캐시를 모두 삭제하고 의존성을 재설치합니다.
  ```bash
  yarn reset
  ```

## 📱 사용 방법

### 1. 결제 테스트
1.  **로그인**: 테스트 계정(`test_user`/`1234`)으로 로그인합니다.
2.  **주문 정보 입력**: 메인 화면에서 매장 ID, 수령인 이름, 상품 정보를 입력합니다.
3.  **결제 시작**: "결제 시작" 버튼을 클릭하고 PortOne 결제창에서 결제를 진행합니다.
4.  **QR 코드 확인**: 결제가 완료되면 수령용 QR 코드가 자동으로 표시됩니다.

### 2. API 엔드포인트 테스트
1.  메인 화면에서 "🧪 API 테스트" 버튼을 클릭합니다.
2.  원하는 카테고리의 API를 선택하거나 검색합니다.
3.  필요한 매개변수를 자동으로 생성된 폼에 입력합니다.
4.  API를 호출하고 форматированный 응답을 확인합니다.

## 🏗️ 프로젝트 구조

```
src/
├── api/
│   └── client.ts              # API 클라이언트, 인증 관리, 엔드포인트
├── components/
│   ├── ApiResponseViewer.tsx  # API 응답 표시 컴포넌트
│   └── ApiParameterInput.tsx  # 매개변수 입력 컴포넌트
├── config/
│   └── apiEndpoints.ts        # 전체 API 엔드포인트 설정
├── screens/
│   ├── LoginScreen.tsx        # 로그인 화면
│   ├── MainScreen.tsx         # 메인 화면 (결제 테스트)
│   └── ApiTestScreen.tsx      # API 테스트 화면
└── types/
    └── index.ts               # 타입 정의
```

## 🔧 지원하는 API 엔드포인트 목록

### 📦 주문 관리 (Order Management)
- `POST /api/order/orders` - 주문 생성
- `GET /api/order/orders/{orderId}` - 주문 상세 조회
- `GET /api/order/orders/status/{orderId}` - 주문 상태 조회
- `GET /api/order/users/{userId}/orders` - 사용자 주문 목록 조회
- `POST /api/order/orders/{orderId}/cancel` - 주문 취소
- `POST /api/order/orders/{orderId}/receive` - 주문 수령 등록
- `PATCH /api/order/orders/{orderId}` - 주문 상태 변경 (관리자용)

### 💳 결제 관련 (Payment)
- `GET /api/order/payment/config` - 결제 설정 조회
- `POST /api/order/payment/orders/{orderId}/prepare` - 결제 준비
- `GET /api/order/payment/{paymentId}/status` - 결제 상태 조회

### 📱 QR 코드 (QR Code)
- `GET /api/order/qr/orders/{orderId}` - 주문 QR 코드 생성 (PNG 이미지)
- `GET /api/order/qr/payment/{merchantUid}` - 결제 QR 코드 생성 (PNG 이미지)

## 🔐 백엔드 API 상세 레퍼런스

프론트엔드 개발자가 백엔드 API를 올바르게 사용할 수 있도록 상세 정보를 제공합니다.

### 🔑 인증
모든 API 요청은 JWT 토큰 인증이 필요합니다. (`Authorization: Bearer {JWT_TOKEN}`)

### 📝 주문 관리 API 예시

#### 1. 주문 생성
**POST** `/api/order/orders`
- **인증**: 필수 (`X-Auth-UserId` 헤더 필요)
- **요청 본문**:
  ```json
  {
    "storeId": 1,
    "recipientName": "홍길동",
    "paymentMethod": "CARD",
    "items": [
      { "productId": 1, "quantity": 2 }
    ]
  }
  ```
- **응답 (201 Created)**:
  ```json
  {
    "success": true,
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
- **인증**: 불필요
- **응답 (200 OK)**: 주문, 결제, 상품 정보 포함

#### 3. 주문 상태 조회
**GET** `/api/order/orders/status/{orderId}`
- **인증**: 불필요
- **응답 (200 OK)**:
  ```json
  {
    "success": true,
    "data": { "orderId": "order_01H1J5BFXCZDMG8RP0WCTFSN5Y", "status": "PAID" }
  }
  ```

### 💳 결제 관리 API 예시

#### 1. 결제 설정 조회
**GET** `/api/order/payment/config`
- **인증**: 필수
- **응답 (200 OK)**: PortOne 상점 ID 및 채널 키 목록

#### 2. 결제 준비
**POST** `/api/order/payment/orders/{orderId}/prepare`
- **인증**: 필수
- **응답 (200 OK)**: PortOne 결제에 필요한 정보 (주문명, 금액, 주문번호)

## 💡 프론트엔드 개발 팁

### 🔄 주문 상태 폴링
주문 완료 후, 주문 상태가 `RECEIVED`가 될 때까지 주기적으로 `GET /api/order/orders/status/{orderId}`를 호출하여 상태를 확인할 수 있습니다.

### 🎯 에러 처리 패턴
`try...catch` 블록을 사용하여 API 호출을 감싸고, `error.response.status`에 따라 분기 처리합니다. (예: 401 시 로그인 화면 이동, 400 시 사용자에게 오류 메시지 표시)

### 📊 페이지네이션 처리
주문 목록과 같이 많은 데이터를 불러올 때는 `page`와 `size` 파라미터를 사용하여 API를 호출하고, 응답의 `pageInfo`를 확인하여 '더 보기' 기능을 구현합니다.

## 🐛 문제 해결 및 디버깅
- **토큰 만료**: 앱은 자동으로 토큰 만료를 감지하고 로그인 화면으로 이동시킵니다.
- **네트워크 오류**: Axios 인터셉터를 통해 네트워크 오류를 감지하고 사용자에게 알립니다.
- **디버깅**: 개발자 콘솔에서 API 호출 로그와 응답을 확인하세요.