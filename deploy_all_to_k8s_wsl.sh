#!/bin/bash

# --- deploy_all_to_k8s_wsl.sh ---
# This script builds and deploys all Coubee microservices to a Kubernetes environment in WSL.
# WSL 환경에서 Kubernetes 클러스터에 모든 서비스를 배포합니다.

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if running in WSL
if [[ ! $(uname -r) =~ Microsoft ]]; then
  echo "⚠️  This script is designed to run in WSL (Windows Subsystem for Linux)."
  echo "    If you're running in a different environment, use deploy_all_to_k8s.sh instead."
  read -p "Continue anyway? (y/n): " confirm
  if [[ ! $confirm =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# --- Deploy Kafka to Kubernetes Cluster ---
echo "🔵 Deploying Kafka to Kubernetes cluster..."
echo "================================================="

# Check if kafka namespace exists
if kubectl get namespace kafka &> /dev/null; then
  echo "Kafka namespace already exists. Skipping Kafka deployment."
else
  # Create namespace
  echo "Creating Kafka namespace..."
  kubectl apply -f coubee-kafka/manifests/00-namespace.yaml

  # Deploy Zookeeper
  echo "Deploying Zookeeper..."
  kubectl apply -f coubee-kafka/manifests/01-zookeeper.yaml

  # Wait for Zookeeper to be ready (only first pod for faster deployment)
  echo "Waiting for Zookeeper to be ready..."
  kubectl wait --for=condition=ready pod/zookeeper-0 -n kafka --timeout=300s

  # Deploy Kafka
  echo "Deploying Kafka..."
  kubectl apply -f coubee-kafka/manifests/02-kafka.yaml

  # Wait for Kafka to be ready (only first pod for faster deployment)
  echo "Waiting for Kafka to be ready..."
  if ! kubectl wait --for=condition=ready pod/kafka-0 -n kafka --timeout=300s; then
    echo "⚠️  Kafka pod failed to start within 300 seconds. Checking status..."
    kubectl get pods -n kafka
    kubectl describe pod kafka-0 -n kafka
    echo "❌ Kafka deployment failed. Please check the logs and try again."
    exit 1
  fi

  # Deploy Kafka UI
  echo "Deploying Kafka UI..."
  kubectl apply -f coubee-kafka/manifests/03-kafka-ui.yaml

  echo "🟢 Kafka deployment completed."
  echo "Internal Kafka bootstrap servers: kafka-headless.kafka.svc.cluster.local:9092"

  # Create Kafka ExternalName Service immediately after Kafka deployment
  echo ""
  echo "🔵 Creating Kafka ExternalName Service..."
  echo "================================================="
  kubectl apply -f kafka-external-name-service.yml
  echo "✅ Kafka ExternalName Service created."

  # Test Kafka connectivity
  echo ""
  echo "🔍 Testing Kafka connectivity..."
  sleep 5
  kubectl run kafka-test --image=busybox --rm -i --restart=Never --namespace=default -- nslookup coubee-external-kafka-service.default.svc.cluster.local || echo "⚠️  DNS resolution test failed (this might be normal during initial setup)"

fi
echo "================================================="
echo ""

# --- Configuration ---
# List of services to deploy. The order is important!
SERVICES=(
  "coubee-be-user"
  "coubee-be-store"
  "coubee-be-order"
  "coubee-be-report"
  "coubee-be-gateway"
)

# Project root directory
ROOT_DIR=$(pwd)

echo "🚀 Starting deployment of all Coubee services to Kubernetes..."

for SERVICE_DIR in "${SERVICES[@]}"; do
  echo ""
  echo "================================================="
  echo "📦 Deploying service: $SERVICE_DIR"
  echo "================================================="

  # Navigate to the service directory
  cd "$ROOT_DIR/$SERVICE_DIR"

  # 1. Build the project with Gradle (skipping tests to speed up the process)
  echo "  - (1/3) Starting Gradle build... (./gradlew build -x test)"
  if [ -f "./gradlew" ]; then
    # Make gradlew executable in case it lost permissions
    chmod +x ./gradlew
    ./gradlew build -x test
    echo "  - (1/3) Gradle build finished."
  else
    echo "  - ❗️ (1/3) Warning: gradlew script not found. Skipping Gradle build."
  fi

  # 2. Build the Docker image
  IMAGE_NAME="coubee/$SERVICE_DIR:0.0.1"
  DOCKERFILE_PATH=".docker/Dockerfile"
  
  if [ ! -f "$DOCKERFILE_PATH" ]; then
    echo "  - ❗️ (2/3) Warning: Dockerfile not found at '$DOCKERFILE_PATH'. Skipping Docker image build."
  else
    echo "  - (2/3) Starting Docker image build... (Image: $IMAGE_NAME)"
    docker build . -t "$IMAGE_NAME" -f "$DOCKERFILE_PATH"
    echo "  - (2/3) Docker image build finished."
  fi

  # 3. Apply Kubernetes resources
  KUBE_DIR=".kube"
  if [ ! -d "$KUBE_DIR" ]; then
    echo "  - ❗️ (3/3) Warning: Kubernetes config directory not found at '$KUBE_DIR'. Skipping deployment."
  else
    echo "  - (3/3) Applying Kubernetes resources... (kubectl apply -f .kube/)"
    kubectl apply -f "$KUBE_DIR/"
    echo "  - (3/3) Kubernetes resources applied."
  fi

  # Return to the root directory for the next loop
  cd "$ROOT_DIR"
done

echo ""
echo "================================================="
echo "✅ All services have been deployed."
echo "================================================="
echo ""
echo "To monitor the status of your pods, run:"
echo "  kubectl get pods -w"
echo "minikube service coubee-be-gateway-nodeport"
echo "To access Kafka UI, run:"
echo "  kubectl port-forward service/kafka-ui -n kafka 8080:8080"
echo "  Then open http://localhost:8080 in your browser"
echo "" 