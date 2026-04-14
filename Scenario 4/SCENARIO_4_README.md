# Scenario 4 Assessment Materials - API Integration & Data Transformation

## Overview

This package contains all materials needed to complete **Scenario 4: API Integration & Data Transformation** for the Professional Services Developer role at Shipium.

## Scenario Summary

Build a production-quality data transformation service that converts customer Order Management System (OMS) data into Shipium's API format. This involves field mapping, unit conversions, validation, error handling, and comprehensive testing - all common tasks in Professional Services integration work.

## Package Contents

1. **scenario_4_instructions.md** - Complete requirements and specifications
2. **input_format_examples.md** - Customer OMS format with examples
3. **output_format_spec.md** - Shipium API format specification
4. **sample_orders.json** - 10 sample orders to transform
5. **edge_cases.json** - Tricky edge cases to handle
6. **test_cases.json** - Expected test cases with inputs/outputs
7. **starter_template.ts** - Optional TypeScript starter code
8. **evaluation_rubric.md** - How your code will be evaluated
9. **SCENARIO_4_README.md** - This file

## The Challenge

**Time Estimate:** 2-3 hours

**Language:** TypeScript/JavaScript preferred (Python/Java also OK)

**Key Tasks:**
1. Transform customer order format to Shipium API format
2. Convert weights (ounces → pounds)
3. Parse dimension strings ("10x8x6" → structured object)
4. Validate all input data
5. Handle edge cases gracefully
6. Write comprehensive unit tests

## Getting Started

### Step 1: Read the Instructions (15 minutes)

Start with `scenario_4_instructions.md` to understand:
- The two data formats (input and output)
- Required transformations
- Validation requirements
- Edge cases to handle
- Deliverables expected

### Step 2: Review the Formats (15 minutes)

1. **input_format_examples.md** - Customer OMS format
   - Field structure
   - Data types
   - Common variations
   - Examples

2. **output_format_spec.md** - Shipium API format
   - Expected structure
   - Field requirements
   - Validation rules
   - Examples

### Step 3: Examine Test Data (10 minutes)

3. **sample_orders.json** - 10 example orders
   - Simple single-item order
   - Multi-item orders
   - Orders with missing optional fields
   - Decimal weights
   - Various dimension formats

4. **edge_cases.json** - Tricky scenarios
   - Missing required fields
   - Invalid data
   - Negative values
   - Malformed dimensions

5. **test_cases.json** - Expected test scenarios
   - Happy path tests
   - Validation error tests
   - Edge case tests
   - Expected outputs

### Step 4: Start Coding (2+ hours)

**Suggested Approach:**

**Phase 1: Basic Transformation (30 min)**
- Get simple field mapping working
- Transform one complete order successfully
- Don't worry about edge cases yet

**Phase 2: Add Conversions (30 min)**
- Implement weight conversion (oz → lb)
- Implement dimension parsing
- Test with sample_orders.json

**Phase 3: Add Validation (45 min)**
- Validate required fields
- Validate data formats
- Validate business logic
- Write validation tests

**Phase 4: Handle Edge Cases (30 min)**
- Missing optional fields
- Invalid data
- Special formats
- Write edge case tests

**Phase 5: Polish (30 min)**
- Clean up code
- Add comments
- Write README
- Review tests

## Key Requirements

### Core Transformation

**Field Mappings:**
```
Customer OMS              → Shipium API
----------------------------------------
orderNumber               → external_order_id
orderDate                 → order_placed_ts
customer.fullName         → destination_address.name
customer.shippingAddr.*   → destination_address.*
items[].sku               → items[].external_line_item_id
items[].qty               → items[].quantity
items[].weight_oz         → items[].weight.value (converted)
items[].dims              → items[].dimensions (parsed)
shipFromWarehouse         → origin_address.facility_alias
serviceLevel              → ship_option.service_level
```

**Unit Conversions:**
- Weight: ounces ÷ 16 = pounds
- Dimensions: Parse "10x8x6" → {length: 10, width: 8, height: 6}

### Validation

**Required:**
- Order number
- Customer name
- Complete shipping address
- At least one item per order
- Each item must have SKU, quantity, weight, dimensions

**Business Logic:**
- Quantities must be positive integers
- Weights must be positive numbers
- Dimensions must be positive numbers
- Email format validation (basic)

### Edge Cases

- Missing optional fields (street2, email)
- Dimension strings with spaces: "10 x 8 x 6"
- Decimal weights: 12.5 oz
- Very small/large weights
- Invalid dimensions: "10x8" or "axbxc"
- Negative values
- International addresses

### Testing

Write comprehensive tests for:
- ✅ Successful transformations
- ✅ Weight conversions
- ✅ Dimension parsing
- ✅ Validation errors
- ✅ Edge cases

Aim for >90% code coverage.

## Deliverables

**Submit the following:**

1. **Source Code** (required)
   - Transformation logic
   - Validation logic
   - Type definitions
   - Format: .ts, .js, .py, or .java

2. **Unit Tests** (required)
   - Test file(s)
   - 8-10+ test cases minimum
   - Success and failure scenarios

3. **README.md** (required)
   - How to run the code
   - How to run tests
   - Design decisions
   - Assumptions made

4. **Package/Dependency File** (required)
   - package.json (Node)
   - requirements.txt (Python)
   - pom.xml (Java)

**Submission Format:**
- ZIP file with all code, OR
- GitHub/GitLab repository link (preferred)

## Evaluation Criteria

Your submission will be scored on:

- **Correctness (30%)** - Accurate transformations and conversions
- **Validation (20%)** - Proper input validation and error handling
- **Edge Cases (20%)** - Handles tricky scenarios gracefully
- **Testing (20%)** - Comprehensive, well-written tests
- **Code Quality (10%)** - Clean, maintainable, production-ready

See `evaluation_rubric.md` for detailed scoring breakdown.

## Tips for Success

### Start Simple, Build Up
1. Get basic transformation working first
2. Add validation incrementally
3. Handle one edge case at a time
4. Write tests as you go

### Focus on Quality
- Write code you'd deploy to production
- Make error messages helpful for debugging
- Think about the next developer who maintains this
- Test thoroughly

### Common Pitfalls to Avoid

❌ **Don't:**
- Skip validation ("I'll add it later")
- Use vague error messages
- Forget to test edge cases
- Assume input is always perfect
- Over-engineer (keep it simple)
- Use integer division for weights

✅ **Do:**
- Validate early in the function
- Include field names in error messages
- Handle missing optional fields correctly
- Test both success and failure cases
- Document complex logic
- Use proper decimal division for weights

### Time Management

**If you have 2 hours:**
- Basic transformation: 30 min
- Validation: 30 min
- Edge cases: 20 min
- Testing: 30 min
- Documentation: 10 min

**If you have 3 hours:**
- Add the bonus batch processing feature
- Write more comprehensive tests
- Add better documentation
- Refactor for cleaner code

## Example Transformation

**Input (Customer OMS):**
```json
{
  "orderNumber": "ORD-001",
  "orderDate": "2026-01-15T10:30:00Z",
  "customer": {
    "custId": "CUST-123",
    "fullName": "John Smith",
    "email": "john@example.com",
    "shippingAddr": {
      "street1": "123 Main St",
      "street2": "Apt 4",
      "city": "Seattle",
      "state": "WA",
      "zip": "98101",
      "country": "US"
    }
  },
  "items": [{
    "sku": "PROD-001",
    "description": "Blue Widget",
    "qty": 2,
    "weight_oz": 16,
    "dims": "10x8x6"
  }],
  "shipFromWarehouse": "DC-WEST-01",
  "requestedShipDate": "2026-01-16",
  "serviceLevel": "GROUND"
}
```

**Expected Output (Shipium API):**
```json
{
  "external_order_id": "ORD-001",
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
  "items": [{
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
  }],
  "origin_address": {
    "facility_alias": "DC-WEST-01"
  },
  "ship_option": {
    "service_level": "GROUND"
  }
}
```

## Optional: Using the Starter Template

A TypeScript starter template is provided in `starter_template.ts`. You can:

**Option 1:** Use it as a starting point
- Copy the template
- Fill in the TODOs
- Modify as needed

**Option 2:** Use it as a reference
- See the suggested structure
- Implement your own way

**Option 3:** Start from scratch
- Ignore the template
- Build your own structure

## Questions?

If you need clarification on requirements:
- For take-home: Email the hiring team
- During interview: Ask the interviewer
- Document assumptions in your README

## What We're Looking For

**Strong Candidates Will:**
- Write production-quality code
- Handle all edge cases
- Write comprehensive tests
- Create clear error messages
- Document decisions
- Show attention to detail

**This Assessment Reflects Real Work:**
This scenario mirrors the actual integration work you'd do in Professional Services:
- Transforming between different data formats
- Handling imperfect input data
- Building reliable, testable services
- Writing production-ready code

Good luck! We're excited to see your solution.

---

**Need Help?**
- Review the instructions carefully
- Check the examples
- Look at test cases for guidance
- Document any assumptions you make
