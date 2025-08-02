#!/bin/bash

# --- apply_kafka_external_service.sh ---
# 이 스크립트는 ExternalName 서비스를 적용하고 관련 Pod를 재시작합니다.

echo "🔵 ExternalName 서비스 적용 중..."
kubectl apply -f kafka-external-name-service.yml

echo "⏳ 서비스가 생성되었는지 확인 중..."
kubectl get svc coubee-external-kafka-service -n default

echo "✅ 외부 Kafka 서비스가 생성되었습니다."