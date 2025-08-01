# Coubee Kafka

Kubernetes 클러스터에 Kafka를 배포하기 위한 매니페스트 파일과 스크립트입니다.

## 구성 요소

- **Zookeeper**: 3개의 복제본으로 구성된 StatefulSet
- **Kafka**: 3개의 복제본으로 구성된 StatefulSet
- **Kafka UI**: Kafka 클러스터 관리를 위한 웹 인터페이스

## 배포 방법

### 사전 요구사항

- Kubernetes 클러스터
- kubectl 설정
- 충분한 클러스터 리소스 (최소 권장: 6 CPU, 12GB RAM, 30GB 스토리지)

### 배포 실행

```bash
# 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

## 접속 정보

- **Kafka UI**: http://kafka-ui.coubee.com
- **Kafka 부트스트랩 서버**: `kafka-headless.kafka.svc.cluster.local:9092`

## 스프링부트 애플리케이션 연동

`spring-kafka-config-example.yml` 파일을 참조하여 스프링부트 애플리케이션의 `application.yml`에 Kafka 설정을 추가합니다.

```yaml
spring:
  kafka:
    bootstrap-servers: kafka-headless.kafka.svc.cluster.local:9092
    # 기타 설정...
```

## 토픽 생성

Kafka UI를 통해 토픽을 생성하거나 다음 명령어를 사용할 수 있습니다:

```bash
# Kafka 파드에 접속
kubectl exec -it kafka-0 -n kafka -- bash

# 토픽 생성
kafka-topics --create --topic my-topic --bootstrap-server localhost:9092 --partitions 3 --replication-factor 3
```

## 모니터링

Kafka UI를 통해 다음 정보를 모니터링할 수 있습니다:

- 브로커 상태
- 토픽 목록 및 상세 정보
- 컨슈머 그룹 상태
- 메시지 브라우징

## 문제 해결

### 파드가 시작되지 않는 경우

```bash
# 파드 상태 확인
kubectl get pods -n kafka

# 파드 로그 확인
kubectl logs <pod-name> -n kafka
```

### Kafka에 연결할 수 없는 경우

```bash
# 서비스 확인
kubectl get svc -n kafka

# 엔드포인트 확인
kubectl get endpoints -n kafka
```

## 리소스 정리

```bash
# 모든 리소스 삭제
kubectl delete namespace kafka
``` 