#!/bin/bash

echo "🔍 Checking Coubee Services Status"
echo "=================================="
echo ""

# Check if services are running locally
echo "📋 Local Services Check:"
echo "------------------------"

# Check common ports
PORTS=(8080 8081 8082 8083 40401)
for port in "${PORTS[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        process=$(lsof -i :$port | tail -n 1 | awk '{print $1, $2}')
        echo "✅ Port $port: $process"
        
        # Try to identify the service
        if curl -s "http://localhost:$port/actuator/health" > /dev/null 2>&1; then
            service_info=$(curl -s "http://localhost:$port/actuator/health" | jq -r '.status // "Unknown"' 2>/dev/null || echo "Unknown")
            echo "   Health: $service_info"
        fi
        
        # Check specific endpoints
        if curl -s "http://localhost:$port/api/health" > /dev/null 2>&1; then
            echo "   Has /api/health endpoint"
        fi
        
        if curl -s "http://localhost:$port/api/order/payment/config" > /dev/null 2>&1; then
            echo "   Has /api/order/payment/config endpoint"
        fi
        
        if curl -s "http://localhost:$port/api/user/info" > /dev/null 2>&1; then
            echo "   Has /api/user/info endpoint"
        fi
        echo ""
    else
        echo "❌ Port $port: Not in use"
    fi
done

echo ""
echo "🌐 Testing CORS for Order Service:"
echo "----------------------------------"

# Test CORS for order service on different ports
for port in 8080 8083 40401; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo "Testing port $port..."
        
        # Test OPTIONS request (CORS preflight)
        response=$(curl -s -o /dev/null -w "%{http_code}" \
            -X OPTIONS \
            -H "Origin: http://localhost:5500" \
            -H "Access-Control-Request-Method: GET" \
            -H "Access-Control-Request-Headers: Content-Type" \
            "http://localhost:$port/api/order/payment/config" 2>/dev/null)
        
        if [ "$response" = "200" ] || [ "$response" = "204" ]; then
            echo "✅ Port $port: CORS preflight OK ($response)"
        else
            echo "❌ Port $port: CORS preflight failed ($response)"
        fi
        
        # Test actual GET request
        response=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "Origin: http://localhost:5500" \
            "http://localhost:$port/api/order/payment/config" 2>/dev/null)
        
        if [ "$response" = "200" ]; then
            echo "✅ Port $port: GET request OK ($response)"
        else
            echo "❌ Port $port: GET request failed ($response)"
        fi
        echo ""
    fi
done

echo "🔧 Kubernetes Services Check:"
echo "-----------------------------"

if command -v kubectl > /dev/null 2>&1; then
    # Check if kubectl is available and cluster is accessible
    if kubectl cluster-info > /dev/null 2>&1; then
        echo "✅ Kubernetes cluster accessible"
        
        # Check services
        echo ""
        echo "Services:"
        kubectl get services | grep coubee || echo "No coubee services found"
        
        echo ""
        echo "Pods:"
        kubectl get pods | grep coubee || echo "No coubee pods found"
        
        # Check if gateway service is accessible
        gateway_service=$(kubectl get service coubee-be-gateway-nodeport -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
        if [ -n "$gateway_service" ]; then
            echo ""
            echo "Gateway NodePort: $gateway_service"
            
            # Test gateway
            if command -v minikube > /dev/null 2>&1; then
                minikube_ip=$(minikube ip 2>/dev/null)
                if [ -n "$minikube_ip" ]; then
                    echo "Minikube IP: $minikube_ip"
                    echo "Gateway URL: http://$minikube_ip:$gateway_service"
                    
                    # Test gateway endpoint
                    response=$(curl -s -o /dev/null -w "%{http_code}" \
                        "http://$minikube_ip:$gateway_service/api/order/payment/config" 2>/dev/null)
                    
                    if [ "$response" = "200" ]; then
                        echo "✅ Gateway endpoint accessible ($response)"
                    else
                        echo "❌ Gateway endpoint failed ($response)"
                    fi
                fi
            fi
        fi
    else
        echo "❌ Kubernetes cluster not accessible"
    fi
else
    echo "❌ kubectl not available"
fi

echo ""
echo "💡 Recommendations:"
echo "==================="
echo "1. If testing locally, use: http://localhost:8080 (gateway)"
echo "2. If testing K8s, use: minikube service coubee-be-gateway-nodeport"
echo "3. If testing production, use: https://coubee-api.murkui.com"
echo "4. Avoid direct service ports (8081, 8083, 40401) - use gateway instead"
echo ""
