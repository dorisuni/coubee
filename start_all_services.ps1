# ===================================================================
# Coubee 마이크로서비스 전체 시작 스크립트 (PowerShell)
# ===================================================================
# 실행 전 확인사항:
# 1. Docker Desktop이 실행 중이어야 합니다.
# 2. Java 17 및 Gradle이 설치되어 있어야 합니다.
# 3. 스크립트 실행 권한이 없는 경우, PowerShell을 관리자 권한으로 열고
#    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser 를 실행하세요.
# ===================================================================

# --- 1단계: Docker 컨테이너 시작 (MySQL, Kafka) ---
Write-Host "✅ 1. Docker 컨테이너 (MySQL, Kafka)를 백그라운드에서 시작합니다..."
docker-compose up -d
Write-Host "   - 컨테이너들이 안정적으로 시작되도록 15초 대기합니다."
Start-Sleep -Seconds 15


# --- 2단계: Eureka 서버 시작 ---
Write-Host "✅ 2. Eureka 서버 (coubee-be-eureka)를 시작합니다..."
Push-Location .\coubee-be-eureka
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {.\gradlew bootRun --args='--spring.profiles.active=local'; pause}" -wait:0
Pop-Location
Write-Host "   - Eureka 서버가 시작되도록 15초 대기합니다."
Start-Sleep -Seconds 15


# --- 3단계: 개별 마이크로서비스 시작 (User, Order) ---
Write-Host "✅ 3. User 서비스 (coubee-be-user)를 시작합니다..."
Push-Location .\coubee-be-user
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {.\gradlew bootRun --args='--spring.profiles.active=local'; pause}" -wait:0
Pop-Location

Write-Host "✅ 4. Order 서비스 (coubee-be-order)를 시작합니다..."
Push-Location .\coubee-be-order
# dev 프로필은 H2 DB를 사용하므로, MySQL과 연동되는 local 프로필로 실행합니다.
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {.\gradlew bootRun --args='--spring.profiles.active=local'; pause}" -wait:0
Pop-Location

Write-Host "   - 서비스들이 Eureka에 등록되도록 10초 대기합니다."
Start-Sleep -Seconds 10


# --- 5단계: API 게이트웨이 시작 ---
Write-Host "✅ 5. API 게이트웨이 (coubee-be-gateway)를 시작합니다..."
Push-Location .\coubee-be-gateway
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {.\gradlew bootRun --args='--spring.profiles.active=local'; pause}" -wait:0
Pop-Location

Write-Host "🚀 모든 서비스가 새로운 PowerShell 창에서 시작되었습니다!"
Write-Host "   Eureka 대시보드: http://localhost:8761"
Write-Host "   API 게이트웨이: http://localhost:8080"