# ===================================================================
# Coubee Local Microservices Termination Script (PowerShell)
# ===================================================================
# WARNING: This script will forcibly terminate all running Java processes.
# Please make sure no other important Java applications are running before use.
# ===================================================================

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

# Print title
Write-ColorOutput Cyan "===================================================="
Write-ColorOutput Cyan "       Coubee Microservices Termination Script       "
Write-ColorOutput Cyan "===================================================="
Write-Host ""

# --- Step 1: Terminate only Coubee-related Java processes ---
Write-ColorOutput Green "✅ 1. Terminating Coubee-related Spring Boot applications..."
$coubeeProcesses = Get-Process | Where-Object { 
    $_.Name -eq "java" -and (
        $_.MainWindowTitle -like "*Coubee*" -or 
        $_.CommandLine -like "*coubee-be-*" -or
        $_.CommandLine -like "*spring*"
    )
}

if ($coubeeProcesses) {
    Write-ColorOutput Yellow "   The following Java processes will be terminated:"
    foreach ($process in $coubeeProcesses) {
        Write-Host "   - PID: $($process.Id), Path: $($process.Path)"
    }
    
    Write-Host ""
    $confirmation = Read-Host "Do you want to terminate these processes? (Y/N)"
    if ($confirmation -eq 'Y' -or $confirmation -eq 'y') {
        $coubeeProcesses | ForEach-Object { Stop-Process -Id $_.Id -Force }
        Write-ColorOutput Green "   All Coubee-related Java processes have been terminated."
    } else {
        Write-ColorOutput Yellow "   Process termination has been cancelled."
    }
} else {
    Write-ColorOutput Yellow "   No running Coubee-related Java processes found."
}

# --- Step 2: Show all other Java processes and provide optional termination ---
Write-Host ""
Write-ColorOutput Green "✅ 2. Checking for other running Java processes..."
$otherJavaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { 
    $_.Name -eq "java" -and (
        $_.MainWindowTitle -notlike "*Coubee*" -and 
        $_.CommandLine -notlike "*coubee-be-*" -and
        $_.CommandLine -notlike "*spring*"
    )
}

if ($otherJavaProcesses) {
    Write-ColorOutput Yellow "   The following Java processes are still running:"
    foreach ($process in $otherJavaProcesses) {
        Write-Host "   - PID: $($process.Id), Start Time: $($process.StartTime), Path: $($process.Path)"
    }
    
    Write-Host ""
    $killAll = Read-Host "Do you want to terminate all Java processes? This may also close IDEs such as IntelliJ. (Y/N)"
    if ($killAll -eq 'Y' -or $killAll -eq 'y') {
        Stop-Process -Name "java" -Force
        Write-ColorOutput Green "   All Java processes have been terminated."
    } else {
        Write-ColorOutput Yellow "   The remaining Java processes will continue to run."
    }
} else {
    Write-ColorOutput Green "   No other Java processes are running."
}

# Script end message
Write-Host ""
Write-ColorOutput Cyan "===================================================="
Write-ColorOutput Green "✓ Coubee service termination completed!"
Write-ColorOutput Cyan "===================================================="

# Ask if the user wants to close the PowerShell window
Write-Host ""
$closeWindow = Read-Host "Do you want to close this PowerShell window? (Y/N)"
if ($closeWindow -eq 'Y' -or $closeWindow -eq 'y') {
    # Use Stop-Process to close current PowerShell window
    Stop-Process -Id $PID
} 

Get-Process java | Where-Object { $_.MainWindowTitle -like "*Gradle*" } | Stop-Process
