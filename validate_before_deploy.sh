#!/bin/bash

# --- validate_before_deploy.sh ---
# This script validates the environment and prerequisites before deploying
# to Kubernetes to prevent common deployment failures.

set -e

echo "🔍 Pre-Deployment Validation"
echo "============================"
echo ""

VALIDATION_PASSED=true

# Function to mark validation as failed
fail_validation() {
    VALIDATION_PASSED=false
    echo "❌ $1"
}

# Function to mark validation as passed
pass_validation() {
    echo "✅ $1"
}

# Function to mark validation as warning
warn_validation() {
    echo "⚠️  $1"
}

# Check if running in WSL (if script is designed for WSL)
echo "🖥️  Environment Check:"
if [[ $(uname -r) =~ Microsoft ]]; then
    pass_validation "Running in WSL environment"
else
    warn_validation "Not running in WSL - this may still work but script is optimized for WSL"
fi

# Check if kubectl is available
echo ""
echo "🔧 Tool Availability:"
if command -v kubectl &> /dev/null; then
    pass_validation "kubectl is installed"
    
    # Check if cluster is accessible
    if kubectl cluster-info &> /dev/null; then
        pass_validation "Kubernetes cluster is accessible"
    else
        fail_validation "Cannot connect to Kubernetes cluster (run 'minikube start' or check your cluster)"
    fi
else
    fail_validation "kubectl is not installed or not in PATH"
fi

if command -v docker &> /dev/null; then
    pass_validation "Docker is installed"
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        pass_validation "Docker daemon is running"
    else
        fail_validation "Docker daemon is not running (run 'sudo systemctl start docker' or start Docker Desktop)"
    fi
else
    fail_validation "Docker is not installed or not in PATH"
fi

# Check Java for building
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    pass_validation "Java is installed (version: $JAVA_VERSION)"
else
    fail_validation "Java is not installed (required for building Spring Boot applications)"
fi

# Check service directories and configurations
echo ""
echo "📁 Service Structure Check:"

SERVICES=("coubee-be-user" "coubee-be-order" "coubee-be-gateway")
UNIMPLEMENTED=("coubee-be-store" "coubee-be-report")

for service in "${SERVICES[@]}"; do
    if [ -d "$service" ]; then
        pass_validation "Service directory exists: $service"
        
        # Check for gradlew
        if [ -f "$service/gradlew" ]; then
            pass_validation "  Gradle wrapper found"
        else
            fail_validation "  Gradle wrapper not found in $service"
        fi
        
        # Check for Dockerfile
        if [ -f "$service/.docker/Dockerfile" ]; then
            pass_validation "  Dockerfile found"
        else
            fail_validation "  Dockerfile not found at $service/.docker/Dockerfile"
        fi
        
        # Check for Kubernetes configs
        if [ -d "$service/.kube" ]; then
            pass_validation "  Kubernetes config directory found"
            
            # Check for essential k8s files
            if ls "$service/.kube"/*deploy*.yml 1> /dev/null 2>&1; then
                pass_validation "    Deployment config found"
            else
                fail_validation "    Deployment config not found"
            fi
            
            if ls "$service/.kube"/*config*.yml 1> /dev/null 2>&1; then
                pass_validation "    ConfigMap found"
            else
                warn_validation "    ConfigMap not found (may be optional)"
            fi
            
            if ls "$service/.kube"/*secret*.yml 1> /dev/null 2>&1; then
                pass_validation "    Secret config found"
            else
                warn_validation "    Secret config not found (may be optional)"
            fi
        else
            fail_validation "  Kubernetes config directory not found at $service/.kube"
        fi
    else
        fail_validation "Service directory not found: $service"
    fi
done

# Check unimplemented services
echo ""
echo "⏸️  Unimplemented Services (will be skipped):"
for service in "${UNIMPLEMENTED[@]}"; do
    if [ -d "$service" ]; then
        if [ "$(ls -A $service)" ]; then
            warn_validation "Service directory $service exists but may be incomplete"
        else
            pass_validation "Service directory $service is empty (as expected)"
        fi
    else
        pass_validation "Service directory $service does not exist (as expected)"
    fi
done

# Check Kafka configuration
echo ""
echo "📊 Kafka Configuration:"
if [ -f "simple-kafka-allinone.yaml" ]; then
    pass_validation "Kafka all-in-one configuration found"
else
    fail_validation "Kafka configuration not found (simple-kafka-allinone.yaml)"
fi

# Check available disk space
echo ""
echo "💾 Resource Check:"
AVAILABLE_SPACE=$(df . | tail -1 | awk '{print $4}')
if [ "$AVAILABLE_SPACE" -gt 2000000 ]; then  # 2GB in KB
    pass_validation "Sufficient disk space available"
else
    warn_validation "Low disk space - may cause issues during build/deployment"
fi

# Check available memory
AVAILABLE_MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $7}')
if [ "$AVAILABLE_MEMORY" -gt 2048 ]; then  # 2GB
    pass_validation "Sufficient memory available"
else
    warn_validation "Low memory - may cause issues during deployment"
fi

# Final validation result
echo ""
echo "📋 Validation Summary:"
echo "====================="

if [ "$VALIDATION_PASSED" = true ]; then
    echo "✅ All critical validations passed!"
    echo ""
    echo "🚀 You can proceed with deployment:"
    echo "   ./deploy_all_to_k8s_wsl.sh"
    echo ""
    echo "📊 After deployment, run diagnostics:"
    echo "   ./diagnose_k8s_deployment.sh"
    exit 0
else
    echo "❌ Some validations failed!"
    echo ""
    echo "🔧 Please fix the issues above before deploying."
    echo ""
    echo "💡 Common fixes:"
    echo "   - Install missing tools (kubectl, docker, java)"
    echo "   - Start your Kubernetes cluster (minikube start)"
    echo "   - Start Docker daemon"
    echo "   - Check service directory structure"
    echo ""
    exit 1
fi
