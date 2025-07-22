#!/bin/bash

# 스크립트 실행 환경의 언어 설정을 UTF-8로 고정하여 출력 깨짐 방지
export LANG=C.UTF-8

echo "Docker 컨테이너 상태 확인 중..."
docker-compose ps

echo -e "\n===== MySQL 컨테이너 상태 ====="
if [ "$(docker ps -q -f name=coubee-mysql)" ]; then
    echo "MySQL 컨테이너 실행 중"
    
    # MySQL 접속 테스트
    if docker exec coubee-mysql mysqladmin -uroot -p1234 ping &>/dev/null; then
        echo "MySQL 서버가 응답합니다"
        
        # 데이터베이스 존재 확인
        if docker exec coubee-mysql mysql -uroot -p1234 -e "SHOW DATABASES LIKE 'coubee_db';" | grep -q coubee_db; then
            echo "coubee_db 데이터베이스가 존재합니다"
            
            # 테이블 확인
            TABLES=$(docker exec coubee-mysql mysql -uroot -p1234 -e "USE coubee_db; SHOW TABLES;" | grep -v Tables_in)
            echo "데이터베이스 테이블 목록:"
            echo "$TABLES"
        else
            echo "coubee_order 데이터베이스가 없습니다"
        fi
    else
        echo "MySQL 서버가 응답하지 않습니다"
    fi
else
    echo "MySQL 컨테이너가 실행되고 있지 않습니다"
fi

echo -e "\n===== Kafka 컨테이너 상태 ====="
if [ "$(docker ps -q -f name=coubee-kafka)" ]; then
    echo "Kafka 컨테이너 실행 중"
    
    # Kafka 토픽 확인
    echo "Kafka 토픽 목록:"
    docker exec coubee-kafka kafka-topics --bootstrap-server localhost:9092 --list
else
    echo "Kafka 컨테이너가 실행되고 있지 않습니다"
fi

echo -e "\n===== 애플리케이션 컨테이너 상태 ====="
if [ "$(docker ps -q -f name=coubee-app)" ]; then
    echo "애플리케이션 컨테이너 실행 중"
    
    # 애플리케이션 로그 확인 (마지막 10줄)
    echo "애플리케이션 로그 (마지막 10줄):"
    docker logs --tail 10 coubee-app
    
    # 애플리케이션 상태 확인
    echo -e "\nAPI 상태 확인:"
    if curl -s http://localhost:8080/actuator/health | grep -q "UP"; then
        echo "애플리케이션이 정상적으로 실행 중입니다"
    else
        echo "애플리케이션이 응답하지 않거나 문제가 있습니다"
    fi
else
    echo "애플리케이션 컨테이너가 실행되고 있지 않습니다"
fi 