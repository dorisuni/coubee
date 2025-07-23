# ===================================================================
# Coubee 마이크로서비스 전체 중지 스크립트 (PowerShell)
# ===================================================================
# 경고: 이 스크립트는 실행 중인 모든 'java' 프로세스를 강제 종료합니다.
# 다른 중요한 Java 애플리케이션이 실행 중이지 않은지 확인하고 사용하세요.
# ===================================================================

# --- 1단계: 모든 Java 프로세스 중지 ---
Write-Host "✅ 1. 실행 중인 모든 Spring Boot 애플리케이션 (java.exe)을 중지합니다..."
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Stop-Process -Name "java" -Force
    Write-Host "   - Java 프로세스들을 모두 종료했습니다."
} else {
    Write-Host "   - 실행 중인 Java 프로세스가 없습니다."
}


# --- 2단계: Docker 컨테이너 중지 및 삭제 ---
Write-Host "✅ 2. Docker 컨테이너 (MySQL, Kafka)를 중지하고 관련 볼륨을 삭제합니다..."
docker-compose down -v
Write-Host "   - Docker 리소스가 모두 정리되었습니다."


Write-Host "⏹️ 모든 서비스가 성공적으로 중지되었습니다."