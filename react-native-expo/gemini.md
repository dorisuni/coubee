# Gemini 프로젝트 노트: test-android-payment

## 프로젝트 개요

-   **타입**: React Native (Expo Managed Workflow) 모바일 애플리케이션
-   **주요 기술**:
    -   React Native, Expo, TypeScript
    -   React Navigation (화면 이동)
    -   PortOne SDK (`@portone/react-native-sdk`) (결제 연동)
    -   Axios (API 요청)
-   **패키지 매니저**: Yarn
-   **타겟 플랫폼**: Android, iOS, Web

## Gemini 기억 사항

1.  **네이티브 설정 (Android)**:
    -   이 프로젝트는 Expo Managed Workflow를 사용하므로 `android` 디렉토리가 기본적으로 보이지 않습니다. `npx expo prebuild` 실행 시 생성됩니다.
    -   **Kotlin 버전**: `1.9.24` 버전을 사용해야 합니다. `react-native@0.79.5` 및 관련 네이티브 라이브러리와의 호환성을 위해 필요합니다. (과거 `1.9.25`에서 다운그레이드 이력 있음)
    -   **관련 설정 파일**: `android/build.gradle` (prebuild 후)

2.  **주요 라이브러리 버전**:
    -   `expo`: ~53.0.20
    -   `react`: 19.0.0
    -   `react-native`: 0.79.5
    -   `typescript`: ~5.8.3

3.  **개발 환경**:
    -   **OS**: Windows
    -   **제약사항**: `grep`과 같은 Unix/Linux 명령어를 사용할 수 없습니다.

4.  **프로젝트 구조**:
    -   **메인 파일**: `App.tsx`
    -   **스크린**: `src/screens/`
    -   **API 클라이언트**: `src/api/client.ts`
    -   **컴포넌트**: `src/components/`
