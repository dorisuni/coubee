#!/bin/bash

# ===================================================================
# Stop Kafka Port Forward Script
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

print_color $CYAN "===================================================="
print_color $CYAN "    Stopping Kafka Port Forward    "
print_color $CYAN "===================================================="
echo ""

# Check for saved PID
if [ -f "kafka_port_forward.pid" ]; then
    PID=$(cat kafka_port_forward.pid)
    if ps -p $PID > /dev/null 2>&1; then
        print_color $GREEN "✅ Stopping Kafka port forward (PID: $PID)..."
        kill $PID
        print_color $GREEN "   Kafka port forward stopped."
    else
        print_color $YELLOW "   Kafka port forward process is not running."
    fi
    rm kafka_port_forward.pid
else
    print_color $YELLOW "   No saved PID found. Killing all kubectl port-forward processes for Kafka..."
    pkill -f "kubectl.*port-forward.*kafka" 2>/dev/null || true
fi

print_color $GREEN "✅ Cleanup completed!"
