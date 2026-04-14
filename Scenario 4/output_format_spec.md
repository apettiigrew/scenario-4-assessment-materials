# Shipium API Order Format - Specification

## Format Overview

This document specifies the format expected by Shipium's order creation API.

## Schema

```typescript
interface ShipiumOrder {
  external_order_id: string;      // Required: Your order identifier
  order_placed_ts: string;        // Required: ISO 8601 datetime
  destination_address: {          // Required
    name: string;                 // Required
    street1: string;              // Required
    street2?: string;             // Optional
    city: string;                 // Required
    state: string;                // Required
    postal_code: string;          // Required
    country: string;              // Required
  };
  items: Array<{                  // Required: At least one item
    external_line_item_id: string; // Required
    description: string;          // Required
    quantity: number;             // Required: Positive integer
    weight: {                     // Required
      value: number;              // Required: Positive number
      unit: "lb";                 // Required: Always "lb"
    };
    dimensions: {                 // Required
      length: number;             // Required: Positive number
      width: number;              // Required: Positive number
      height: number;             // Required: Positive number
      unit: "in";                 // Required: Always "in"
    };
  }>;
  origin_address: {               // Required
    facility_alias: string;       // Required
  };
  ship_option: {                  // Required
    service_level: string;        // Required
  };
}
```

## Example: Complete Order

```json
{
  "external_order_id": "ORD-2026-001",
  "order_placed_ts": "2026-01-15T10:30:00Z",
  "destination_address": {
    "name": "John Smith",
    "street1": "123 Main St",
    "street2": "Apt 4",
    "city": "Seattle",
    "state": "WA",
    "postal_code": "98101",
    "country": "US"
  },
  "items": [
    {
      "external_line_item_id": "PROD-001",
      "description": "Blue Widget",
      "quantity": 2,
      "weight": {
        "value": 1.0,
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
  "origin_address": {
    "facility_alias": "DC-WEST-01"
  },
  "ship_option": {
    "service_level": "GROUND"
  }
}
```

## Field Specifications

### external_order_id
- Type: string
- Description: Unique identifier from your system
- Required: Yes
- Max length: 255 characters
- Example: "ORD-2026-001"

### order_placed_ts
- Type: string
- Format: ISO 8601 datetime with timezone
- Required: Yes
- Example: "2026-01-15T10:30:00Z"
- Note: Must include timezone (Z for UTC or +00:00)

### destination_address.name
- Type: string
- Description: Recipient's full name
- Required: Yes
- Max length: 100 characters
- Example: "John Smith"

### destination_address.street1
- Type: string
- Description: Primary street address
- Required: Yes
- Max length: 100 characters
- Example: "123 Main St"

### destination_address.street2
- Type: string
- Description: Secondary address (apt, suite, etc.)
- Required: No
- Max length: 100 characters
- Example: "Apt 4"
- Note: Omit field if not present (don't send null or empty string)

### destination_address.city
- Type: string
- Required: Yes
- Max length: 50 characters
- Example: "Seattle"

### destination_address.state
- Type: string
- Format: 2-character state/province code
- Required: Yes
- Example: "WA", "ON", "CA"

### destination_address.postal_code
- Type: string
- Required: Yes
- Format: Varies by country
  - US: 5 digits or 5+4 format
  - Canada: A1A 1A1 format
  - Other: As provided
- Example: "98101", "98101-1234", "M5B 2H1"

### destination_address.country
- Type: string
- Format: ISO 3166-1 alpha-2 country code
- Required: Yes
- Example: "US", "CA", "MX"
- Note: Must be uppercase

### items[].external_line_item_id
- Type: string
- Description: Your SKU or line item identifier
- Required: Yes
- Max length: 255 characters
- Example: "PROD-001"

### items[].description
- Type: string
- Description: Human-readable item description
- Required: Yes
- Max length: 255 characters
- Example: "Blue Widget"

### items[].quantity
- Type: number (integer)
- Description: Number of units
- Required: Yes
- Range: Must be >= 1
- Example: 2

### items[].weight.value
- Type: number
- Description: Weight value
- Required: Yes
- Unit: Pounds (lb)
- Range: Must be > 0
- Precision: Up to 2 decimal places recommended
- Example: 1.0, 1.5, 2.75

### items[].weight.unit
- Type: string
- Description: Unit of measurement
- Required: Yes
- Allowed values: "lb"
- Example: "lb"
- Note: Always use "lb" (pounds)

### items[].dimensions.length
- Type: number
- Description: Longest dimension
- Required: Yes
- Unit: Inches
- Range: Must be > 0
- Example: 10

### items[].dimensions.width
- Type: number
- Description: Middle dimension
- Required: Yes
- Unit: Inches
- Range: Must be > 0
- Example: 8

### items[].dimensions.height
- Type: number
- Description: Shortest dimension
- Required: Yes
- Unit: Inches
- Range: Must be > 0
- Example: 6

### items[].dimensions.unit
- Type: string
- Description: Unit of measurement
- Required: Yes
- Allowed values: "in"
- Example: "in"
- Note: Always use "in" (inches)

### origin_address.facility_alias
- Type: string
- Description: Warehouse or fulfillment center identifier
- Required: Yes
- Max length: 100 characters
- Example: "DC-WEST-01"

### ship_option.service_level
- Type: string
- Description: Shipping service level
- Required: Yes
- Example: "GROUND", "2-DAY", "OVERNIGHT"
- Note: Valid values depend on your configuration

## Multiple Items Example

```json
{
  "external_order_id": "ORD-2026-002",
  "order_placed_ts": "2026-01-15T14:20:00Z",
  "destination_address": {
    "name": "Jane Doe",
    "street1": "456 Oak Ave",
    "city": "Portland",
    "state": "OR",
    "postal_code": "97201",
    "country": "US"
  },
  "items": [
    {
      "external_line_item_id": "PROD-A",
      "description": "Red Gadget",
      "quantity": 1,
      "weight": {
        "value": 1.5,
        "unit": "lb"
      },
      "dimensions": {
        "length": 12,
        "width": 10,
        "height": 8,
        "unit": "in"
      }
    },
    {
      "external_line_item_id": "PROD-B",
      "description": "Green Widget",
      "quantity": 3,
      "weight": {
        "value": 0.5,
        "unit": "lb"
      },
      "dimensions": {
        "length": 6,
        "width": 6,
        "height": 4,
        "unit": "in"
      }
    }
  ],
  "origin_address": {
    "facility_alias": "DC-WEST-02"
  },
  "ship_option": {
    "service_level": "2-DAY"
  }
}
```

## Validation Rules

### Required Fields
All fields marked as "Required: Yes" must be present in the payload.

### Data Types
- Strings must be properly quoted
- Numbers must be numeric (not strings)
- Do not use null for optional fields - omit them entirely

### Numeric Constraints
- **Weight:** Must be positive (> 0)
- **Dimensions:** All must be positive (> 0)
- **Quantity:** Must be positive integer (>= 1)

### String Length
Respect maximum length constraints to avoid API errors.

### Country Codes
- Must be valid ISO 3166-1 alpha-2 codes
- Must be uppercase
- Common values: "US", "CA", "MX", "GB", "AU"

## Common Mistakes to Avoid

❌ **Don't do this:**
```json
{
  "weight": {
    "value": "1.5",  // ❌ String instead of number
    "unit": "lb"
  }
}
```

✅ **Do this:**
```json
{
  "weight": {
    "value": 1.5,  // ✅ Number
    "unit": "lb"
  }
}
```

❌ **Don't do this:**
```json
{
  "destination_address": {
    "street2": null  // ❌ Don't send null
  }
}
```

✅ **Do this:**
```json
{
  "destination_address": {
    // ✅ Omit street2 if not present
  }
}
```

❌ **Don't do this:**
```json
{
  "destination_address": {
    "country": "us"  // ❌ Lowercase
  }
}
```

✅ **Do this:**
```json
{
  "destination_address": {
    "country": "US"  // ✅ Uppercase
  }
}
```

## Weight Conversion Reference

Since customer data is in ounces and Shipium expects pounds:

```
Formula: pounds = ounces / 16

Common conversions:
8 oz   = 0.5 lb
12 oz  = 0.75 lb
16 oz  = 1.0 lb
24 oz  = 1.5 lb
32 oz  = 2.0 lb
48 oz  = 3.0 lb
64 oz  = 4.0 lb
```

## Additional Notes

- **Timestamps:** Always include timezone information
- **Decimal precision:** Use 2 decimal places for weights (1.50 is fine, 1.5 is also fine)
- **Dimensions order:** Length >= Width >= Height is recommended but not required
- **Service levels:** Must match configured service levels in your account
