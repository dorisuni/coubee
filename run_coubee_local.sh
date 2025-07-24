#!/bin/bash

# ===================================================================
# Coubee Microservices Local Run Script (Run without Docker)
# ===================================================================
# Before you start:
# 1. Java 17 and Gradle must be installed.
# 2. Make sure script has execute permissions:
#    chmod +x run_coubee_local.sh
# ===================================================================

# Note: This script uses H2 in-memory DB and embedded services without Docker.

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

# Kill previously running applications
print_color $GREEN "Terminating any previously running Coubee applications..."
pgrep -f "java.*coubee|java.*spring" | xargs kill -9 2>/dev/null || true

# --- Step 1: Start Eureka Server ---
print_color $GREEN "✅ 1. Starting Eureka Server (coubee-be-eureka)..."
cd ./coubee-be-eureka
# Start in new terminal window
gnome-terminal --title="Coubee Eureka Server" -- bash -c "echo -e '\033[36mStarting Coubee Eureka Server...\033[0m'; ./gradlew bootRun --args='--spring.profiles.active=local'; read -p 'Press Enter to close...'" &
cd ..
print_color $YELLOW "   - Waiting 15 seconds for Eureka Server to start."
sleep 15

# --- Step 2: Start User Service ---
print_color $GREEN "✅ 2. Starting User Service (coubee-be-user)..."
cd ./coubee-be-user
# Start in new terminal window
gnome-terminal --title="Coubee User Service" -- bash -c "echo -e '\033[35mStarting Coubee User Service...\033[0m'; ./gradlew bootRun --args='--spring.profiles.active=local'; read -p 'Press Enter to close...'" &
cd ..
print_color $YELLOW "   - Waiting 10 seconds for User Service to start."
sleep 10

# --- Step 3: Start Order Service ---
print_color $GREEN "✅ 3. Starting Order Service (coubee-be-order)..."
cd ./coubee-be-order
# Start in new terminal window
gnome-terminal --title="Coubee Order Service" -- bash -c "echo -e '\033[33mStarting Coubee Order Service...\033[0m'; ./gradlew bootRun --args='--spring.profiles.active=local'; read -p 'Press Enter to close...'" &
cd ..
print_color $YELLOW "   - Waiting 10 seconds for Order Service to start."
sleep 10

# --- Step 4: Start API Gateway ---
print_color $GREEN "✅ 4. Starting API Gateway (coubee-be-gateway)..."
cd ./coubee-be-gateway
# Start in new terminal window
gnome-terminal --title="Coubee API Gateway" -- bash -c "echo -e '\033[32mStarting Coubee API Gateway...\033[0m'; ./gradlew bootRun --args='--spring.profiles.active=local'; read -p 'Press Enter to close...'" &
cd ..

# All services started
print_color $GREEN "🚀 All services have been started in new terminal windows!"
print_color $CYAN "   Eureka Dashboard: http://localhost:8761"
print_color $CYAN "   API Gateway: http://localhost:8080"
print_color $CYAN "   Order Service Swagger UI: http://localhost:8080/swagger-ui.html"
echo ""
print_color $YELLOW "   Note: Each service uses an in-memory H2 database, so data will be reset on restart."
print_color $YELLOW "   If you close each terminal window individually, only that service will be stopped."

# Alternative terminal commands if gnome-terminal is not available
# For WSL with no GUI, comment out the gnome-terminal lines and uncomment these lines:
# cd ./coubee-be-eureka && ./gradlew bootRun --args='--spring.profiles.active=local' > eureka.log 2>&1 &
# cd ./coubee-be-user && ./gradlew bootRun --args='--spring.profiles.active=local' > user.log 2>&1 &
# cd ./coubee-be-order && ./gradlew bootRun --args='--spring.profiles.active=local' > order.log 2>&1 &
# cd ./coubee-be-gateway && ./gradlew bootRun --args='--spring.profiles.active=local' > gateway.log 2>&1 & 