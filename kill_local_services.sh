#!/bin/bash

# ===================================================================
# Coubee Local Microservices Termination Script (Bash/WSL)
# ===================================================================
# WARNING: This script will forcibly terminate all running Java processes.
# Please make sure no other important Java applications are running before use.
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

# Print title
print_color $CYAN "===================================================="
print_color $CYAN "       Coubee Microservices Termination Script       "
print_color $CYAN "===================================================="
echo ""

# --- Step 1: Terminate only Coubee-related Java processes ---
print_color $GREEN "✅ 1. Terminating Coubee-related Spring Boot applications..."
COUBEE_PROCESSES=$(pgrep -f "java.*coubee|java.*spring" 2>/dev/null)

if [ ! -z "$COUBEE_PROCESSES" ]; then
  print_color $YELLOW "   The following Java processes will be terminated:"
  
  for pid in $COUBEE_PROCESSES; do
    cmd=$(ps -p $pid -o cmd= 2>/dev/null)
    echo "   - PID: $pid, Command: ${cmd:0:80}..."
  done
  
  echo ""
  read -p "Do you want to terminate these processes? (Y/N) " confirmation
  if [[ $confirmation == [Yy]* ]]; then
    for pid in $COUBEE_PROCESSES; do
      kill -9 $pid 2>/dev/null
    done
    print_color $GREEN "   All Coubee-related Java processes have been terminated."
  else
    print_color $YELLOW "   Process termination has been cancelled."
  fi
else
  print_color $YELLOW "   No running Coubee-related Java processes found."
fi

# --- Step 2: Show all other Java processes and provide optional termination ---
echo ""
print_color $GREEN "✅ 2. Checking for other running Java processes..."
OTHER_JAVA_PROCESSES=$(pgrep -f "java" | grep -v -f <(echo "$COUBEE_PROCESSES") 2>/dev/null)

if [ ! -z "$OTHER_JAVA_PROCESSES" ]; then
  print_color $YELLOW "   The following Java processes are still running:"
  
  for pid in $OTHER_JAVA_PROCESSES; do
    cmd=$(ps -p $pid -o cmd= 2>/dev/null)
    start_time=$(ps -p $pid -o lstart= 2>/dev/null)
    echo "   - PID: $pid, Start Time: $start_time, Command: ${cmd:0:80}..."
  done
  
  echo ""
  read -p "Do you want to terminate all Java processes? This may also close IDEs such as IntelliJ. (Y/N) " kill_all
  if [[ $kill_all == [Yy]* ]]; then
    pkill -9 java 2>/dev/null
    print_color $GREEN "   All Java processes have been terminated."
  else
    print_color $YELLOW "   The remaining Java processes will continue to run."
  fi
else
  print_color $GREEN "   No other Java processes are running."
fi

# Script end message
echo ""
print_color $CYAN "===================================================="
print_color $GREEN "✓ Coubee service termination completed!"
print_color $CYAN "===================================================="

# Gradle daemon termination
gradle_daemons=$(pgrep -f "GradleDaemon" 2>/dev/null)
if [ ! -z "$gradle_daemons" ]; then
  echo ""
  read -p "Do you want to terminate Gradle daemons too? (Y/N) " kill_gradle
  if [[ $kill_gradle == [Yy]* ]]; then
    for pid in $gradle_daemons; do
      kill -9 $pid 2>/dev/null
    done
    print_color $GREEN "   All Gradle daemons have been terminated."
  fi
fi 