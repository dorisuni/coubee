#!/bin/bash

# ===================================================================
# Coubee Local Microservices Termination Script for WSL (No GUI)
# ===================================================================
# WARNING: This script will terminate all running Java processes for Coubee.
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
print_color $CYAN "    Coubee Microservices Termination Script (WSL)    "
print_color $CYAN "===================================================="
echo ""

# Check for saved PIDs from run script
if [ -f "logs/service_pids.txt" ]; then
  print_color $GREEN "✅ Terminating services using saved PIDs..."
  
  # Read PIDs from file
  pids=$(cat logs/service_pids.txt)
  
  # Display PIDs
  print_color $YELLOW "   Found PIDs: $pids"
  
  # Terminate each PID
  for pid in $pids; do
    if ps -p $pid > /dev/null 2>&1; then
      print_color $YELLOW "   Terminating process with PID: $pid"
      kill -9 $pid 2>/dev/null
    else
      print_color $RED "   Process with PID $pid is no longer running"
    fi
  done
  
  # Remove the PID file
  rm logs/service_pids.txt
  print_color $GREEN "   PID file has been removed."
else
  print_color $YELLOW "   No PID file found. Searching for Java processes..."
  
  # --- Search for Coubee-related Java processes ---
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
fi

# Clean up log files
echo ""
print_color $GREEN "✅ Checking for log files..."
if [ -d "logs" ] && [ "$(ls -A logs)" ]; then
  read -p "Do you want to clean up log files? (Y/N) " clean_logs
  if [[ $clean_logs == [Yy]* ]]; then
    rm -f logs/*.log
    print_color $GREEN "   Log files have been removed."
  else
    print_color $YELLOW "   Log files will be kept."
  fi
else
  print_color $YELLOW "   No log files found or logs directory does not exist."
fi

# Gradle daemon termination
gradle_daemons=$(pgrep -f "GradleDaemon" 2>/dev/null)
if [ ! -z "$gradle_daemons" ]; then
  echo ""
  print_color $GREEN "✅ Checking for Gradle daemons..."
  print_color $YELLOW "   Found $(echo $gradle_daemons | wc -w) Gradle daemons running."
  read -p "Do you want to terminate Gradle daemons too? (Y/N) " kill_gradle
  if [[ $kill_gradle == [Yy]* ]]; then
    for pid in $gradle_daemons; do
      kill -9 $pid 2>/dev/null
    done
    print_color $GREEN "   All Gradle daemons have been terminated."
  else
    print_color $YELLOW "   Gradle daemons will continue to run."
  fi
fi

# Script end message
echo ""
print_color $CYAN "===================================================="
print_color $GREEN "✓ Coubee service termination completed!"
print_color $CYAN "====================================================" 