#!/bin/bash

# --- kill_all_to_k8s_wsl.sh ---
# This script deletes all Coubee microservice resources from the Kubernetes cluster in WSL.
# WSL 환경에서 Kubernetes 클러스터의 모든 서비스를 제거합니다.

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if running in WSL - Bypassed
# if [[ ! $(uname -r) =~ Microsoft ]]; then
#   echo "⚠️  This script is designed to run in WSL (Windows Subsystem for Linux)."
#   echo "    If you're running in a different environment, use kill_all_to_k8s.sh instead."
#   read -p "Continue anyway? (y/n): " confirm
#   if [[ ! $confirm =~ ^[Yy]$ ]]; then
#     exit 1
#   fi
# fi

# --- Configuration ---
# List of services to delete. Reverse dependency order is recommended.
# Gateway is deleted first. Only include implemented services.
SERVICES=(
  "coubee-be-gateway"
  "coubee-be-order"
  "coubee-be-user"
)

# Also try to clean up any remaining unimplemented services
ALL_POSSIBLE_SERVICES=(
  "coubee-be-gateway"
  "coubee-be-report"
  "coubee-be-order"
  "coubee-be-store"
  "coubee-be-user"
)

# Project root directory
ROOT_DIR=$(pwd)

echo "🔥 Starting deletion of all Coubee services from Kubernetes..."

# First, try to delete all possible services (including unimplemented ones)
for SERVICE_DIR in "${ALL_POSSIBLE_SERVICES[@]}"; do
  echo ""
  echo "================================================="
  echo "🗑️ Deleting service: $SERVICE_DIR"
  echo "================================================="

  # Navigate to the service directory
  if [ ! -d "$SERVICE_DIR" ]; then
    echo "  - ❗️ Warning: Service directory '$SERVICE_DIR' not found. Skipping."
    continue
  fi
  cd "$SERVICE_DIR"

  # Check if the Kubernetes config directory exists
  KUBE_DIR=".kube"
  if [ ! -d "$KUBE_DIR" ]; then
    echo "  - ❗️ Warning: Kubernetes config directory not found at '$KUBE_DIR'. Skipping deletion."
  else
    echo "  - Deleting Kubernetes resources... (kubectl delete -f .kube/)"
    # Use --ignore-not-found=true to prevent errors if resources were already deleted
    kubectl delete -f "$KUBE_DIR/" --ignore-not-found=true
    echo "  - Kubernetes resources for $SERVICE_DIR have been requested for deletion."
  fi

  # Return to the root directory for the next loop
  cd "$ROOT_DIR"
done

echo ""
echo "================================================="
echo "✅ All specified service resources have been deleted."
echo "================================================="
echo ""
echo "It may take a few moments for all pods to terminate."
echo "To confirm that all pods are terminated, run:"
echo "  kubectl get pods"
echo ""

# --- Delete Kafka Resources (Optional) ---
echo ""
echo "================================================="
echo "🔥 Kafka Deletion"
echo "================================================="
read -p "Do you want to delete Kafka resources as well? (y/n): " confirm_kafka
if [[ $confirm_kafka =~ ^[Yy]$ ]]; then
  echo "🔥 Deleting Kafka ExternalName Service..."
  kubectl delete service coubee-external-kafka-service -n default --ignore-not-found=true
  echo "✅ Kafka ExternalName Service deleted."
  echo ""
  echo "🔥 Deleting Kafka resources from Kubernetes..."
  if kubectl get namespace kafka &> /dev/null; then
    echo "Deleting All-in-One Kafka resources..."
    kubectl delete -f simple-kafka-allinone.yaml --ignore-not-found=true
    echo "✅ Kafka resources have been deleted."
  else
    echo "Kafka namespace not found. Nothing to delete."
  fi
else
  echo "Skipping Kafka deletion."
fi
echo "================================================="
echo "" 