# Gemini 프로젝트 노트: react-native-expo

## 프로젝트 개요

-   **타입**: React Native (Expo) 모바일 애플리케이션
-   **주요 기술**: TypeScript, React Native, Expo, Kotlin (Android)
-   **패키지 매니저**: Yarn (JavaScript), Gradle (Android)
-   **플랫폼**: Android

## Gemini 기억 사항

1.  **Kotlin 버전**: `1.9.24` 버전을 사용합니다. 이는 `react-native` 라이브러리 및 Jetpack Compose Compiler `1.5.14`와의 호환성을 위해 설정되었습니다.
    -   **주요 설정 파일**: `android/build.gradle`
    -   **참고 파일**: `node_modules/react-native/gradle/libs.versions.toml` (react-native의 기본 의존성 버전 명시)

2.  **개발 환경**:
    -   **OS**: Windows
    -   **제약사항**: `grep`과 같은 Unix/Linux 명령어를 사용할 수 없습니다. 파일 시스템 탐색 시 내장 도구를 활용해야 합니다.

3.  **최근 변경사항**:
    -   `android/build.gradle`의 `kotlinVersion`을 `1.9.25`에서 `1.9.24`로 수정하여 버전 호환성 문제를 해결했습니다.