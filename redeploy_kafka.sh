#!/bin/bash

# --- redeploy_kafka.sh ---
# 이 스크립트는 Kafka 리소스를 삭제하고 다시 배포합니다.

echo "🔥 Deleting existing Kafka resources..."
kubectl delete namespace kafka --ignore-not-found=true

echo "⏳ Waiting for namespace deletion to complete..."
sleep 5

echo "🔵 Creating Kafka namespace..."
kubectl apply -f coubee-kafka/manifests/00-namespace.yaml

echo "🔵 Deploying Zookeeper..."
kubectl apply -f coubee-kafka/manifests/01-zookeeper.yaml

echo "⏳ Waiting for Zookeeper to be ready..."
kubectl wait --for=condition=ready pod/zookeeper-0 -n kafka --timeout=300s || true

echo "🔵 Deploying Kafka..."
kubectl apply -f coubee-kafka/manifests/02-kafka.yaml

echo "⏳ Waiting for Kafka to be ready..."
kubectl wait --for=condition=ready pod/kafka-0 -n kafka --timeout=300s || true

echo "🔵 Deploying Kafka UI..."
kubectl apply -f coubee-kafka/manifests/03-kafka-ui.yaml

echo "✅ Kafka deployment completed."
echo "To check the status of the pods, run: kubectl get pods -n kafka"
echo "To view logs of a pod, run: kubectl logs <pod-name> -n kafka"
echo "To access Kafka UI, run: kubectl port-forward service/kafka-ui -n kafka 8080:8080"
echo "Then open http://localhost:8080 in your browser" 