#!/bin/bash

# ===================================================================
# Kafka Port Forward Setup Script for Local Development
# ===================================================================
# This script sets up port forwarding from minikube Kafka to localhost
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

# Print title
print_color $CYAN "===================================================="
print_color $CYAN "    Kafka Port Forward Setup for Local Development    "
print_color $CYAN "===================================================="
echo ""

# Check if minikube is running
print_color $GREEN "✅ Checking minikube status..."
if ! minikube status | grep -q "Running"; then
    print_color $RED "❌ Minikube is not running. Please start minikube first."
    exit 1
fi

# Check if Kafka is deployed
print_color $GREEN "✅ Checking Kafka deployment..."
if ! kubectl get pods -n kafka | grep -q "kafka-0.*Running"; then
    print_color $RED "❌ Kafka is not running in minikube. Please deploy Kafka first."
    print_color $YELLOW "   Run: cd coubee-kafka && ./deploy.sh"
    exit 1
fi

# Kill existing port forward processes
print_color $GREEN "✅ Cleaning up existing port forwards..."
pkill -f "kubectl.*port-forward.*kafka" 2>/dev/null || true
sleep 2

# Setup port forwarding for Kafka
print_color $GREEN "✅ Setting up Kafka port forwarding..."
print_color $YELLOW "   Forwarding kafka-0:9092 -> localhost:9092"

# Start port forwarding in background
kubectl port-forward -n kafka kafka-0 9092:9092 > /dev/null 2>&1 &
KAFKA_PF_PID=$!

# Wait a moment for port forwarding to establish
sleep 3

# Check if port forwarding is working
if ps -p $KAFKA_PF_PID > /dev/null; then
    print_color $GREEN "✅ Kafka port forwarding established successfully!"
    print_color $CYAN "   Kafka is now accessible at: localhost:9092"
    print_color $YELLOW "   Port forward PID: $KAFKA_PF_PID"
    
    # Save PID for cleanup
    echo $KAFKA_PF_PID > kafka_port_forward.pid
    
    echo ""
    print_color $GREEN "🚀 You can now run your local services with:"
    print_color $CYAN "   ./run_coubee_local_wsl.sh"
    echo ""
    print_color $YELLOW "⚠️  To stop port forwarding later, run:"
    print_color $CYAN "   ./stop_kafka_port_forward.sh"
else
    print_color $RED "❌ Failed to establish Kafka port forwarding"
    exit 1
fi
