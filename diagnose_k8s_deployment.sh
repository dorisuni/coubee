#!/bin/bash

# --- diagnose_k8s_deployment.sh ---
# This script diagnoses common issues with Coubee Kubernetes deployments
# and provides detailed information about the current state.

set -e

echo "🔍 Coubee Kubernetes Deployment Diagnostics"
echo "=============================================="
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    echo "   Make sure your cluster is running (minikube start, etc.)"
    exit 1
fi

echo "✅ kubectl is available and cluster is accessible"
echo ""

# Function to check service status
check_service_status() {
    local service_name=$1
    echo "📦 Checking $service_name..."
    
    # Check if deployment exists
    if kubectl get deployment "${service_name}-deployment" &> /dev/null; then
        echo "  ✅ Deployment exists"
        
        # Get deployment status
        local ready_replicas=$(kubectl get deployment "${service_name}-deployment" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        local desired_replicas=$(kubectl get deployment "${service_name}-deployment" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "1")
        
        if [ "$ready_replicas" = "$desired_replicas" ] && [ "$ready_replicas" != "0" ]; then
            echo "  ✅ Deployment is ready ($ready_replicas/$desired_replicas replicas)"
        else
            echo "  ⚠️  Deployment not ready ($ready_replicas/$desired_replicas replicas)"
            
            # Get pod status
            echo "  📋 Pod status:"
            kubectl get pods -l app="$service_name" --no-headers | while read line; do
                echo "    $line"
            done
            
            # Check for common issues
            local pods=$(kubectl get pods -l app="$service_name" -o jsonpath='{.items[*].metadata.name}' 2>/dev/null)
            for pod in $pods; do
                local status=$(kubectl get pod "$pod" -o jsonpath='{.status.phase}' 2>/dev/null)
                if [ "$status" != "Running" ]; then
                    echo "  🔍 Pod $pod issues:"
                    kubectl describe pod "$pod" | grep -A 5 -B 5 "Warning\|Error\|Failed" || echo "    No obvious errors in describe"
                fi
            done
        fi
    else
        echo "  ❌ Deployment not found"
    fi
    
    # Check if service exists
    if kubectl get service "${service_name}-service" &> /dev/null; then
        echo "  ✅ Service exists"
    else
        echo "  ⚠️  Service not found"
    fi
    
    # Check if configmap exists
    local config_name=""
    case $service_name in
        "coubee-be-gateway") config_name="api-gateway-config" ;;
        "coubee-be-user") config_name="be-user-config" ;;
        "coubee-be-order") config_name="be-order-config" ;;
    esac
    
    if [ -n "$config_name" ]; then
        if kubectl get configmap "$config_name" &> /dev/null; then
            echo "  ✅ ConfigMap exists"
        else
            echo "  ⚠️  ConfigMap not found"
        fi
    fi
    
    echo ""
}

# Check each service
SERVICES=("coubee-be-user" "coubee-be-order" "coubee-be-gateway")

for service in "${SERVICES[@]}"; do
    check_service_status "$service"
done

# Check Kafka
echo "📊 Checking Kafka..."
if kubectl get namespace kafka &> /dev/null; then
    echo "  ✅ Kafka namespace exists"
    
    if kubectl get pod kafka-0 -n kafka &> /dev/null; then
        local kafka_status=$(kubectl get pod kafka-0 -n kafka -o jsonpath='{.status.phase}' 2>/dev/null)
        if [ "$kafka_status" = "Running" ]; then
            echo "  ✅ Kafka pod is running"
        else
            echo "  ⚠️  Kafka pod status: $kafka_status"
        fi
    else
        echo "  ❌ Kafka pod not found"
    fi
    
    if kubectl get service coubee-external-kafka-service &> /dev/null; then
        echo "  ✅ Kafka external service exists"
    else
        echo "  ⚠️  Kafka external service not found"
    fi
else
    echo "  ❌ Kafka namespace not found"
fi
echo ""

# Overall cluster status
echo "🌐 Overall Cluster Status:"
echo "=========================="
echo ""
echo "📋 All Pods:"
kubectl get pods --all-namespaces | grep -E "(coubee|kafka)" || echo "No Coubee or Kafka pods found"
echo ""

echo "🔗 All Services:"
kubectl get services --all-namespaces | grep -E "(coubee|kafka)" || echo "No Coubee or Kafka services found"
echo ""

echo "📦 All Deployments:"
kubectl get deployments --all-namespaces | grep -E "(coubee|kafka)" || echo "No Coubee or Kafka deployments found"
echo ""

# Check for common issues
echo "🔍 Common Issues Check:"
echo "======================"

# Check for ImagePullBackOff
local image_issues=$(kubectl get pods --all-namespaces | grep -E "(ImagePullBackOff|ErrImagePull)" || true)
if [ -n "$image_issues" ]; then
    echo "❌ Image pull issues found:"
    echo "$image_issues"
    echo "   💡 Solution: Make sure Docker images are built locally or available in registry"
else
    echo "✅ No image pull issues"
fi

# Check for CrashLoopBackOff
local crash_issues=$(kubectl get pods --all-namespaces | grep "CrashLoopBackOff" || true)
if [ -n "$crash_issues" ]; then
    echo "❌ Crash loop issues found:"
    echo "$crash_issues"
    echo "   💡 Solution: Check pod logs with 'kubectl logs <pod-name>'"
else
    echo "✅ No crash loop issues"
fi

# Check for resource issues
local resource_issues=$(kubectl get pods --all-namespaces | grep -E "(OutOfMemory|Evicted)" || true)
if [ -n "$resource_issues" ]; then
    echo "❌ Resource issues found:"
    echo "$resource_issues"
    echo "   💡 Solution: Increase resource limits or free up cluster resources"
else
    echo "✅ No resource issues"
fi

echo ""
echo "🎯 Quick Commands for Troubleshooting:"
echo "======================================"
echo "View logs for gateway:  kubectl logs -f deployment/coubee-be-gateway-deployment"
echo "View logs for user:     kubectl logs -f deployment/coubee-be-user-deployment"
echo "View logs for order:    kubectl logs -f deployment/coubee-be-order-deployment"
echo "View logs for kafka:    kubectl logs -f kafka-0 -n kafka"
echo ""
echo "Describe problematic pod: kubectl describe pod <pod-name>"
echo "Get events:             kubectl get events --sort-by=.metadata.creationTimestamp"
echo "Check resource usage:   kubectl top pods"
echo ""
echo "Access gateway service: minikube service coubee-be-gateway-nodeport"
echo "Port-forward to kafka:  kubectl port-forward service/kafdrop-service -n kafka 9000:9000"
echo ""
