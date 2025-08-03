# Order Status API Documentation

## Overview
This document describes the Order Status API endpoint that allows retrieving the current status of an order using its order ID.

## Endpoint Details

### GET /api/order/orders/status/{orderId}

**Description**: Retrieves the current status of an order by order ID.

**HTTP Method**: GET

**URL Pattern**: `/api/order/orders/status/{orderId}`

**Authentication**: Not required (public endpoint)

### Path Parameters

| Parameter | Type   | Required | Description                    | Example                           |
|-----------|--------|----------|--------------------------------|-----------------------------------|
| orderId   | String | Yes      | Unique identifier for the order | order_01H1J5BFXCZDMG8RP0WCTFSN5Y |

### Response Format

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "조회 성공",
  "data": {
    "orderId": "order_01H1J5BFXCZDMG8RP0WCTFSN5Y",
    "status": "PAID"
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "주문을 찾을 수 없습니다. Order ID: order_invalid_123",
  "data": null
}
```

### Order Status Values

The `status` field can have one of the following values:

| Status    | Description                           |
|-----------|---------------------------------------|
| PENDING   | Order created, payment not completed  |
| PAID      | Payment completed successfully        |
| PREPARING | Order is being prepared               |
| PREPARED  | Order preparation completed           |
| RECEIVED  | Order received by customer            |
| CANCELLED | Order cancelled                       |
| FAILED    | Order processing failed               |

## Usage Examples

### cURL Example

```bash
# Get order status
curl -X GET "https://coubee-api.murkui.com/api/order/orders/status/order_01H1J5BFXCZDMG8RP0WCTFSN5Y" \
  -H "Content-Type: application/json"
```

### JavaScript Example

```javascript
async function getOrderStatus(orderId) {
  try {
    const response = await fetch(`https://coubee-api.murkui.com/api/order/orders/status/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Order Status:', result.data.status);
    return result.data;
  } catch (error) {
    console.error('Error fetching order status:', error);
    throw error;
  }
}

// Usage
getOrderStatus('order_01H1J5BFXCZDMG8RP0WCTFSN5Y')
  .then(data => console.log('Order status:', data.status))
  .catch(error => console.error('Failed to get order status:', error));
```

### Java Example (Spring Boot)

```java
@RestController
public class ExampleController {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @GetMapping("/example/order-status/{orderId}")
    public ResponseEntity<OrderStatusResponse> getOrderStatus(@PathVariable String orderId) {
        String url = "https://coubee-api.murkui.com/api/order/orders/status/" + orderId;
        
        try {
            ResponseEntity<ApiResponseDto<OrderStatusResponse>> response = 
                restTemplate.exchange(url, HttpMethod.GET, null, 
                    new ParameterizedTypeReference<ApiResponseDto<OrderStatusResponse>>() {});
            
            return ResponseEntity.ok(response.getBody().getData());
        } catch (HttpClientErrorException.NotFound e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

## Implementation Details

### Service Layer

The endpoint is implemented in the `OrderService` with the following method:

```java
public interface OrderService {
    OrderStatusResponse getOrderStatus(String orderId);
}
```

### Repository Layer

Uses the `OrderRepository` to find orders by order ID:

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderId(String orderId);
}
```

### Entity Mapping

The `Order` entity contains the status field:

```java
@Entity
public class Order {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    
    // ... other fields
}
```

## Testing

### Unit Tests

The implementation includes comprehensive unit tests:

- **Controller Tests**: Verify HTTP endpoint behavior
- **Service Tests**: Test business logic and error handling
- **Integration Tests**: End-to-end API testing

### Test Coverage

- ✅ Successful order status retrieval
- ✅ Order not found scenarios
- ✅ All order status values
- ✅ Error response formatting
- ✅ Input validation

## Error Handling

| Error Type | HTTP Status | Description |
|------------|-------------|-------------|
| Order Not Found | 404 | Order with given ID doesn't exist |
| Invalid Order ID | 400 | Malformed order ID format |
| Server Error | 500 | Internal server error |

## Performance Considerations

- **Database Index**: Ensure `order_id` column is indexed for fast lookups
- **Caching**: Consider caching frequently accessed order statuses
- **Rate Limiting**: Implement rate limiting for public endpoints

## Security Notes

- This is a **public endpoint** (no authentication required)
- Order IDs should be non-guessable (use UUIDs or similar)
- Consider implementing rate limiting to prevent abuse
- Log access for monitoring and security purposes
