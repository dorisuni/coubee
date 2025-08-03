# 🚀 Coubee Kubernetes Deployment Guide

This guide provides comprehensive instructions for deploying the Coubee microservices to Kubernetes.

## 📋 Prerequisites

### Required Tools
- **kubectl** - Kubernetes command-line tool
- **Docker** - Container runtime
- **Java 17+** - For building Spring Boot applications
- **Kubernetes cluster** - minikube, Docker Desktop, or cloud cluster

### System Requirements
- **Memory**: 4GB+ available RAM
- **Disk**: 5GB+ free space
- **CPU**: 2+ cores recommended

## 🔧 Quick Start

### 1. Validate Environment
Before deploying, run the validation script:
```bash
./validate_before_deploy.sh
```

This will check all prerequisites and identify any issues.

### 2. Deploy All Services
```bash
./deploy_all_to_k8s_wsl.sh
```

### 3. Monitor Deployment
```bash
./diagnose_k8s_deployment.sh
```

### 4. Clean Up (if needed)
```bash
./kill_all_to_k8s_wsl.sh
```

## 📦 Service Architecture

### Implemented Services
- **coubee-be-user** - User management and authentication
- **coubee-be-order** - Order processing and payment
- **coubee-be-gateway** - API gateway and routing

### Infrastructure
- **Kafka** - Message broker for inter-service communication
- **PostgreSQL** - Database (configured via external connection)

### Unimplemented Services (Skipped)
- **coubee-be-store** - Store management (placeholder)
- **coubee-be-report** - Reporting service (placeholder)

## 🔍 Troubleshooting

### Common Issues

#### 1. ImagePullBackOff Errors
**Cause**: Docker images not found
**Solution**: 
```bash
# Check if images were built
docker images | grep coubee

# Rebuild if necessary
cd coubee-be-gateway && docker build . -t mingyoolee/coubee-be-gateway:0.0.1 -f .docker/Dockerfile
```

#### 2. CrashLoopBackOff
**Cause**: Application startup failures
**Solution**:
```bash
# Check logs
kubectl logs -f deployment/coubee-be-gateway-deployment

# Common causes:
# - Database connection issues
# - Missing environment variables
# - Kafka connectivity problems
```

#### 3. Service Not Ready
**Cause**: Health checks failing
**Solution**:
```bash
# Check pod status
kubectl get pods

# Describe problematic pod
kubectl describe pod <pod-name>

# Check if health endpoints are accessible
kubectl port-forward <pod-name> 8080:8080
curl http://localhost:8080/actuator/health
```

#### 4. Kafka Connection Issues
**Cause**: Kafka not ready or misconfigured
**Solution**:
```bash
# Check Kafka status
kubectl get pods -n kafka

# Check Kafka logs
kubectl logs kafka-0 -n kafka

# Verify external service
kubectl get service coubee-external-kafka-service
```

### Diagnostic Commands

```bash
# Overall cluster status
kubectl get all --all-namespaces

# Check specific service
kubectl get pods -l app=coubee-be-gateway

# View logs
kubectl logs -f deployment/coubee-be-gateway-deployment

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp

# Resource usage
kubectl top pods
```

## 🌐 Accessing Services

### Gateway Service
```bash
# Get NodePort
kubectl get service coubee-be-gateway-nodeport

# Access via minikube
minikube service coubee-be-gateway-nodeport
```

### Kafka UI (Kafdrop)
```bash
# Port forward
kubectl port-forward service/kafdrop-service -n kafka 9000:9000

# Open browser
open http://localhost:9000
```

### Individual Services (for debugging)
```bash
# Port forward to specific service
kubectl port-forward service/coubee-be-user-service 8081:8080
kubectl port-forward service/coubee-be-order-service 8083:8080
```

## 🔧 Configuration

### Environment Variables
Services use the following profiles:
- **stg** - Staging configuration (default for K8s)
- **dev** - Development configuration
- **prod** - Production configuration

### ConfigMaps and Secrets
- **ConfigMaps**: Application configuration
- **Secrets**: Sensitive data (JWT keys, database passwords)

### Resource Limits
Each service has configured:
- **Requests**: 512Mi memory, 250m CPU
- **Limits**: 1Gi memory, 500m CPU

## 📊 Monitoring

### Health Checks
- **Liveness Probe**: `/actuator/health` (gateway/user) or `/api/health/live` (order)
- **Readiness Probe**: `/actuator/health/readiness` or `/api/health/ready`

### Logs
```bash
# Real-time logs
kubectl logs -f deployment/coubee-be-gateway-deployment

# Save logs to file
kubectl logs deployment/coubee-be-gateway-deployment > gateway.log
```

## 🔄 Development Workflow

### Making Changes
1. **Code changes** in service directory
2. **Rebuild** Docker image
3. **Redeploy** to Kubernetes
4. **Test** using diagnostic tools

### Quick Redeploy
```bash
# For single service
cd coubee-be-gateway
docker build . -t mingyoolee/coubee-be-gateway:0.0.1 -f .docker/Dockerfile
kubectl rollout restart deployment/coubee-be-gateway-deployment
```

## 📝 Notes

- **Image Pull Policy**: Set to `IfNotPresent` for local development
- **Service Dependencies**: Gateway depends on User and Order services
- **Database**: External PostgreSQL connection required
- **Kafka**: All-in-one container for simplicity

## 🆘 Getting Help

If you encounter issues:
1. Run `./diagnose_k8s_deployment.sh`
2. Check the troubleshooting section above
3. Review Kubernetes events and logs
4. Verify all prerequisites are met
