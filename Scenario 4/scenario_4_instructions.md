# Scenario 4: API Integration & Data Transformation

## Overview
This scenario assesses your ability to build production-quality data transformation code, handle edge cases, implement proper validation, and write comprehensive tests.

**Time Estimate:** 2-3 hours

**Primary Skills Tested:**
- Data transformation and mapping
- Input validation and error handling
- Edge case handling
- Unit testing
- Code organization and documentation
- TypeScript/JavaScript proficiency

## Context

You're building a middleware service that transforms order data from a customer's Order Management System (OMS) into Shipium's API format. The customer's OMS provides order data in their proprietary format, and you need to convert it accurately and reliably.

This is a common task in Professional Services - every customer has their own data format, and you need to transform it correctly while handling all the edge cases.

## The Task

Build a transformation service that converts customer order data to Shipium's format, with proper validation, error handling, and comprehensive tests.

## Provided Materials

You have been provided with:
1. `scenario_4_instructions.md` - This document
2. `customer_order_format.json` - Customer's OMS order format specification
3. `shipium_order_format.json` - Shipium's expected API format specification
4. `sample_orders.json` - 10 example orders to transform
5. `edge_cases.json` - Tricky edge cases to handle
6. `validation_rules.md` - Required validation rules
7. `starter_template.ts` - Optional starter code (use if helpful)

## Requirements

### Part A: Core Transformation (Required - 25 points)

Implement a function that transforms the customer OMS format to Shipium's API format.

**Function Signature:**
```typescript
function transformOrder(customerOrder: CustomerOrder): ShipiumOrder
```

**Required Transformations:**

1. **Field Mapping:**
   - `orderNumber` → `external_order_id`
   - `orderDate` → `order_placed_ts`
   - `customer.fullName` → `destination_address.name`
   - `customer.email` → Contact info (separate field)
   - All address fields with proper mapping
   - And more (see format specifications)

2. **Data Conversions:**
   - **Weight:** Convert ounces to pounds (16 oz = 1 lb)
   - **Dimensions:** Parse "LxWxH" string format to structured object
   - **Dates:** Convert to ISO 8601 format
   - **Phone numbers:** Normalize format

3. **Type Definitions:**
   - Define proper TypeScript interfaces for both formats
   - Use strict typing throughout
   - Export types for reusability

### Part B: Error Handling & Validation (Required - 20 points)

Implement comprehensive validation and error handling.

**Required Validations:**

1. **Required Fields:**
   - `orderNumber`, `orderDate`, `customer`, `shippingAddr`, `items`
   - At least one item in the order
   - Each item must have SKU, quantity, weight, dimensions

2. **Data Format Validation:**
   - Email format validation
   - Phone number format (if provided)
   - Postal code format for country
   - Numeric values are valid numbers
   - Dimensions can be parsed

3. **Business Logic Validation:**
   - Weight > 0
   - Dimensions > 0
   - Quantity > 0
   - Price >= 0

4. **Error Handling:**
   - Throw descriptive errors with field names
   - Use custom error types where appropriate
   - Error messages should help debugging

### Part C: Edge Cases (Required - 20 points)

Handle these scenarios gracefully:

1. **Missing Optional Fields:**
   - `address2` is optional
   - `customer.email` might be missing
   - `customer.phone` might be missing
   - `item.attributes` might be missing

2. **Data Quality Issues:**
   - Dimensions string with inconsistent spacing: "10 x 8x 6"
   - Weight as decimal: 16.5 oz
   - Extra whitespace in strings
   - Mixed case country codes

3. **Invalid Data:**
   - Negative quantities
   - Zero or negative weights
   - Unparseable dimension strings
   - Invalid email formats
   - Missing required nested fields

4. **Multiple Items:**
   - Orders can have 1-100 items
   - Each item transforms independently
   - Maintain item order

### Part D: Testing (Required - 25 points)

Write comprehensive unit tests covering:

1. **Happy Path:**
   - Successful transformation with complete data
   - All fields mapped correctly
   - Conversions are accurate

2. **Edge Cases:**
   - Missing optional fields handled correctly
   - Whitespace trimmed appropriately
   - Decimal weights converted correctly
   - Various dimension string formats

3. **Validation Errors:**
   - Missing required fields throw errors
   - Invalid data throws errors
   - Error messages are descriptive
   - At least 5 validation test cases

4. **Weight & Dimension Conversions:**
   - 16 oz = 1 lb
   - 32 oz = 2 lb
   - 8 oz = 0.5 lb
   - Dimension parsing: "10x8x6" → {length: 10, width: 8, height: 6}
   - Various dimension formats

**Testing Framework:**
- Use Jest, Mocha, or your preferred framework
- Aim for >90% code coverage
- Test both success and failure cases
- Use descriptive test names

### Part E: Extension (Bonus - 10 points)

Implement bulk transformation capability:

```typescript
function transformOrders(
  customerOrders: CustomerOrder[]
): {
  successful: ShipiumOrder[];
  failed: Array<{
    order: CustomerOrder;
    error: Error;
  }>;
}
```

**Requirements:**
- Process multiple orders
- Collect all successes and failures
- Don't stop on first error
- Return both successful transformations and errors
- Consider performance for large batches

## Customer Order Format

### Structure

```typescript
interface CustomerOrder {
  orderNumber: string;           // Unique order identifier
  orderDate: string;              // ISO 8601 datetime
  customer: {
    custId: string;
    fullName: string;
    email?: string;               // Optional
    shippingAddr: {
      street1: string;
      street2?: string;           // Optional
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  items: Array<{
    sku: string;
    description: string;
    qty: number;
    weight_oz: number;            // Weight in ounces
    dims: string;                 // Format: "LxWxH" (e.g., "10x8x6")
  }>;
  shipFromWarehouse: string;
  requestedShipDate: string;      // YYYY-MM-DD format
  serviceLevel: string;
}
```

### Example

See `sample_orders.json` for complete examples.

## Shipium Order Format

### Structure

```typescript
interface ShipiumOrder {
  external_order_id: string;
  order_placed_ts: string;        // ISO 8601
  destination_address: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: Array<{
    external_line_item_id: string;
    description: string;
    quantity: number;
    weight: {
      value: number;              // In pounds
      unit: "lb";
    };
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: "in";
    };
  }>;
  origin_address: {
    facility_alias: string;
  };
  ship_option: {
    service_level: string;
  };
}
```

## Conversion Rules

### Weight Conversion
```
Customer: weight_oz (ounces)
Shipium: weight.value (pounds)

Formula: pounds = ounces / 16
Examples:
  16 oz → 1.0 lb
  32 oz → 2.0 lb
  8 oz → 0.5 lb
  24 oz → 1.5 lb
```

### Dimension Parsing
```
Customer: dims (string, format "LxWxH")
Shipium: dimensions object

Examples:
  "10x8x6" → {length: 10, width: 8, height: 6}
  "12 x 10 x 8" → {length: 12, width: 10, height: 8}
  "5x5x5" → {length: 5, width: 5, height: 5}

Handle variations:
  - Spaces around 'x'
  - Inconsistent spacing
  - Must be three numbers
```

### Field Mappings
```
Customer                        → Shipium
----------------------------------------
orderNumber                     → external_order_id
orderDate                       → order_placed_ts
customer.fullName               → destination_address.name
customer.shippingAddr.street1   → destination_address.street1
customer.shippingAddr.street2   → destination_address.street2
customer.shippingAddr.city      → destination_address.city
customer.shippingAddr.state     → destination_address.state
customer.shippingAddr.zip       → destination_address.postal_code
customer.shippingAddr.country   → destination_address.country
items[].sku                     → items[].external_line_item_id
items[].description             → items[].description
items[].qty                     → items[].quantity
items[].weight_oz               → items[].weight.value (converted)
items[].dims                    → items[].dimensions (parsed)
shipFromWarehouse               → origin_address.facility_alias
serviceLevel                    → ship_option.service_level
```

## Validation Rules

### Email Validation
```
Must match pattern: ^[^\s@]+@[^\s@]+\.[^\s@]+$
Examples:
  Valid: "user@example.com", "test.user@company.co.uk"
  Invalid: "notanemail", "missing@domain", "@example.com"
```

### Postal Code Validation
```
US: 5 digits or 5+4 format (12345 or 12345-6789)
Canada: A1A 1A1 or A1A1A1
Other: Any format accepted (too many variations)
```

### Phone Number
```
Optional field
If provided, should match: ^\+?1?\d{10,}$
Clean and normalize if possible
```

## Deliverables

Please submit:

1. **TypeScript/JavaScript Implementation** (required)
   - `order-transformer.ts` or `.js`
   - Type definitions
   - Well-organized code
   - Comments for complex logic

2. **Test Suite** (required)
   - `order-transformer.test.ts` or `.spec.js`
   - Comprehensive test coverage
   - Clear test descriptions
   - Both positive and negative tests

3. **README.md** (required)
   - How to run the code
   - How to run tests
   - Design decisions
   - Assumptions made
   - Any known limitations

4. **Package.json** (if using npm/node)
   - Dependencies listed
   - Scripts for running/testing

## Evaluation Criteria

Your submission will be evaluated on:

- **Correctness** (30%): Transformations are accurate, conversions are correct
- **Code Quality** (25%): Clean, organized, well-documented code
- **Error Handling** (20%): Comprehensive validation and clear error messages
- **Testing** (20%): Thorough test coverage of happy path and edge cases
- **Edge Cases** (5%): Handles tricky scenarios gracefully

## Tips for Success

### Code Quality
- Use meaningful variable names
- Break complex logic into small functions
- Add comments for non-obvious logic
- Follow consistent code style
- Use TypeScript's type system effectively

### Testing
- Test one thing per test
- Use descriptive test names
- Test both success and failure cases
- Don't forget edge cases
- Aim for high code coverage

### Error Handling
- Validate early in the function
- Throw errors with helpful messages
- Include field names in error messages
- Use custom error types if appropriate

### Common Pitfalls to Avoid
- Not handling optional fields
- Integer division for weight (use proper decimals)
- Not trimming whitespace
- Not handling various dimension formats
- Missing validation for negative numbers
- Poor error messages

## Example Test Structure

```typescript
describe('transformOrder', () => {
  describe('successful transformations', () => {
    it('transforms a complete order correctly', () => {
      // Test implementation
    });

    it('handles missing optional fields', () => {
      // Test implementation
    });
  });

  describe('weight conversion', () => {
    it('converts 16 oz to 1 lb', () => {
      // Test implementation
    });

    it('converts decimal ounces correctly', () => {
      // Test implementation
    });
  });

  describe('dimension parsing', () => {
    it('parses standard format "10x8x6"', () => {
      // Test implementation
    });

    it('handles spacing variations', () => {
      // Test implementation
    });
  });

  describe('validation errors', () => {
    it('throws error for missing orderNumber', () => {
      // Test implementation
    });

    it('throws error for negative weight', () => {
      // Test implementation
    });
  });
});
```

## Questions?

If you need clarification on requirements, document your assumptions in the README.

Good luck! We're excited to see your implementation.
