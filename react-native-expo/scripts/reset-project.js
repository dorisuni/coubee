const fs = require('fs').promises;
const path = require('path');

const rootDir = process.cwd();
const pathsToDelete = [
  'node_modules',
  '.expo',
  'yarn.lock',
  'package-lock.json',
  'app-example',
  'app'
];

async function resetProject() {
  console.log('프로젝트 초기화를 시작합니다...');

  for (const item of pathsToDelete) {
    const itemPath = path.join(rootDir, item);
    try {
      const stats = await fs.lstat(itemPath);
      if (stats.isDirectory()) {
        await fs.rm(itemPath, { recursive: true, force: true });
        console.log(`- '${item}' 폴더를 삭제했습니다.`);
      } else if (stats.isFile()) {
        await fs.unlink(itemPath);
        console.log(`- '${item}' 파일을 삭제했습니다.`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`'${itemPath}' 삭제 중 오류 발생:`, error);
      }
    }
  }

  console.log('\n✅ 초기화 완료되었습니다.');
  console.log('이제 `yarn install` 명령어를 실행하여 의존성을 다시 설치하세요.');
}

resetProject();