#!/bin/bash

# ===================================================================
# Kafka Only Deployment Script for minikube
# ===================================================================
# Kafka 클러스터만 minikube에 배포하는 스크립트
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
print_color $CYAN "    Kafka Only Deployment for minikube    "
print_color $CYAN "===================================================="
echo ""

# Check if minikube is running
print_color $GREEN "✅ Checking minikube status..."
if ! minikube status | grep -q "Running"; then
    print_color $RED "❌ Minikube is not running. Please start minikube first."
    print_color $YELLOW "   Run: minikube start --cpus=4 --memory=12g"
    exit 1
fi

print_color $GREEN "✅ Minikube is running."
echo ""

# Check if coubee-kafka directory exists
if [ ! -d "coubee-kafka/manifests" ]; then
    print_color $RED "❌ coubee-kafka/manifests directory not found."
    print_color $YELLOW "   Please run this script from the project root directory."
    exit 1
fi

print_color $GREEN "✅ Kafka manifests found."
echo ""

# --- Choose Deployment Type ---
print_color $CYAN "🔧 Choose Kafka deployment type:"
print_color $YELLOW "   1) Standard Kafka (Separate Zookeeper + Kafka)"
print_color $YELLOW "   2) All-in-One Kafka (Zookeeper + Kafka in single container) - Recommended"
echo ""
read -p "Select deployment type (1 or 2, default: 2): " deploy_type
deploy_type=${deploy_type:-2}

if [[ "$deploy_type" == "1" ]]; then
    DEPLOYMENT_MODE="standard"
    print_color $GREEN "✅ Selected: Standard Kafka deployment"
elif [[ "$deploy_type" == "2" ]]; then
    DEPLOYMENT_MODE="allinone"
    print_color $GREEN "✅ Selected: All-in-One Kafka deployment"
else
    print_color $RED "❌ Invalid selection. Using All-in-One deployment."
    DEPLOYMENT_MODE="allinone"
fi

echo ""

# --- Deploy Kafka Cluster ---
print_color $CYAN "🔵 Deploying Kafka Cluster..."
echo "================================================="

if [[ "$DEPLOYMENT_MODE" == "standard" ]]; then
    # === Standard Kafka Deployment ===
    print_color $GREEN "📁 Creating Kafka namespace..."
    kubectl apply -f coubee-kafka/manifests/00-namespace.yaml

    # Deploy Zookeeper
    print_color $GREEN "🐘 Deploying Zookeeper..."
    kubectl apply -f coubee-kafka/manifests/01-zookeeper.yaml

    # Wait for Zookeeper to be ready
    print_color $YELLOW "⏳ Waiting for Zookeeper to be ready (up to 10 minutes)..."
    if ! kubectl wait --for=condition=ready pod/zookeeper-0 -n kafka --timeout=600s; then
        print_color $RED "❌ Zookeeper failed to start within 10 minutes."
        print_color $YELLOW "   Checking Zookeeper status..."
        kubectl get pods -n kafka
        kubectl describe pod zookeeper-0 -n kafka
        exit 1
    fi

    print_color $GREEN "✅ Zookeeper is ready!"

    # Deploy Kafka
    print_color $GREEN "☕ Deploying Kafka..."
    kubectl apply -f coubee-kafka/manifests/02-kafka.yaml

    # Wait for Kafka to be ready
    print_color $YELLOW "⏳ Waiting for Kafka to be ready (up to 10 minutes)..."
    if ! kubectl wait --for=condition=ready pod/kafka-0 -n kafka --timeout=600s; then
        print_color $RED "❌ Kafka failed to start within 10 minutes."
        print_color $YELLOW "   Checking Kafka status..."
        kubectl get pods -n kafka
        kubectl describe pod kafka-0 -n kafka
        kubectl logs kafka-0 -n kafka --tail=20
        exit 1
    fi

    print_color $GREEN "✅ Kafka is ready!"

    # Deploy Kafka UI
    print_color $GREEN "🖥️  Deploying Kafka UI..."
    kubectl apply -f coubee-kafka/manifests/03-kafka-ui.yaml

    print_color $GREEN "✅ Kafka UI deployed!"

elif [[ "$DEPLOYMENT_MODE" == "allinone" ]]; then
    # === All-in-One Kafka Deployment ===
    print_color $GREEN "🚀 Deploying All-in-One Kafka (Zookeeper + Kafka)..."
    kubectl apply -f simple-kafka-allinone.yaml

    # Wait for Kafka to be ready
    print_color $YELLOW "⏳ Waiting for All-in-One Kafka to be ready (up to 10 minutes)..."
    if ! kubectl wait --for=condition=ready pod/kafka-0 -n kafka --timeout=600s; then
        print_color $RED "❌ All-in-One Kafka failed to start within 10 minutes."
        print_color $YELLOW "   Checking Kafka status..."
        kubectl get pods -n kafka
        kubectl describe pod kafka-0 -n kafka
        kubectl logs kafka-0 -n kafka --tail=20
        exit 1
    fi

    print_color $GREEN "✅ All-in-One Kafka is ready!"

    # Wait for Kafdrop to be ready
    print_color $YELLOW "⏳ Waiting for Kafdrop UI to be ready..."
    if ! kubectl wait --for=condition=ready pod -l app=kafdrop -n kafka --timeout=300s; then
        print_color $YELLOW "⚠️  Kafdrop UI failed to start, but continuing..."
    else
        print_color $GREEN "✅ Kafdrop UI is ready!"
    fi
fi

# Create ExternalName Service
print_color $GREEN "🔗 Creating Kafka ExternalName Service..."
if [[ "$DEPLOYMENT_MODE" == "standard" ]]; then
    kubectl apply -f kafka-external-name-service.yml
elif [[ "$DEPLOYMENT_MODE" == "allinone" ]]; then
    # All-in-One용 임시 ExternalName 서비스 생성
    cat > temp-external-service.yaml << 'EOF'
apiVersion: v1
kind: Service
metadata:
  name: coubee-external-kafka-service
  namespace: default
spec:
  type: ExternalName
  externalName: kafka-service.kafka.svc.cluster.local
EOF
    kubectl apply -f temp-external-service.yaml
    rm temp-external-service.yaml
fi

print_color $GREEN "✅ ExternalName Service created!"

# Test connectivity
print_color $GREEN "🔍 Testing Kafka connectivity..."
sleep 5
kubectl run kafka-test --image=busybox --rm -i --restart=Never --namespace=default -- nslookup coubee-external-kafka-service.default.svc.cluster.local || print_color $YELLOW "⚠️  DNS resolution test failed (this might be normal during initial setup)"

echo ""
print_color $GREEN "🎉 Kafka deployment completed successfully!"
echo "================================================="

# Display connection information
print_color $CYAN "📋 Connection Information:"
if [[ "$DEPLOYMENT_MODE" == "standard" ]]; then
    print_color $YELLOW "   Internal Kafka: kafka-headless.kafka.svc.cluster.local:9092"
    print_color $YELLOW "   External Service: coubee-external-kafka-service:9092"
    print_color $YELLOW "   Kafka UI: kubectl port-forward service/kafka-ui 8080:8080 -n kafka"
    print_color $YELLOW "   Access Kafka UI: minikube service kafka-ui -n kafka"
elif [[ "$DEPLOYMENT_MODE" == "allinone" ]]; then
    print_color $YELLOW "   Internal Kafka: kafka-service.kafka.svc.cluster.local:9092"
    print_color $YELLOW "   External Service: coubee-external-kafka-service:9092"
    print_color $YELLOW "   Kafdrop UI: kubectl port-forward service/kafdrop-service 9000:9000 -n kafka"
    print_color $YELLOW "   Access Kafdrop UI: minikube service kafdrop-service -n kafka"
fi

echo ""
print_color $CYAN "🔧 Useful Commands:"
print_color $YELLOW "   Check status: kubectl get pods -n kafka"
print_color $YELLOW "   View logs: kubectl logs kafka-0 -n kafka"
if [[ "$DEPLOYMENT_MODE" == "allinone" ]]; then
    print_color $YELLOW "   View Kafdrop logs: kubectl logs -l app=kafdrop -n kafka"
    print_color $YELLOW "   Access Kafdrop: http://localhost:9000 (after port-forward)"
fi
print_color $YELLOW "   Test connectivity: ./test_kafka_connectivity.sh"

echo ""
print_color $GREEN "✅ Ready to deploy applications!"
print_color $CYAN "===================================================="
