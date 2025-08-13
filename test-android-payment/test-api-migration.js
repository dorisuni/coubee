// API 마이그레이션 테스트 스크립트
// 이 스크립트는 API 테스트 기능이 올바르게 마이그레이션되었는지 확인합니다.

console.log('🧪 API 마이그레이션 테스트 시작');

// 1. 파일 존재 확인
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/screens/ApiTestScreen.tsx',
  'src/components/ApiParameterInput.tsx', 
  'src/components/ApiResponseViewer.tsx',
  'src/config/apiEndpoints.ts',
  'src/api/client.ts'
];

console.log('\n📁 필수 파일 존재 확인:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 2. API 클라이언트 확인
console.log('\n🔌 API 클라이언트 확인:');
try {
  const clientContent = fs.readFileSync(path.join(__dirname, 'src/api/client.ts'), 'utf8');
  
  const hasAdditionalAPI = clientContent.includes('export const additionalAPI');
  const hasStoreAPI = clientContent.includes('getStoreList');
  const hasProductAPI = clientContent.includes('getProductList');
  const hasUserAPI = clientContent.includes('getUserProfile');
  
  console.log(`${hasAdditionalAPI ? '✅' : '❌'} additionalAPI 객체 존재`);
  console.log(`${hasStoreAPI ? '✅' : '❌'} 매장 관리 API 함수들`);
  console.log(`${hasProductAPI ? '✅' : '❌'} 상품 관리 API 함수들`);
  console.log(`${hasUserAPI ? '✅' : '❌'} 사용자 관리 API 함수들`);
} catch (error) {
  console.log('❌ API 클라이언트 파일 읽기 실패:', error.message);
}

// 3. API 엔드포인트 설정 확인
console.log('\n⚙️ API 엔드포인트 설정 확인:');
try {
  const endpointsContent = fs.readFileSync(path.join(__dirname, 'src/config/apiEndpoints.ts'), 'utf8');
  
  const hasGetAllApiList = endpointsContent.includes('export const getAllApiList');
  const hasGroupFunction = endpointsContent.includes('export const groupApisByCategory');
  const hasSearchFunction = endpointsContent.includes('export const searchApis');
  const hasInterfaces = endpointsContent.includes('export interface ApiEndpoint');
  
  console.log(`${hasGetAllApiList ? '✅' : '❌'} getAllApiList 함수`);
  console.log(`${hasGroupFunction ? '✅' : '❌'} groupApisByCategory 함수`);
  console.log(`${hasSearchFunction ? '✅' : '❌'} searchApis 함수`);
  console.log(`${hasInterfaces ? '✅' : '❌'} TypeScript 인터페이스`);
} catch (error) {
  console.log('❌ API 엔드포인트 파일 읽기 실패:', error.message);
}

// 4. 메인 스크린 통합 확인
console.log('\n🏠 메인 스크린 통합 확인:');
try {
  const mainScreenContent = fs.readFileSync(path.join(__dirname, 'src/screens/MainScreen.tsx'), 'utf8');
  
  const hasApiTestImport = mainScreenContent.includes("import ApiTestScreen from './ApiTestScreen'");
  const hasApiTestButton = mainScreenContent.includes('API 테스트');
  const hasScreenState = mainScreenContent.includes("currentScreen");
  
  console.log(`${hasApiTestImport ? '✅' : '❌'} ApiTestScreen import`);
  console.log(`${hasApiTestButton ? '✅' : '❌'} API 테스트 버튼`);
  console.log(`${hasScreenState ? '✅' : '❌'} 화면 상태 관리`);
} catch (error) {
  console.log('❌ 메인 스크린 파일 읽기 실패:', error.message);
}

// 5. 패키지 의존성 확인
console.log('\n📦 패키지 의존성 확인:');
try {
  const packageContent = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  const hasAxios = packageJson.dependencies && packageJson.dependencies.axios;
  const hasBase64 = packageJson.dependencies && packageJson.dependencies['base-64'];
  
  console.log(`${hasAxios ? '✅' : '❌'} axios (${hasAxios || 'missing'})`);
  console.log(`${hasBase64 ? '✅' : '❌'} base-64 (${hasBase64 || 'missing'})`);
} catch (error) {
  console.log('❌ package.json 읽기 실패:', error.message);
}

console.log('\n🎉 API 마이그레이션 테스트 완료!');
console.log('\n📋 다음 단계:');
console.log('1. npm install 또는 yarn install 실행');
console.log('2. 앱 실행 후 "🧪 API 테스트" 버튼 클릭');
console.log('3. 각 API 엔드포인트 테스트 수행');
console.log('4. 응답 데이터 및 오류 처리 확인');
