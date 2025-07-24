# ===================================================================
# Coubee Microservices Stop All Script (PowerShell)
# ===================================================================
# WARNING: This script will forcibly terminate all running 'java' processes.
# Make sure no other important Java applications are running before use.
# ===================================================================

# --- Step 1: Stop all Java processes ---
Write-Host "✅ 1. Stopping all running Spring Boot applications (java.exe)..."
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Stop-Process -Name "java" -Force
    Write-Host "   - All Java processes have been terminated."
} else {
    Write-Host "   - No running Java processes found."
}


# --- Step 2: Stop and remove Docker containers and volumes ---
Write-Host "✅ 2. Stopping Docker containers (MySQL, Kafka) and removing related volumes..."
docker-compose down -v
Write-Host "   - All Docker resources have been cleaned up."


Write-Host "⏹️ All services have been successfully stopped."