#!/bin/bash

# ===================================================================
# Coubee Microservices Local Run Script for WSL (No GUI)
# ===================================================================
# Before you start:
# 1. Java 17 and Gradle must be installed.
# 2. Make sure script has execute permissions:
#    chmod +x run_coubee_local_wsl.sh
# ===================================================================

# Note: This script uses H2 in-memory DB and embedded services without Docker.
# It runs services in background and redirects output to log files.

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

# Create logs directory
mkdir -p logs

# Kill previously running applications
print_color $GREEN "Terminating any previously running Coubee applications..."
pgrep -f "java.*coubee|java.*spring" | xargs kill -9 2>/dev/null || true

# --- Step 1: Start Eureka Server ---
print_color $GREEN "✅ 1. Starting Eureka Server (coubee-be-eureka)..."
cd ./coubee-be-eureka
./gradlew bootRun --args='--spring.profiles.active=local' > ../logs/eureka.log 2>&1 &
EUREKA_PID=$!
echo "   - Eureka Server started with PID: $EUREKA_PID"
cd ..
print_color $YELLOW "   - Waiting 15 seconds for Eureka Server to start."
sleep 15

# --- Step 2: Start User Service ---
print_color $GREEN "✅ 2. Starting User Service (coubee-be-user)..."
cd ./coubee-be-user
./gradlew bootRun --args='--spring.profiles.active=local' > ../logs/user.log 2>&1 &
USER_PID=$!
echo "   - User Service started with PID: $USER_PID"
cd ..
print_color $YELLOW "   - Waiting 10 seconds for User Service to start."
sleep 10

# --- Step 3: Start Order Service ---
print_color $GREEN "✅ 3. Starting Order Service (coubee-be-order)..."
cd ./coubee-be-order
./gradlew bootRun --args='--spring.profiles.active=local' > ../logs/order.log 2>&1 &
ORDER_PID=$!
echo "   - Order Service started with PID: $ORDER_PID"
cd ..
print_color $YELLOW "   - Waiting 10 seconds for Order Service to start."
sleep 10

# --- Step 4: Start API Gateway ---
print_color $GREEN "✅ 4. Starting API Gateway (coubee-be-gateway)..."
cd ./coubee-be-gateway
./gradlew bootRun --args='--spring.profiles.active=local' > ../logs/gateway.log 2>&1 &
GATEWAY_PID=$!
echo "   - API Gateway started with PID: $GATEWAY_PID"
cd ..

# Save PIDs to file for easy termination later
echo "$EUREKA_PID $USER_PID $ORDER_PID $GATEWAY_PID" > logs/service_pids.txt

# All services started
print_color $GREEN "🚀 All services have been started in background!"
print_color $CYAN "   Eureka Dashboard: http://localhost:8761"
print_color $CYAN "   API Gateway: http://localhost:8080"
print_color $CYAN "   Order Service Swagger UI: http://localhost:8083/swagger-ui.html"
echo ""
print_color $YELLOW "   Note: Each service uses an in-memory H2 database, so data will be reset on restart."
print_color $YELLOW "   Service logs are available in the logs directory."
print_color $GREEN "   To view logs in real-time, run: tail -f logs/[service-name].log"
print_color $GREEN "   To terminate all services, run: ./kill_local_services.sh"
echo ""
print_color $YELLOW "   Active service PIDs:"
print_color $YELLOW "   - Eureka Server: $EUREKA_PID"
print_color $YELLOW "   - User Service: $USER_PID"
print_color $YELLOW "   - Order Service: $ORDER_PID"
print_color $YELLOW "   - API Gateway: $GATEWAY_PID" 