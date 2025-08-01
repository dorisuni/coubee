#!/bin/bash

# ===================================================================
# Kafka Only Deletion Script for minikube
# ===================================================================
# Kafka 클러스터만 minikube에서 삭제하는 스크립트
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
print_color $CYAN "    Kafka Only Deletion for minikube    "
print_color $CYAN "===================================================="
echo ""

# Check if kafka namespace exists
if ! kubectl get namespace kafka &> /dev/null; then
    print_color $YELLOW "⚠️  Kafka namespace not found. Nothing to delete."
    exit 0
fi

# Confirmation
print_color $RED "⚠️  WARNING: This will delete all Kafka data and cannot be undone!"
print_color $YELLOW "   - All Kafka topics and messages will be lost"
print_color $YELLOW "   - All Zookeeper data will be lost"
print_color $YELLOW "   - All persistent volumes will be deleted"
echo ""
read -p "Are you sure you want to delete Kafka? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy] ]]; then
    print_color $GREEN "✅ Kafka deletion cancelled."
    exit 0
fi

echo ""
print_color $RED "🔥 Deleting Kafka resources..."
echo "================================================="

# Delete ExternalName Service
print_color $YELLOW "🔗 Deleting ExternalName Service..."
kubectl delete service coubee-external-kafka-service -n default --ignore-not-found=true
print_color $GREEN "   ✅ ExternalName Service deleted."

# Delete Kafka UI
print_color $YELLOW "🖥️  Deleting Kafka UI..."
kubectl delete -f coubee-kafka/manifests/03-kafka-ui.yaml --ignore-not-found=true
print_color $GREEN "   ✅ Kafka UI deleted."

# Delete Kafka
print_color $YELLOW "☕ Deleting Kafka..."
kubectl delete -f coubee-kafka/manifests/02-kafka.yaml --ignore-not-found=true
print_color $GREEN "   ✅ Kafka deleted."

# Delete Zookeeper
print_color $YELLOW "🐘 Deleting Zookeeper..."
kubectl delete -f coubee-kafka/manifests/01-zookeeper.yaml --ignore-not-found=true
print_color $GREEN "   ✅ Zookeeper deleted."

# Delete PVCs
print_color $YELLOW "💾 Deleting Kafka PVCs..."
kubectl delete pvc -l app=kafka -n kafka --ignore-not-found=true
print_color $GREEN "   ✅ Kafka PVCs deleted."

print_color $YELLOW "💾 Deleting Zookeeper PVCs..."
kubectl delete pvc -l app=zookeeper -n kafka --ignore-not-found=true
print_color $GREEN "   ✅ Zookeeper PVCs deleted."

# Delete namespace
print_color $YELLOW "📁 Deleting Kafka namespace..."
kubectl delete -f coubee-kafka/manifests/00-namespace.yaml --ignore-not-found=true

# Wait for namespace deletion
print_color $YELLOW "⏳ Waiting for namespace to be fully deleted..."
while kubectl get namespace kafka &> /dev/null; do
    echo -n "."
    sleep 2
done
echo ""
print_color $GREEN "   ✅ Kafka namespace deleted."

echo ""
print_color $GREEN "🎉 Kafka deletion completed successfully!"
echo "================================================="

print_color $CYAN "📋 Status:"
print_color $YELLOW "   Kafka cluster: Deleted"
print_color $YELLOW "   All data: Permanently removed"
print_color $YELLOW "   Namespace: Deleted"

echo ""
print_color $CYAN "🔧 To redeploy Kafka:"
print_color $YELLOW "   ./deploy_kafka_only.sh"

print_color $CYAN "===================================================="
