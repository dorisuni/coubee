#!/bin/bash

# ===================================================================
# Save Kubernetes Logs to Files
# ===================================================================
# K8s 서비스 로그를 로컬 logs/ 폴더에 저장하는 스크립트
# ===================================================================

# Function for colored output
function print_color() {
  local color_code="$1"
  local text="$2"
  echo -e "\033[${color_code}m${text}\033[0m"
}

# Define color codes
CYAN="36"
GREEN="32"
YELLOW="33"

print_color $CYAN "===================================================="
print_color $CYAN "    Saving Kubernetes Logs to Files    "
print_color $CYAN "===================================================="
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Get current timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Service list
SERVICES=(
  "coubee-be-gateway-deployment:gateway"
  "coubee-be-user-deployment:user"
  "coubee-be-order-deployment:order"
  "coubee-be-store-deployment:store"
  "coubee-be-report-deployment:report"
)

print_color $GREEN "📁 로그를 logs/ 폴더에 저장합니다..."
echo ""

for service in "${SERVICES[@]}"; do
    IFS=':' read -r deployment name <<< "$service"
    
    if kubectl get deployment $deployment > /dev/null 2>&1; then
        LOG_FILE="logs/${name}_${TIMESTAMP}.log"
        print_color $YELLOW "💾 $name 서비스 로그 저장 중... → $LOG_FILE"
        kubectl logs deployment/$deployment > $LOG_FILE
        print_color $GREEN "   ✅ 저장 완료 ($(wc -l < $LOG_FILE) 줄)"
    else
        print_color $YELLOW "   ⚠️  $deployment 배포를 찾을 수 없습니다."
    fi
done

echo ""
print_color $GREEN "🎉 모든 로그 저장 완료!"
print_color $CYAN "저장된 파일들:"
ls -la logs/*_${TIMESTAMP}.log 2>/dev/null || print_color $YELLOW "저장된 로그 파일이 없습니다."
