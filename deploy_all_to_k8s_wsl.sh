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
  echo "🚀 Deploying All-in-One Kafka (Zookeeper + Kafka in single container)..."
  kubectl apply -f simple-kafka-allinone.yaml

  # Wait for Kafka to be ready
  echo "Waiting for All-in-One Kafka to be ready..."
  if ! kubectl wait --for=condition=ready pod/kafka-0 -n kafka --timeout=600s; then
    echo "⚠️  All-in-One Kafka pod failed to start within 10 minutes. Checking status..."
    kubectl get pods -n kafka
    kubectl describe pod kafka-0 -n kafka
    kubectl logs kafka-0 -n kafka --tail=20
    echo "❌ Kafka deployment failed. Please check the logs and try again."
    exit 1
  fi

  # Wait for Kafdrop to be ready
  echo "Waiting for Kafdrop UI to be ready..."
  if ! kubectl wait --for=condition=ready pod -l app=kafdrop -n kafka --timeout=300s; then
    echo "⚠️  Kafdrop UI failed to start, but continuing..."
  else
    echo "✅ Kafdrop UI is ready!"
  fi

  echo "🟢 All-in-One Kafka deployment completed."
  echo "Internal Kafka bootstrap servers: kafka-service.kafka.svc.cluster.local:9092"

  # Create Kafka ExternalName Service for All-in-One
  echo ""
  echo "🔵 Creating Kafka ExternalName Service..."
  echo "================================================="
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
# Only deploy services that actually exist and have implementations
SERVICES=(
  "coubee-be-user"
  "coubee-be-order"
  "coubee-be-gateway"
)

# Services that exist but are not implemented yet
UNIMPLEMENTED_SERVICES=(
  "coubee-be-store"
  "coubee-be-report"
)

# Project root directory
ROOT_DIR=$(pwd)

echo "🚀 Starting deployment of all Coubee services to Kubernetes..."

# Warn about unimplemented services
if [ ${#UNIMPLEMENTED_SERVICES[@]} -gt 0 ]; then
  echo ""
  echo "⚠️  The following services are not implemented yet and will be skipped:"
  for service in "${UNIMPLEMENTED_SERVICES[@]}"; do
    echo "    - $service"
  done
  echo ""
fi

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
  # Use the same image name as referenced in Kubernetes deployments
  IMAGE_NAME="mingyoolee/$SERVICE_DIR:0.0.1"
  DOCKERFILE_PATH=".docker/Dockerfile"

  if [ ! -f "$DOCKERFILE_PATH" ]; then
    echo "  - ❗️ (2/3) Warning: Dockerfile not found at '$DOCKERFILE_PATH'. Skipping Docker image build."
  else
    echo "  - (2/3) Starting Docker image build... (Image: $IMAGE_NAME)"
    docker build . -t "$IMAGE_NAME" -f "$DOCKERFILE_PATH"
    echo "  - (2/3) Docker image build finished."

    # Also tag with the local name for consistency
    docker tag "$IMAGE_NAME" "coubee/$SERVICE_DIR:0.0.1"
    echo "  - (2/3) Tagged image with local name: coubee/$SERVICE_DIR:0.0.1"
  fi

  # 3. Apply Kubernetes resources
  KUBE_DIR=".kube"
  if [ ! -d "$KUBE_DIR" ]; then
    echo "  - ❗️ (3/3) Warning: Kubernetes config directory not found at '$KUBE_DIR'. Skipping deployment."
  else
    echo "  - (3/3) Applying Kubernetes resources... (kubectl apply -f .kube/)"

    # Apply resources in order: ConfigMaps and Secrets first, then Deployments and Services
    if ls "$KUBE_DIR"/*config*.yml 1> /dev/null 2>&1; then
      kubectl apply -f "$KUBE_DIR"/*config*.yml
    fi
    if ls "$KUBE_DIR"/*secret*.yml 1> /dev/null 2>&1; then
      kubectl apply -f "$KUBE_DIR"/*secret*.yml
    fi
    if ls "$KUBE_DIR"/*service*.yml 1> /dev/null 2>&1; then
      kubectl apply -f "$KUBE_DIR"/*service*.yml
    fi
    if ls "$KUBE_DIR"/*deploy*.yml 1> /dev/null 2>&1; then
      kubectl apply -f "$KUBE_DIR"/*deploy*.yml
    fi
    if ls "$KUBE_DIR"/*nodeport*.yml 1> /dev/null 2>&1; then
      kubectl apply -f "$KUBE_DIR"/*nodeport*.yml
    fi

    echo "  - (3/3) Kubernetes resources applied."

    # Wait for deployment to be ready (with timeout)
    DEPLOYMENT_NAME="$SERVICE_DIR-deployment"
    echo "  - (3/3) Waiting for deployment $DEPLOYMENT_NAME to be ready..."
    if kubectl wait --for=condition=available deployment/$DEPLOYMENT_NAME --timeout=300s 2>/dev/null; then
      echo "  - ✅ Deployment $DEPLOYMENT_NAME is ready!"
    else
      echo "  - ⚠️  Deployment $DEPLOYMENT_NAME is taking longer than expected. Check status manually."
    fi
  fi

  # Return to the root directory for the next loop
  cd "$ROOT_DIR"
done

echo ""
echo "================================================="
echo "✅ All implemented services have been deployed."
echo "================================================="
echo ""
echo "📊 Deployment Summary:"
echo "  ✅ Deployed: ${SERVICES[*]}"
if [ ${#UNIMPLEMENTED_SERVICES[@]} -gt 0 ]; then
  echo "  ⏸️  Skipped: ${UNIMPLEMENTED_SERVICES[*]} (not implemented)"
fi
echo ""
echo "🔍 To monitor the status of your pods, run:"
echo "  kubectl get pods -w"
echo ""
echo "🌐 To access the gateway service, run:"
echo "  minikube service coubee-be-gateway-nodeport"
echo "  Or check the NodePort: kubectl get svc coubee-be-gateway-nodeport"
echo ""
echo "📊 To access Kafka UI (Kafdrop), run:"
echo "  kubectl port-forward service/kafdrop-service -n kafka 9000:9000"
echo "  Then open http://localhost:9000 in your browser"
echo ""
echo "🔧 To check deployment status:"
echo "  kubectl get deployments"
echo "  kubectl get pods"
echo "  kubectl get services"
echo ""
echo "📋 To view logs for a specific service:"
echo "  kubectl logs -f deployment/coubee-be-gateway-deployment"
echo "  kubectl logs -f deployment/coubee-be-user-deployment"
echo "  kubectl logs -f deployment/coubee-be-order-deployment"
echo ""