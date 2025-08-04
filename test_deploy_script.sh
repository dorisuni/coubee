#!/bin/bash

# Test script for deploy_all_to_k8s_wsl.sh
# This script tests the command line argument parsing without actually deploying

echo "🧪 Testing deploy_all_to_k8s_wsl.sh argument parsing..."
echo "================================================="

# Test 1: Default (no arguments)
echo ""
echo "Test 1: Default mode (no arguments)"
echo "Command: ./deploy_all_to_k8s_wsl.sh --help"
echo "Expected: Should show help and exit"
./deploy_all_to_k8s_wsl.sh --help

echo ""
echo "================================================="
echo ""

# Test 2: Parallel mode (explicit)
echo "Test 2: Parallel mode (explicit)"
echo "Command: ./deploy_all_to_k8s_wsl.sh --parallel --help"
echo "Expected: Should show help and exit"
./deploy_all_to_k8s_wsl.sh --parallel --help

echo ""
echo "================================================="
echo ""

# Test 3: Sequential mode
echo "Test 3: Sequential mode"
echo "Command: ./deploy_all_to_k8s_wsl.sh --sequential --help"
echo "Expected: Should show help and exit"
./deploy_all_to_k8s_wsl.sh --sequential --help

echo ""
echo "================================================="
echo ""

# Test 4: Invalid argument
echo "Test 4: Invalid argument"
echo "Command: ./deploy_all_to_k8s_wsl.sh --invalid"
echo "Expected: Should show error and exit"
./deploy_all_to_k8s_wsl.sh --invalid || echo "✅ Correctly handled invalid argument"

echo ""
echo "================================================="
echo "✅ All tests completed!"
echo ""
echo "💡 To actually deploy services:"
echo "   ./deploy_all_to_k8s_wsl.sh                # Parallel mode (default, faster)"
echo "   ./deploy_all_to_k8s_wsl.sh --parallel     # Parallel mode (explicit)"
echo "   ./deploy_all_to_k8s_wsl.sh --sequential   # Sequential mode (slower, but waits for each service)"
