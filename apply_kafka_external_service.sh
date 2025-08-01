#!/bin/bash

# --- apply_kafka_external_service.sh ---
# 이 스크립트는 ExternalName 서비스를 적용하고 관련 Pod를 재시작합니다.

echo "🔵 ExternalName 서비스 적용 중..."
kubectl apply -f kafka-external-name-service.yml

echo "⏳ 서비스가 생성되었는지 확인 중..."
kubectl get svc coubee-external-kafka-service -n default

echo "🔄 User 서비스 Pod 재시작 중..."
USER_PODS=$(kubectl get pods -l app=coubee-be-user -o name)
if [ -z "$USER_PODS" ]; then
  echo "⚠️ User 서비스 Pod를 찾을 수 없습니다."
else
  echo "$USER_PODS" | xargs kubectl delete
  echo "✅ User 서비스 Pod 재시작 요청 완료"
fi

echo "🔄 Order 서비스 Pod 재시작 중..."
ORDER_PODS=$(kubectl get pods -l app=coubee-be-order -o name)
if [ -z "$ORDER_PODS" ]; then
  echo "⚠️ Order 서비스 Pod를 찾을 수 없습니다."
else
  echo "$ORDER_PODS" | xargs kubectl delete
  echo "✅ Order 서비스 Pod 재시작 요청 완료"
fi

echo "✅ 모든 작업이 완료되었습니다."
echo "Pod 상태를 확인하려면 다음 명령을 실행하세요: kubectl get pods" 