#!/bin/bash

# Kafka 배포 스크립트
echo "=== Deploying Kafka to Kubernetes ==="

# 네임스페이스 생성
echo "Creating namespace..."
kubectl apply -f manifests/00-namespace.yaml

# Zookeeper 배포
echo "Deploying Zookeeper..."
kubectl apply -f manifests/01-zookeeper.yaml

# Zookeeper가 준비될 때까지 대기 (단일 파드만 확인)
echo "Waiting for Zookeeper to be ready..."
kubectl wait --for=condition=ready pod/zookeeper-0 -n kafka --timeout=300s

# 추가 Zookeeper 파드가 있는지 확인 후 대기
ZOOKEEPER_PODS=$(kubectl get pods -n kafka -l app=zookeeper --no-headers | wc -l)
echo "Found $ZOOKEEPER_PODS Zookeeper pod(s)"
if [ "$ZOOKEEPER_PODS" -gt 1 ]; then
    echo "Waiting for additional Zookeeper pods..."
    kubectl wait --for=condition=ready pod -l app=zookeeper -n kafka --timeout=300s
fi

# Kafka 배포
echo "Deploying Kafka..."
kubectl apply -f manifests/02-kafka.yaml

# Kafka가 준비될 때까지 대기 (단일 파드만 확인)
echo "Waiting for Kafka to be ready..."
kubectl wait --for=condition=ready pod/kafka-0 -n kafka --timeout=300s

# 추가 Kafka 파드가 있는지 확인 후 대기
KAFKA_PODS=$(kubectl get pods -n kafka -l app=kafka --no-headers | wc -l)
echo "Found $KAFKA_PODS Kafka pod(s)"
if [ "$KAFKA_PODS" -gt 1 ]; then
    echo "Waiting for additional Kafka pods..."
    kubectl wait --for=condition=ready pod -l app=kafka -n kafka --timeout=300s
fi

# Kafka UI 배포
echo "Deploying Kafka UI..."
kubectl apply -f manifests/03-kafka-ui.yaml

echo "=== Kafka deployment completed ==="
echo "Access Kafka UI at: http://kafka-ui.coubee.com"
echo "Internal Kafka bootstrap servers: kafka-headless.kafka.svc.cluster.local:9092" 