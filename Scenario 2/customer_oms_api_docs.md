# Shipium Professional Services Interview RetailCo Order Management System (OMS) API Documentation

## Overview

**Base URL:** `https://oms.retailco.com/api/v1`
**Authentication:** API Key (Header: `X-API-Key`)
**Rate Limits:** 100 requests/minute per API key
**Response Format:** JSON

⚠️ **Performance Note:** Average response time is 3-5 seconds. Some endpoints may timeout during peak hours (10am-2pm EST).

## Available Endpoints

### 1. Get Orders

**Endpoint:** `GET /orders`

Retrieves a list of orders based on filter criteria.

**Query Parameters:**
- `status` (optional): Order status - `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- `type` (optional): Order type - `retail`, `ecommerce`, `b2b`, `marketplace`, `gift`
- `created_after` (optional): ISO 8601 datetime
- `created_before` (optional): ISO 8601 datetime
- `limit` (optional): Max results (default: 50, max: 500)
- `offset` (optional): Pagination offset

**Example Request:**
```bash
GET /orders?status=pending&type=ecommerce&limit=100
```

**Example Response:**
```json
{
  "orders": [
    {
      "order_id": "ORD-2026-001234",
      "order_number": "WEB-20260108-5678",
      "type": "ecommerce",
      "status": "pending",
      "created_at": "2026-01-08T10:30:00Z",
      "customer": {
        "id": "CUST-789456",
        "email": "customer@example.com"
      },
      "shipping_address": {
        "name": "John Smith",
        "address1": "123 Main St",
        "address2": "Apt 4",
        "city": "Seattle",
        "state": "WA",
        "postal_code": "98101",
        "country": "US"
      },
      "items": [...],
      "total_value": 125.99
    }
  ],
  "total_count": 543,
  "limit": 100,
  "offset": 0
}
```

**Performance:** 2-4 seconds typical, 8-12 seconds during peak

---

### 2. Get Order Details

**Endpoint:** `GET /orders/{order_id}`

Retrieves complete details for a specific order.

**Path Parameters:**
- `order_id` (required): Order identifier

**Example Request:**
```bash
GET /orders/ORD-2026-001234
```

**Example Response:**
```json
{
  "order_id": "ORD-2026-001234",
  "order_number": "WEB-20260108-5678",
  "type": "ecommerce",
  "status": "pending",
  "priority": "standard",
  "created_at": "2026-01-08T10:30:00Z",
  "updated_at": "2026-01-08T10:35:00Z",
  "fulfillment": {
    "warehouse_id": "DC-WEST-01",
    "warehouse_name": "Seattle Distribution Center",
    "requested_ship_date": "2026-01-09",
    "shipping_method": "ground"
  },
  "customer": {
    "id": "CUST-789456",
    "email": "customer@example.com",
    "phone": "+1-206-555-0123"
  },
  "shipping_address": {
    "name": "John Smith",
    "company": null,
    "address1": "123 Main St",
    "address2": "Apt 4",
    "city": "Seattle",
    "state": "WA",
    "postal_code": "98101",
    "country": "US",
    "is_residential": true
  },
  "billing_address": {...},
  "items": [
    {
      "line_item_id": "LINE-001",
      "sku": "PROD-12345",
      "name": "Blue Widget",
      "quantity": 2,
      "unit_price": 49.99,
      "weight_oz": 16,
      "dimensions": {
        "length_in": 10,
        "width_in": 8,
        "height_in": 6
      },
      "attributes": {
        "fragile": false,
        "hazmat": false,
        "temperature_controlled": false
      }
    },
    {
      "line_item_id": "LINE-002",
      "sku": "PROD-67890",
      "name": "Red Gadget",
      "quantity": 1,
      "unit_price": 26.01,
      "weight_oz": 24,
      "dimensions": {
        "length_in": 12,
        "width_in": 10,
        "height_in": 8
      },
      "attributes": {
        "fragile": true,
        "hazmat": false,
        "temperature_controlled": false
      }
    }
  ],
  "totals": {
    "subtotal": 125.99,
    "tax": 11.34,
    "shipping": 8.99,
    "total": 146.32
  },
  "metadata": {
    "source": "web",
    "is_gift": false,
    "gift_message": null,
    "promo_code": "WINTER2026",
    "notes": null
  }
}
```

**Performance:** 3-5 seconds typical, may timeout during peak (>30 seconds)

---

### 3. Update Order Status

**Endpoint:** `PATCH /orders/{order_id}/status`

Updates the status of an order.

**Path Parameters:**
- `order_id` (required): Order identifier

**Request Body:**
```json
{
  "status": "processing",
  "notes": "Order sent to shipping system"
}
```

**Response:**
```json
{
  "order_id": "ORD-2026-001234",
  "status": "processing",
  "updated_at": "2026-01-08T11:00:00Z"
}
```

**Performance:** 1-2 seconds

---

### 4. Add Shipping Information

**Endpoint:** `POST /orders/{order_id}/shipping`

Adds shipping/tracking information to an order.

**Path Parameters:**
- `order_id` (required): Order identifier

**Request Body:**
```json
{
  "carrier": "UPS",
  "service": "Ground",
  "tracking_number": "1Z999AA10123456784",
  "shipped_at": "2026-01-09T08:00:00Z",
  "estimated_delivery": "2026-01-12T17:00:00Z",
  "shipping_cost": 8.99
}
```

**Response:**
```json
{
  "order_id": "ORD-2026-001234",
  "shipment_id": "SHIP-001234",
  "status": "shipped",
  "updated_at": "2026-01-09T08:05:00Z"
}
```

**Performance:** 2-3 seconds

---

### 5. Update Tracking Information

**Endpoint:** `PUT /orders/{order_id}/tracking`

Updates tracking information for an order (for tracking events).

**Path Parameters:**
- `order_id` (required): Order identifier

**Request Body:**
```json
{
  "tracking_number": "1Z999AA10123456784",
  "status": "in_transit",
  "status_detail": "Package is in transit to destination",
  "location": "Sacramento, CA",
  "timestamp": "2026-01-10T10:30:00Z",
  "estimated_delivery": "2026-01-12T17:00:00Z"
}
```

**Response:**
```json
{
  "order_id": "ORD-2026-001234",
  "tracking_updated": true,
  "updated_at": "2026-01-10T10:35:00Z"
}
```

**Performance:** 1-3 seconds

**Note:** This endpoint can be called multiple times for different tracking events.

---

### 6. Get Warehouse Configuration

**Endpoint:** `GET /warehouses/{warehouse_id}`

Retrieves configuration for a specific warehouse/distribution center.

**Path Parameters:**
- `warehouse_id` (required): Warehouse identifier

**Example Response:**
```json
{
  "warehouse_id": "DC-WEST-01",
  "name": "Seattle Distribution Center",
  "type": "regional_dc",
  "status": "active",
  "address": {
    "address1": "500 Commerce Blvd",
    "city": "Seattle",
    "state": "WA",
    "postal_code": "98108",
    "country": "US"
  },
  "capabilities": {
    "same_day_shipping": true,
    "hazmat_certified": false,
    "cold_storage": false,
    "oversized_items": true
  },
  "carrier_accounts": [
    {
      "carrier": "UPS",
      "account_number": "123456",
      "services": ["Ground", "2nd Day Air", "Next Day Air"]
    },
    {
      "carrier": "FedEx",
      "account_number": "789012",
      "services": ["Ground", "Home Delivery", "Express Saver"]
    },
    {
      "carrier": "USPS",
      "account_number": "345678",
      "services": ["Priority Mail", "First Class Package"]
    }
  ],
  "operating_hours": {
    "timezone": "America/Los_Angeles",
    "cutoff_time": "15:00",
    "shipping_days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
  }
}
```

**Performance:** 1-2 seconds

---

### 7. List Warehouses

**Endpoint:** `GET /warehouses`

Retrieves list of all warehouses.

**Query Parameters:**
- `type` (optional): Warehouse type - `regional_dc`, `store_fulfillment`, `vendor`
- `status` (optional): `active`, `inactive`

**Example Response:**
```json
{
  "warehouses": [
    {
      "warehouse_id": "DC-WEST-01",
      "name": "Seattle Distribution Center",
      "type": "regional_dc",
      "city": "Seattle",
      "state": "WA"
    },
    {
      "warehouse_id": "DC-EAST-01",
      "name": "New Jersey Distribution Center",
      "type": "regional_dc",
      "city": "Newark",
      "state": "NJ"
    },
    // ... more warehouses
  ],
  "total_count": 50
}
```

**Performance:** 2-3 seconds

---

## Order Types

The OMS supports the following order types:

| Type | Description | Typical Volume | Shipium Eligible? |
|------|-------------|----------------|-------------------|
| `retail` | In-store purchase, ship to customer | 5,000/day | TBD |
| `ecommerce` | Online purchase | 35,000/day | TBD |
| `b2b` | Wholesale to retailers | 500/day | TBD |
| `marketplace` | Amazon/eBay orders fulfilled by RetailCo | 8,000/day | TBD |
| `gift` | Gift orders with special handling | 2,000/day | TBD |
| `store_transfer` | Inventory between stores | 3,000/day | NO |
| `return_to_stock` | Returns to DC | 1,500/day | NO |
| `drop_ship` | Vendor ships to customer | 500/day | NO |

**Note:** "Shipium Eligible" needs to be determined during requirements phase.

---

## Order Statuses

- `pending` - Order received, awaiting processing
- `processing` - Being prepared for fulfillment
- `ready_to_ship` - Packed and ready for carrier pickup
- `shipped` - Picked up by carrier
- `in_transit` - In carrier network
- `out_for_delivery` - On delivery vehicle
- `delivered` - Successfully delivered
- `cancelled` - Order cancelled
- `on_hold` - Temporarily held (various reasons)

---

## Known Issues & Limitations

⚠️ **Performance Issues:**
- Response times degrade significantly during peak hours (10am-2pm EST)
- Timeouts occur under heavy load
- Recommendation: Implement caching and async processing where possible

⚠️ **Batch Operations:**
- No batch endpoints available
- Must make individual API calls per order
- Rate limit: 100 requests/minute

⚠️ **Webhooks:**
- OMS does NOT support webhooks
- Must poll for order updates
- Recommendation: Implement polling with reasonable intervals

⚠️ **Real-time Data:**
- Order data may be stale by up to 30 seconds
- Inventory levels update every 5 minutes
- Warehouse configs cached for 1 hour

⚠️ **Error Handling:**
- Error messages are inconsistent
- Some errors return 200 with error in body
- Always check response body for error indicators

---

## Authentication

**API Key Authentication:**

Include API key in request header:
```
X-API-Key: your-api-key-here
```

**Test Environment:**
- Base URL: `https://oms-test.retailco.com/api/v1`
- API Key: Will be provided by RetailCo team

**Rate Limits:**
- 100 requests/minute per API key
- Exceeding limit returns 429 Too Many Requests
- Rate limit reset every 60 seconds

---

## Best Practices

1. **Implement Retry Logic:** OMS occasionally returns 500 errors under load
2. **Cache Responses:** Warehouse configs and order details when possible
3. **Batch Polling:** Don't poll individual orders constantly
4. **Async Processing:** Don't block on OMS API calls
5. **Timeout Handling:** Set timeout to 10-15 seconds, handle gracefully
6. **Error Logging:** Log all API interactions for debugging

---

## Support Contact

For API issues or questions:
- Email: api-support@retailco.com
- Slack: #oms-api-support (after access granted)
- On-call: Only for production emergencies
