// 환경변수 관리 및 검증
export const config = {
  // API 설정
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  
  // 환경 구분
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
} as const;

// 환경변수 검증 함수
export function validateConfig() {
  const requiredEnvVars = [
    'EXPO_PUBLIC_API_BASE_URL',
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missingVars.join(', ')}\n` +
      `Using default values. Check your .env file.`
    );
  }

  // 개발 환경에서 현재 설정 출력
  if (__DEV__) {
    console.log('🔧 Current configuration:');
    console.log(`API Base URL: ${config.apiBaseUrl}`);
  }
}

// 앱 시작 시 자동 검증
validateConfig();

// Default export for Expo Router compatibility
export default config;