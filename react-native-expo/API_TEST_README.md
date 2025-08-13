# 🧪 Coubee API 테스트 앱

이 React Native Expo 앱은 coubee-be-order 백엔드의 모든 API 엔드포인트를 테스트할 수 있는 종합적인 도구입니다. 모든 코드는 한국어로 작성되었으며, React hooks와 함수형 컴포넌트를 사용합니다.

## 📋 주요 기능

### 🔐 인증 시스템
- 로그인/로그아웃 기능
- JWT 토큰 자동 관리
- 토큰 만료 시 자동 처리

### 🧪 API 테스트 기능
- **25개 이상의 API 엔드포인트** 지원
- **카테고리별 분류**: 인증, 주문, 결제, QR코드, 매장, 상품, 통계, 사용자, 알림, 리뷰, 쿠폰
- **실시간 검색**: API 이름, 설명, 카테고리로 검색 가능
- **매개변수 입력**: 각 API에 필요한 매개변수를 직관적인 폼으로 입력
- **응답 뷰어**: JSON 응답을 보기 좋게 포맷팅하여 표시
- **호출 기록**: 최근 10개 API 호출 기록 유지

### 💳 결제 테스트
- 실제 결제 플로우 테스트
- 포트원(PortOne) 결제 연동
- QR 코드 생성 및 표시

## 🏗️ 프로젝트 구조

```
src/
├── api/
│   └── client.ts              # API 클라이언트 및 추가 엔드포인트
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

## 🔧 지원하는 API 엔드포인트

### 🔐 인증 관련
- `POST /api/user/auth/logout` - 로그아웃

### 📦 주문 관리
- `GET /api/order/users/{userId}/orders` - 사용자 주문 목록 조회
- `GET /api/order/orders` - 전체 주문 목록 조회
- `GET /api/order/orders/{orderId}` - 주문 상세 조회
- `POST /api/order/orders/{orderId}/receive` - 주문 수령 등록
- `PATCH /api/order/orders/{orderId}` - 주문 상태 변경
- `DELETE /api/order/orders/{orderId}` - 주문 취소

### 💳 결제 관련
- `GET /api/order/payment/config` - 결제 설정 조회
- `POST /api/order/payment/orders/{orderId}/prepare` - 결제 준비
- `GET /api/order/payment/{paymentId}/status` - 결제 상태 조회

### 📱 QR 코드
- `GET /api/order/qr/orders/{orderId}` - QR 코드 URL/Base64 조회

### 🏪 매장 관리
- `GET /api/order/stores` - 매장 목록 조회
- `GET /api/order/stores/{storeId}` - 매장 상세 조회
- `POST /api/order/stores` - 매장 생성
- `GET /api/order/stores/{storeId}/orders` - 매장별 주문 목록

### 🛍️ 상품 관리
- `GET /api/order/stores/{storeId}/products` - 상품 목록 조회
- `GET /api/order/products/{productId}` - 상품 상세 조회
- `POST /api/order/stores/{storeId}/products` - 상품 생성

### 📊 통계
- `GET /api/order/stores/{storeId}/statistics` - 매장 통계 조회
- `GET /api/order/stores/{storeId}/sales/daily` - 일별 매출 조회

### 👤 사용자 관리
- `GET /api/user/users/{userId}/profile` - 사용자 프로필 조회
- `PUT /api/user/users/{userId}/profile` - 사용자 프로필 수정

### 🔔 알림
- `GET /api/order/users/{userId}/notifications` - 알림 목록 조회
- `PATCH /api/order/notifications/{notificationId}/read` - 알림 읽음 처리

### ⭐ 리뷰
- `GET /api/order/products/{productId}/reviews` - 상품 리뷰 목록 조회
- `POST /api/order/orders/{orderId}/review` - 리뷰 작성

### 🎫 쿠폰
- `GET /api/order/users/{userId}/coupons` - 사용자 쿠폰 목록 조회
- `POST /api/order/coupons/{couponId}/use` - 쿠폰 사용

## 🚀 사용 방법

### 1. 앱 실행
```bash
cd coubee/react-native-expo
npm start
```

### 2. 로그인
- 기존 계정으로 로그인
- JWT 토큰이 자동으로 저장됨

### 3. API 테스트
1. 메인 화면에서 "🧪 API 테스트" 버튼 클릭
2. 원하는 카테고리의 API 선택
3. 필요한 매개변수 입력 (자동 폼 생성)
4. API 호출 및 응답 확인

### 4. 결제 테스트
1. 메인 화면에서 주문 정보 입력
2. "🚀 결제 시작" 버튼 클릭
3. 실제 결제 플로우 진행
4. QR 코드 생성 및 확인

## 🛠️ 기술 스택

- **React Native**: 0.76.3
- **Expo**: 53.0.20
- **TypeScript**: 5.3.3
- **Axios**: 1.11.0 (HTTP 클라이언트)
- **PortOne**: 0.4.0-alpha.1 (결제)
- **Expo Secure Store**: 토큰 보안 저장

## 🎨 UI/UX 특징

### 한국어 중심 설계
- 모든 변수명, 함수명, 주석이 한국어
- 사용자 인터페이스 텍스트 한국어
- 직관적인 한국어 네이밍 컨벤션

### 사용자 친화적 인터페이스
- 카테고리별 색상 구분
- 이모지를 활용한 시각적 구분
- 실시간 검색 기능
- 로딩 상태 표시
- 에러 처리 및 사용자 피드백

### 반응형 디자인
- 다양한 화면 크기 지원
- 스크롤 가능한 긴 목록
- 모달 기반 상세 정보 표시

## 🔍 고급 기능

### 매개변수 자동 검증
- 필수/선택 매개변수 구분
- 타입별 입력 키보드 자동 설정
- 예시값 자동 입력 기능
- 기본값 자동 적용

### 응답 데이터 분석
- JSON 포맷팅 및 구문 강조
- 응답 크기 계산
- HTTP 상태 코드 표시
- 응답 시간 기록

### 개발자 도구
- API 호출 기록 유지
- 성공/실패 통계
- 응답 데이터 공유 기능
- 디버깅 정보 표시

## 📝 확장 가능성

### 새로운 API 추가
`src/config/apiEndpoints.ts` 파일에서 새로운 엔드포인트를 쉽게 추가할 수 있습니다:

```typescript
{
  이름: '새로운 API',
  설명: 'API 설명',
  카테고리: '🆕 새 카테고리',
  함수: (매개변수들) => apiClient.get('/new-endpoint'),
  매개변수목록: [
    {
      이름: '매개변수명',
      타입: '문자열',
      필수여부: true,
      설명: '매개변수 설명',
      예시: '예시값'
    }
  ],
  HTTP메서드: 'GET',
  엔드포인트URL: '/api/new-endpoint'
}
```

### 커스터마이징
- 새로운 카테고리 추가
- 매개변수 타입 확장
- 응답 뷰어 커스터마이징
- 테마 및 스타일 변경

## 🐛 문제 해결

### 일반적인 문제
1. **토큰 만료**: 자동으로 로그인 화면으로 이동
2. **네트워크 오류**: 에러 메시지와 함께 재시도 안내
3. **매개변수 오류**: 입력 검증 및 오류 표시

### 디버깅 팁
- 개발자 콘솔에서 API 호출 로그 확인
- 응답 뷰어에서 상세 오류 정보 확인
- 네트워크 탭에서 실제 HTTP 요청 확인

이 앱을 통해 coubee-be-order 백엔드의 모든 기능을 효율적으로 테스트하고 검증할 수 있습니다! 🚀
