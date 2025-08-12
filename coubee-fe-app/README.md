# Coubee Frontend App

React Native 앱을 Expo와 Tamagui로 개발한 모바일 애플리케이션입니다.

## 개발 환경 설정

### 1. Yarn 글로벌 설치

```bash
npm install -g yarn
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 앱 실행

```bash
npm run start
```

## 주요 기능

- React Native + Expo Router
- Tamagui UI 라이브러리
- 푸시 알림 (expo-notifications)
- 인증 시스템
- 위치 서비스

## 개발 참고사항

- 모노레포 환경에서 react, react-dom, react-native-web 의존성을 제거하고 metro.config.js를 수정했습니다.
- iOS/Android 시뮬레이터나 Expo Go 앱에서 실행 가능합니다.
