#!/bin/bash

# ===================================================================
# Kubernetes Logs Viewer Script
# ===================================================================
# 쿠버네티스에 배포된 서비스들의 로그를 쉽게 확인하는 스크립트
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
RED="31"
BLUE="34"

# Print title
print_color $CYAN "===================================================="
print_color $CYAN "    Kubernetes Services Logs Viewer    "
print_color $CYAN "===================================================="
echo ""

# Service list
SERVICES=(
  "coubee-be-gateway-deployment:Gateway"
  "coubee-be-user-deployment:User"
  "coubee-be-order-deployment:Order"
  "coubee-be-store-deployment:Store"
  "coubee-be-report-deployment:Report"
)

# Function to show service logs
show_logs() {
    local deployment=$1
    local service_name=$2
    local lines=${3:-50}
    
    print_color $GREEN "📋 $service_name Service Logs (최근 $lines줄):"
    print_color $YELLOW "================================================="
    
    if kubectl get deployment $deployment > /dev/null 2>&1; then
        kubectl logs --tail=$lines deployment/$deployment
    else
        print_color $RED "❌ $deployment 배포를 찾을 수 없습니다."
    fi
    
    echo ""
    print_color $YELLOW "================================================="
    echo ""
}

# Function to follow logs in real-time
follow_logs() {
    local deployment=$1
    local service_name=$2
    
    print_color $GREEN "🔄 $service_name Service 실시간 로그 (Ctrl+C로 종료):"
    print_color $YELLOW "================================================="
    
    if kubectl get deployment $deployment > /dev/null 2>&1; then
        kubectl logs -f deployment/$deployment
    else
        print_color $RED "❌ $deployment 배포를 찾을 수 없습니다."
    fi
}

# Main menu
if [ $# -eq 0 ]; then
    print_color $BLUE "사용법:"
    print_color $CYAN "  $0 all [lines]           # 모든 서비스 로그 확인 (기본 50줄)"
    print_color $CYAN "  $0 gateway [lines]       # Gateway 로그만 확인"
    print_color $CYAN "  $0 user [lines]          # User 서비스 로그만 확인"
    print_color $CYAN "  $0 order [lines]         # Order 서비스 로그만 확인"
    print_color $CYAN "  $0 store [lines]         # Store 서비스 로그만 확인"
    print_color $CYAN "  $0 report [lines]        # Report 서비스 로그만 확인"
    print_color $CYAN "  $0 follow <service>      # 실시간 로그 스트리밍"
    echo ""
    print_color $YELLOW "예시:"
    print_color $CYAN "  $0 all 100              # 모든 서비스의 최근 100줄 로그"
    print_color $CYAN "  $0 gateway 200          # Gateway의 최근 200줄 로그"
    print_color $CYAN "  $0 follow order         # Order 서비스 실시간 로그"
    exit 1
fi

COMMAND=$1
LINES=${2:-50}

case $COMMAND in
    "all")
        for service in "${SERVICES[@]}"; do
            IFS=':' read -r deployment name <<< "$service"
            show_logs $deployment "$name" $LINES
        done
        ;;
    "gateway")
        show_logs "coubee-be-gateway-deployment" "Gateway" $LINES
        ;;
    "user")
        show_logs "coubee-be-user-deployment" "User" $LINES
        ;;
    "order")
        show_logs "coubee-be-order-deployment" "Order" $LINES
        ;;
    "store")
        show_logs "coubee-be-store-deployment" "Store" $LINES
        ;;
    "report")
        show_logs "coubee-be-report-deployment" "Report" $LINES
        ;;
    "follow")
        SERVICE=$2
        case $SERVICE in
            "gateway")
                follow_logs "coubee-be-gateway-deployment" "Gateway"
                ;;
            "user")
                follow_logs "coubee-be-user-deployment" "User"
                ;;
            "order")
                follow_logs "coubee-be-order-deployment" "Order"
                ;;
            "store")
                follow_logs "coubee-be-store-deployment" "Store"
                ;;
            "report")
                follow_logs "coubee-be-report-deployment" "Report"
                ;;
            *)
                print_color $RED "❌ 알 수 없는 서비스: $SERVICE"
                print_color $YELLOW "사용 가능한 서비스: gateway, user, order, store, report"
                ;;
        esac
        ;;
    *)
        print_color $RED "❌ 알 수 없는 명령어: $COMMAND"
        print_color $YELLOW "사용법을 보려면: $0"
        ;;
esac
