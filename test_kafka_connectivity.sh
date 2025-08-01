#!/bin/bash

# ===================================================================
# Kafka Connectivity Test Script
# ===================================================================
# Tests Kafka connectivity from within Kubernetes cluster
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
print_color $CYAN "    Kafka Connectivity Test    "
print_color $CYAN "===================================================="
echo ""

# Test 1: Check if Kafka pods are running
print_color $GREEN "✅ Test 1: Checking Kafka pods status..."
if kubectl get pods -n kafka | grep -q "kafka-0.*Running"; then
    print_color $GREEN "   ✓ Kafka pods are running"
    kubectl get pods -n kafka | grep kafka
else
    print_color $RED "   ✗ Kafka pods are not running"
    exit 1
fi

echo ""

# Test 2: Check Kafka services
print_color $GREEN "✅ Test 2: Checking Kafka services..."
kubectl get svc -n kafka
echo ""

# Test 3: Check ExternalName service
print_color $GREEN "✅ Test 3: Checking ExternalName service..."
if kubectl get svc coubee-external-kafka-service -n default > /dev/null 2>&1; then
    print_color $GREEN "   ✓ ExternalName service exists"
    kubectl get svc coubee-external-kafka-service -n default
else
    print_color $RED "   ✗ ExternalName service not found"
    print_color $YELLOW "   Run: kubectl apply -f kafka-external-name-service.yml"
fi

echo ""

# Test 4: DNS resolution test
print_color $GREEN "✅ Test 4: Testing DNS resolution from default namespace..."
kubectl run kafka-test --image=busybox --rm -i --restart=Never --namespace=default -- nslookup coubee-external-kafka-service.default.svc.cluster.local

echo ""

# Test 5: Network connectivity test
print_color $GREEN "✅ Test 5: Testing network connectivity to Kafka..."
kubectl run kafka-test --image=busybox --rm -i --restart=Never --namespace=default -- nc -zv coubee-external-kafka-service 9092

echo ""

# Test 6: Check if applications can resolve Kafka
print_color $GREEN "✅ Test 6: Testing from application pod perspective..."
APP_POD=$(kubectl get pods -n default | grep "coubee-be-" | head -1 | awk '{print $1}')
if [ ! -z "$APP_POD" ]; then
    print_color $YELLOW "   Testing from pod: $APP_POD"
    kubectl exec -n default $APP_POD -- nslookup coubee-external-kafka-service 2>/dev/null || print_color $YELLOW "   No application pods found or DNS test failed"
else
    print_color $YELLOW "   No application pods found to test from"
fi

echo ""
print_color $CYAN "===================================================="
print_color $GREEN "✓ Kafka connectivity test completed!"
print_color $CYAN "===================================================="
