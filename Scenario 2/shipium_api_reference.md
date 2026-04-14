# Shipium Professional Services Interview Shipium API Reference - RetailCo Integration

## Overview

**Base URL:** `https://api.shipium.com/v1`
**Authentication:** Bearer Token (OAuth 2.0)
**Rate Limits:** 1000 requests/minute
**Response Format:** JSON

This document covers the Shipium API endpoints relevant for the RetailCo integration.

---

## Authentication

**Token Endpoint:** `POST https://auth.shipium.com/oauth/token`

**Request Body:**
```json
{
  "grant_type": "client_credentials",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Use in requests:**
```
Authorization: Bearer eyJhbGci...
```

---

## 1. Rate Shopping

### Get Shipping Rates

**Endpoint:** `POST /rates`

Retrieves available shipping rates for a given shipment.

**Request Body:**
```json
{
  "origin": {
    "postal_code": "98101",
    "country": "US"
  },
  "destination": {
    "postal_code": "02101",
    "country": "US",
    "is_residential": true
  },
  "packages": [
    {
      "weight": {
        "value": 2.5,
        "unit": "lb"
      },
      "dimensions": {
        "length": 10,
        "width": 8,
        "height": 6,
        "unit": "in"
      }
    }
  ],
  "ship_date": "2026-01-09",
  "declared_value": 125.00,
  "options": {
    "include_delivery_estimates": true,
    "carrier_accounts": ["ups_account_123", "fedex_account_456"]
  }
}
```

**Response:**
```json
{
  "rates": [
    {
      "rate_id": "rate_abc123",
      "carrier": "UPS",
      "service": "Ground",
      "service_code": "03",
      "cost": {
        "amount": 12.45,
        "currency": "USD"
      },
      "delivery_estimate": {
        "estimated_delivery_date": "2026-01-14",
        "min_days": 4,
        "max_days": 5,
        "guaranteed": false
      },
      "transit_time": {
        "business_days": 4
      },
      "available": true
    },
    {
      "rate_id": "rate_def456",
      "carrier": "UPS",
      "service": "2nd Day Air",
      "service_code": "02",
      "cost": {
        "amount": 24.99,
        "currency": "USD"
      },
      "delivery_estimate": {
        "estimated_delivery_date": "2026-01-11",
        "min_days": 2,
        "max_days": 2,
        "guaranteed": true
      },
      "transit_time": {
        "business_days": 2
      },
      "available": true
    },
    {
      "rate_id": "rate_ghi789",
      "carrier": "FedEx",
      "service": "Ground",
      "service_code": "FEDEX_GROUND",
      "cost": {
        "amount": 11.85,
        "currency": "USD"
      },
      "delivery_estimate": {
        "estimated_delivery_date": "2026-01-13",
        "min_days": 3,
        "max_days": 5,
        "guaranteed": false
      },
      "transit_time": {
        "business_days": 3
      },
      "available": true
    }
  ],
  "warnings": [],
  "errors": []
}
```

**Performance:** Typically 200-500ms

---

## 2. Shipment Creation

### Create Shipment

**Endpoint:** `POST /shipments`

Creates a shipment and generates a shipping label.

**Request Body:**
```json
{
  "external_order_id": "ORD-2026-001234",
  "rate_id": "rate_abc123",
  "origin": {
    "name": "Seattle Distribution Center",
    "company": "RetailCo",
    "address1": "500 Commerce Blvd",
    "city": "Seattle",
    "state": "WA",
    "postal_code": "98108",
    "country": "US",
    "phone": "+1-206-555-0100"
  },
  "destination": {
    "name": "John Smith",
    "address1": "123 Main St",
    "address2": "Apt 4",
    "city": "Seattle",
    "state": "WA",
    "postal_code": "98101",
    "country": "US",
    "phone": "+1-206-555-0123",
    "is_residential": true
  },
  "packages": [
    {
      "weight": {
        "value": 2.5,
        "unit": "lb"
      },
      "dimensions": {
        "length": 10,
        "width": 8,
        "height": 6,
        "unit": "in"
      }
    }
  ],
  "items": [
    {
      "external_line_item_id": "LINE-001",
      "description": "Blue Widget",
      "quantity": 2,
      "value": 49.99
    }
  ],
  "ship_date": "2026-01-09",
  "options": {
    "signature_required": false,
    "saturday_delivery": false,
    "insurance": {
      "amount": 100.00
    }
  }
}
```

**Response:**
```json
{
  "shipment_id": "shp_xyz789",
  "external_order_id": "ORD-2026-001234",
  "status": "created",
  "carrier": "UPS",
  "service": "Ground",
  "tracking_number": "1Z999AA10123456784",
  "label_url": "https://api.shipium.com/v1/labels/shp_xyz789",
  "cost": {
    "amount": 12.45,
    "currency": "USD"
  },
  "delivery_estimate": {
    "estimated_delivery_date": "2026-01-14",
    "min_days": 4,
    "max_days": 5
  },
  "created_at": "2026-01-09T08:00:00Z"
}
```

**Performance:** Typically 500-1000ms

---

## 3. Label Retrieval

### Get Shipping Label

**Endpoint:** `GET /labels/{shipment_id}`

Retrieves the shipping label for a shipment.

**Query Parameters:**
- `format` (optional): `pdf`, `png`, `zpl` (default: `pdf`)

**Response:**
- Binary label data (PDF/PNG) or ZPL string
- Content-Type header indicates format

**Example:**
```bash
GET /labels/shp_xyz789?format=pdf
```

Returns PDF file for printing.

---

## 4. Tracking

### Get Tracking Information

**Endpoint:** `GET /tracking/{tracking_number}`

Retrieves current tracking status and history for a tracking number.

**Response:**
```json
{
  "tracking_number": "1Z999AA10123456784",
  "shipment_id": "shp_xyz789",
  "carrier": "UPS",
  "service": "Ground",
  "status": "in_transit",
  "status_detail": "Package is in transit to destination",
  "delivery_estimate": {
    "estimated_delivery_date": "2026-01-14"
  },
  "current_location": {
    "city": "Sacramento",
    "state": "CA",
    "country": "US"
  },
  "events": [
    {
      "timestamp": "2026-01-09T08:15:00Z",
      "status": "picked_up",
      "description": "Package picked up",
      "location": {
        "city": "Seattle",
        "state": "WA",
        "country": "US"
      }
    },
    {
      "timestamp": "2026-01-10T14:30:00Z",
      "status": "in_transit",
      "description": "Package is in transit",
      "location": {
        "city": "Sacramento",
        "state": "CA",
        "country": "US"
      }
    }
  ],
  "updated_at": "2026-01-10T14:35:00Z"
}
```

**Performance:** Typically 100-200ms (cached data)

---

## 5. Webhook Configuration

### Register Webhook

**Endpoint:** `POST /webhooks`

Registers a webhook endpoint to receive tracking updates and shipment events.

**Request Body:**
```json
{
  "url": "https://your-domain.com/webhooks/shipium",
  "events": [
    "tracking.updated",
    "shipment.created",
    "shipment.delivered",
    "shipment.exception"
  ],
  "description": "RetailCo production webhook"
}
```

**Response:**
```json
{
  "webhook_id": "wh_123456",
  "url": "https://your-domain.com/webhooks/shipium",
  "events": ["tracking.updated", "shipment.created", "shipment.delivered", "shipment.exception"],
  "secret": "whsec_abc123xyz789",
  "status": "active",
  "created_at": "2026-01-08T12:00:00Z"
}
```

### Webhook Payload Format

When a tracking event occurs, Shipium will POST to your webhook URL:

**Headers:**
```
Content-Type: application/json
X-Shipium-Signature: sha256=...
X-Shipium-Event: tracking.updated
```

**Body:**
```json
{
  "event": "tracking.updated",
  "timestamp": "2026-01-10T14:35:00Z",
  "data": {
    "shipment_id": "shp_xyz789",
    "external_order_id": "ORD-2026-001234",
    "tracking_number": "1Z999AA10123456784",
    "carrier": "UPS",
    "status": "in_transit",
    "status_detail": "Package is in transit to destination",
    "event_timestamp": "2026-01-10T14:30:00Z",
    "location": {
      "city": "Sacramento",
      "state": "CA",
      "country": "US"
    },
    "delivery_estimate": {
      "estimated_delivery_date": "2026-01-14"
    }
  }
}
```

**Webhook Retry Logic:**
- Initial attempt on event occurrence
- Retry with exponential backoff if webhook fails (returns non-2xx)
- Max 5 retry attempts over 24 hours
- After max retries, webhook marked as failed

---

## 6. Carrier Selection Rules

### Get Carrier Selection Rules

**Endpoint:** `GET /carrier-rules`

Retrieves configured carrier selection rules for your account.

**Response:**
```json
{
  "rules": [
    {
      "rule_id": "rule_001",
      "name": "West Coast Ground Preference",
      "priority": 1,
      "conditions": {
        "origin_state": ["WA", "OR", "CA"],
        "destination_state": ["WA", "OR", "CA"],
        "weight_max_lbs": 50
      },
      "preferences": {
        "carriers": ["UPS", "FedEx"],
        "services": ["Ground"]
      }
    }
  ]
}
```

### Create Carrier Selection Rule

**Endpoint:** `POST /carrier-rules`

Creates a new carrier selection rule.

**Request Body:**
```json
{
  "name": "Hazmat Restriction",
  "priority": 5,
  "conditions": {
    "has_hazmat": true
  },
  "preferences": {
    "carriers": ["UPS", "FedEx"],
    "exclude_services": ["air", "express"]
  }
}
```

---

## 7. Batch Operations

### Batch Rate Request

**Endpoint:** `POST /rates/batch`

Request rates for multiple shipments in a single API call.

**Request Body:**
```json
{
  "requests": [
    {
      "request_id": "req_001",
      "origin": {...},
      "destination": {...},
      "packages": [...]
    },
    {
      "request_id": "req_002",
      "origin": {...},
      "destination": {...},
      "packages": [...]
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "request_id": "req_001",
      "rates": [...]
    },
    {
      "request_id": "req_002",
      "rates": [...]
    }
  ]
}
```

**Limits:** 
- Max 100 requests per batch call
- Total response time may be up to 5 seconds

---

## 8. Analytics & Reporting

### Get Shipment Analytics

**Endpoint:** `GET /analytics/shipments`

Retrieve shipment statistics and metrics.

**Query Parameters:**
- `start_date`: Start date (ISO 8601)
- `end_date`: End date (ISO 8601)
- `group_by`: `day`, `week`, `carrier`, `service`

**Response:**
```json
{
  "period": {
    "start": "2026-01-01",
    "end": "2026-01-08"
  },
  "metrics": {
    "total_shipments": 5432,
    "total_cost": 67890.45,
    "average_cost": 12.50,
    "on_time_percentage": 94.5
  },
  "by_carrier": [
    {
      "carrier": "UPS",
      "shipments": 3245,
      "cost": 40567.23,
      "on_time_percentage": 95.2
    },
    {
      "carrier": "FedEx",
      "shipments": 2187,
      "cost": 27323.22,
      "on_time_percentage": 93.4
    }
  ]
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Invalid postal code format",
    "details": {
      "field": "destination.postal_code",
      "value": "invalid"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_request` | 400 | Request validation failed |
| `authentication_failed` | 401 | Invalid or expired token |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource not found |
| `rate_limit_exceeded` | 429 | Too many requests |
| `carrier_error` | 502 | Carrier API returned error |
| `internal_error` | 500 | Internal Shipium error |

---

## Rate Limits

**Standard Limits:**
- 1000 requests per minute per account
- 100 requests per batch operation
- Webhook retries don't count toward rate limit

**Exceeded Rate Limit Response:**
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Retry after 60 seconds."
  }
}
```

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704723600
```

---

## Best Practices

1. **Cache Rate Responses:** Rates are typically valid for 1-4 hours
2. **Use Batch Endpoints:** When requesting rates for multiple orders
3. **Implement Webhooks:** More reliable than polling for tracking updates
4. **Validate Webhooks:** Always verify webhook signatures
5. **Handle Retries:** Implement exponential backoff for failed requests
6. **Monitor Rate Limits:** Track X-RateLimit headers
7. **Use External Order IDs:** Include your order IDs for easier correlation

---

## Support

**Documentation:** https://docs.shipium.com
**API Status:** https://status.shipium.com
**Support Email:** api-support@shipium.com
**Slack:** #api-support (for integration partners)
