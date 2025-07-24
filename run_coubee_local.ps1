# ===================================================================
# Coubee Microservices Local Run Script (Run without Docker)
# ===================================================================
# Before you start:
# 1. Java 17 and Gradle must be installed.
# 2. If you do not have script execution permission, open PowerShell as Administrator and run:
#    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
# ===================================================================

# Note: This script uses H2 in-memory DB and embedded services without Docker.

# Function for colored output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Close previously running PowerShell windows (optional)
Write-ColorOutput Green "Terminating any previously running Coubee applications..."
Get-Process | Where-Object {$_.Name -eq "java" -and $_.MainWindowTitle -like "*Coubee*"} | Stop-Process -Force

# --- Step 1: Start Eureka Server ---
Write-ColorOutput Green "✅ 1. Starting Eureka Server (coubee-be-eureka)..."
Push-Location .\coubee-be-eureka
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Coubee Eureka Server...' -ForegroundColor Cyan; .\gradlew bootRun --args='--spring.profiles.active=local'; pause" -WindowStyle Normal -wait:0
Pop-Location
Write-ColorOutput Yellow "   - Waiting 15 seconds for Eureka Server to start."
Start-Sleep -Seconds 15

# --- Step 2: Start User Service ---
Write-ColorOutput Green "✅ 2. Starting User Service (coubee-be-user)..."
Push-Location .\coubee-be-user
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Coubee User Service...' -ForegroundColor Magenta; .\gradlew bootRun --args='--spring.profiles.active=local'; pause" -WindowStyle Normal -wait:0
Pop-Location
Write-ColorOutput Yellow "   - Waiting 10 seconds for User Service to start."
Start-Sleep -Seconds 10

# --- Step 3: Start Order Service ---
Write-ColorOutput Green "✅ 3. Starting Order Service (coubee-be-order)..."
Push-Location .\coubee-be-order
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Coubee Order Service...' -ForegroundColor Yellow; .\gradlew bootRun --args='--spring.profiles.active=local'; pause" -WindowStyle Normal -wait:0
Pop-Location
Write-ColorOutput Yellow "   - Waiting 10 seconds for Order Service to start."
Start-Sleep -Seconds 10

# --- Step 4: Start API Gateway ---
Write-ColorOutput Green "✅ 4. Starting API Gateway (coubee-be-gateway)..."
Push-Location .\coubee-be-gateway
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Coubee API Gateway...' -ForegroundColor Green; .\gradlew bootRun --args='--spring.profiles.active=local'; pause" -WindowStyle Normal -wait:0
Pop-Location

# All services started
Write-ColorOutput Green "🚀 All services have been started in new PowerShell windows!"
Write-ColorOutput Cyan "   Eureka Dashboard: http://localhost:8761"
Write-ColorOutput Cyan "   API Gateway: http://localhost:8080"
Write-ColorOutput Cyan "   Order Service Swagger UI: http://localhost:8080/swagger-ui.html"
Write-Host ""
Write-ColorOutput Yellow "   Note: Each service uses an in-memory H2 database, so data will be reset on restart."
Write-ColorOutput Yellow "   If you close each service window individually, only that service will be stopped."