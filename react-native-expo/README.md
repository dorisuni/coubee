# 🍯 Coubee 결제 앱 (React Native Expo)

이 프로젝트는 Coubee 백엔드 API와 PortOne V2 결제 시스템을 통합한 완전한 모바일 결제 애플리케이션입니다.

## 📋 주요 기능

### ✅ 구현된 기능
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
- **Expo**: ^52.0.11
- **PortOne React Native SDK**: ^0.4.0-alpha.1
- **Axios**: API 통신
- **Expo SecureStore**: 보안 토큰 저장
- **TypeScript**: 타입 안전성

## 🚀 설치 및 실행

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
src/
├── api/
│   └── client.ts          # API 클라이언트 및 인증 관리
├── screens/
│   ├── LoginScreen.tsx    # 로그인/회원가입 화면
│   └── MainScreen.tsx     # 메인 결제 화면
└── types/
    └── index.ts           # TypeScript 타입 정의
```

## 🔐 API 엔드포인트

### 인증
- `POST /api/user/auth/signup` - 회원가입
- `POST /api/user/auth/login` - 로그인

### 주문
- `POST /api/order/orders` - 주문 생성
- `GET /api/order/orders/{orderId}` - 주문 조회
- `POST /api/order/orders/{orderId}/receive` - 주문 수령

### 결제
- `GET /api/order/payment/config` - 결제 설정 조회
- `POST /api/order/payment/orders/{orderId}/prepare` - 결제 준비
- `GET /api/order/payment/{paymentId}/status` - 결제 상태 조회

### QR 코드
- `GET /api/order/qr/orders/{orderId}` - QR 코드 이미지 생성

## ⚙️ 설정

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

## 🔄 업데이트 로그

- **v1.0.0**: 초기 구현 완료
  - 로그인/회원가입 기능
  - 동적 주문 생성 및 결제
  - QR 코드 생성 및 표시
  - 외부 결제 앱 연동 설정
