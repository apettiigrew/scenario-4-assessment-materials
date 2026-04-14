# Customer OMS Order Format - Examples

## Format Specification

This document shows the customer's Order Management System (OMS) format with comprehensive examples.

## Schema

```typescript
interface CustomerOrder {
  orderNumber: string;           // Required: Unique order identifier
  orderDate: string;              // Required: ISO 8601 datetime
  customer: {                     // Required
    custId: string;               // Required
    fullName: string;             // Required
    email: string;                // Required (but may be empty in edge cases)
    shippingAddr: {               // Required
      street1: string;            // Required
      street2?: string;           // Optional: Apt, suite, etc.
      city: string;               // Required
      state: string;              // Required
      zip: string;                // Required
      country: string;            // Required
    };
  };
  items: Array<{                  // Required: At least one item
    sku: string;                  // Required
    description: string;          // Required
    qty: number;                  // Required: Positive integer
    weight_oz: number;            // Required: Weight in ounces
    dims: string;                 // Required: Format "LxWxH"
  }>;
  shipFromWarehouse: string;      // Required
  requestedShipDate: string;      // Required: YYYY-MM-DD
  serviceLevel: string;           // Required
}
```

## Example 1: Complete Order

```json
{
  "orderNumber": "ORD-2026-001",
  "orderDate": "2026-01-15T10:30:00Z",
  "customer": {
    "custId": "CUST-123",
    "fullName": "John Smith",
    "email": "john.smith@example.com",
    "shippingAddr": {
      "street1": "123 Main St",
      "street2": "Apt 4",
      "city": "Seattle",
      "state": "WA",
      "zip": "98101",
      "country": "US"
    }
  },
  "items": [
    {
      "sku": "PROD-001",
      "description": "Blue Widget",
      "qty": 2,
      "weight_oz": 16,
      "dims": "10x8x6"
    }
  ],
  "shipFromWarehouse": "DC-WEST-01",
  "requestedShipDate": "2026-01-16",
  "serviceLevel": "GROUND"
}
```

## Example 2: Multiple Items

```json
{
  "orderNumber": "ORD-2026-002",
  "orderDate": "2026-01-15T14:20:00Z",
  "customer": {
    "custId": "CUST-456",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "shippingAddr": {
      "street1": "456 Oak Ave",
      "city": "Portland",
      "state": "OR",
      "zip": "97201",
      "country": "US"
    }
  },
  "items": [
    {
      "sku": "PROD-A",
      "description": "Red Gadget",
      "qty": 1,
      "weight_oz": 24,
      "dims": "12x10x8"
    },
    {
      "sku": "PROD-B",
      "description": "Green Widget",
      "qty": 3,
      "weight_oz": 8,
      "dims": "6x6x4"
    }
  ],
  "shipFromWarehouse": "DC-WEST-02",
  "requestedShipDate": "2026-01-16",
  "serviceLevel": "2-DAY"
}
```

## Example 3: Decimal Weight

```json
{
  "orderNumber": "ORD-2026-003",
  "orderDate": "2026-01-15T16:00:00Z",
  "customer": {
    "custId": "CUST-789",
    "fullName": "Bob Johnson",
    "email": "bob@example.com",
    "shippingAddr": {
      "street1": "789 Pine St",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94102",
      "country": "US"
    }
  },
  "items": [
    {
      "sku": "LIGHT-001",
      "description": "Feather Light Product",
      "qty": 1,
      "weight_oz": 12.5,
      "dims": "5x4x3"
    }
  ],
  "shipFromWarehouse": "DC-WEST-01",
  "requestedShipDate": "2026-01-16",
  "serviceLevel": "OVERNIGHT"
}
```

## Field Details

### orderNumber
- Format: String
- Pattern: Usually "ORD-YYYY-NNN" but can vary
- Required: Yes
- Example: "ORD-2026-001"

### orderDate
- Format: ISO 8601 datetime
- Timezone: UTC (indicated by 'Z')
- Required: Yes
- Example: "2026-01-15T10:30:00Z"

### customer.fullName
- Format: String
- May contain: Letters, spaces, apostrophes, hyphens
- Required: Yes
- Examples: "John Smith", "Mary O'Brien", "Jean-Luc Picard"

### customer.email
- Format: Email address
- Validation: Basic email pattern
- Required: Yes (but might be empty string in edge cases)
- Example: "user@example.com"

### customer.shippingAddr.zip
- Format: String
- US Format: 5 digits or 5+4 format
- Canada Format: A1A 1A1
- Required: Yes
- Examples: "98101", "98101-1234", "M5B 2H1"

### items[].qty
- Format: Number (integer)
- Range: Must be > 0
- Required: Yes
- Example: 2

### items[].weight_oz
- Format: Number (can be decimal)
- Unit: Ounces
- Range: Must be > 0
- Required: Yes
- Examples: 16, 24.5, 0.5

### items[].dims
- Format: String "LxWxH"
- Unit: Inches
- Separators: Can have spaces around 'x'
- Required: Yes
- Examples: "10x8x6", "10 x 8 x 6", "12x10x8"

### serviceLevel
- Format: String
- Common values: "GROUND", "2-DAY", "OVERNIGHT", "FREIGHT"
- Required: Yes
- Case: Usually uppercase but can vary

## Common Variations

### Missing street2
```json
"shippingAddr": {
  "street1": "123 Main St",
  "city": "Seattle",
  "state": "WA",
  "zip": "98101",
  "country": "US"
}
```

### Canadian Address
```json
"shippingAddr": {
  "street1": "123 Yonge Street",
  "city": "Toronto",
  "state": "ON",
  "zip": "M5B 2H1",
  "country": "CA"
}
```

### Dimensions with Spaces
```json
"dims": "20 x 16 x 12"
```

### Very Light Item
```json
{
  "sku": "TINY-001",
  "description": "Jewelry Item",
  "qty": 1,
  "weight_oz": 0.5,
  "dims": "2x2x1"
}
```

### Very Heavy Item
```json
{
  "sku": "HEAVY-001",
  "description": "Equipment",
  "qty": 1,
  "weight_oz": 320,
  "dims": "24x24x18"
}
```

## Data Quality Notes

**Real-world issues you might encounter:**

1. **Extra whitespace:**
   - Leading/trailing spaces in string fields
   - Inconsistent spacing in dimensions

2. **Case variations:**
   - Country codes: "US" vs "us"
   - Service levels: "GROUND" vs "Ground"

3. **Number formats:**
   - Integers vs decimals for weight
   - String vs number for qty in some systems

4. **Missing optionals:**
   - street2 frequently missing
   - email sometimes empty string ""

## Conversion Reference

### Weight (Ounces to Pounds)

```
Formula: pounds = ounces / 16

Examples:
8 oz  = 0.5 lb
12 oz = 0.75 lb
16 oz = 1.0 lb
24 oz = 1.5 lb
32 oz = 2.0 lb
48 oz = 3.0 lb
```

### Dimensions (String to Object)

```
Input:  "10x8x6"
Output: {length: 10, width: 8, height: 6, unit: "in"}

Input:  "12 x 10 x 8"
Output: {length: 12, width: 10, height: 8, unit: "in"}

Input:  "20x16x12"
Output: {length: 20, width: 16, height: 12, unit: "in"}
```
