# Scenario 4: OMS to Shipium order transformer

TypeScript library that validates customer OMS orders, normalizes common data-quality issues, and maps them to the Shipium API order shape used in the assessment scenario.

## How to run the code

**Prerequisites:** Node.js 18+ and npm.

1. Install dependencies (from this directory):

   ```bash
   npm install
   ```

2. Compile TypeScript to `dist/`:

   ```bash
   npm run build
   ```

3. Use the compiled package from another Node project, or import from source in tests/tools:

   ```typescript
   import { transformOrder } from 'scenario-4-order-transformer';
   // or, during local development from this repo:
   import { transformOrder } from './src/index';
   ```

   Example:

   ```typescript
   import { transformOrder } from './dist/index.js';

   const shipiumOrder = transformOrder(customerOrder);
   console.log(JSON.stringify(shipiumOrder, null, 2));
   ```

There is no bundled CLI; the public API is the exported functions in `src/index.ts` (see **Design decisions**).

## How to run tests

From this directory:

```bash
npm test
```

Coverage report (statements/lines/functions thresholds are configured in `jest.config.js`):

```bash
npm run test:coverage
```

Tests load shared fixtures from the parent folder (`../scenario_4_sample_orders.json`, `../scenario_4_edge_cases.json`, etc.), so run commands from `Scenario 4/project/` as above.

## Design decisions

- **Pipeline:** `validateRequiredOrderFields` (structural checks on raw input) → `normalizeCustomerOrder` (trim strings, optional field cleanup, field aliases) → `parseValidatedCustomerOrder` / Zod `customerOrderSchema` (formats and business rules) → `transformOrder` mapping to `ShipiumOrder`.
- **Validation library:** Zod for the normalized order schema, plus a small Zod `superRefine` layer for required keys before normalization so missing `customer` / `items` cannot be masked by defaults.
- **Errors:** Failures throw `ValidationError` with messages intended to name the field or constraint (e.g. `Missing required field: orderNumber`, `Invalid postal code format for country US`).
- **Batch API:** `transformOrderBatch` / `transformOrders` collect per-order failures and continue processing.
- **Dimensions:** Parsed in `parseDimensions` with a flexible `L x W x H` splitter (spaces/tabs allowed around `x`).
- **Weights:** Ounces to pounds via `ounces / 16` with floating-point math (no integer division).

## Assumptions made

- **Node + npm** are the intended runtime and package manager for the reference implementation.
- **Input shape** matches the Scenario 4 materials: `orderNumber`, `orderDate`, `customer`, `items`, `shipFromWarehouse`, `requestedShipDate`, `serviceLevel`, and nested `shippingAddr` / line items as in `scenario_4_instructions.md` and sample JSON.
- **Line item fields** are primarily `sku`, `description`, `qty`, `weight_oz`, `dims`; optional aliases `quantity`, `weight`, `dimensions` are accepted at the structural validation and normalization layer.
- **Output shape** matches the Shipium payload described in the scenario (e.g. `external_order_id`, `destination_address`, `items[].weight` in lb, `items[].dimensions` in inches).
- **Dates:** `orderDate` is validated as parseable by `Date.parse`; `requestedShipDate` must be `YYYY-MM-DD`.

## Known limitations

- **No first-class CLI** in this package; integrate via `import` or a small wrapper script in your app.
- **Unknown fields** on line items (e.g. `attributes`) are not mapped to Shipium output; they are ignored after validation/normalization (Zod strips unknown keys on the item object schema).
- **Item count cap:** The scenario mentions up to 100 items; the implementation enforces at least one item but does not reject orders with more than 100 lines.
- **Phone validation** uses a pragmatic digit-count check after stripping formatting; it may differ from a strict literal regex in the written scenario spec.
- **Postal codes:** US and CA formats are validated strictly; other countries accept non-empty zip strings without format-specific rules beyond “present when required by other rules.”
- **Coverage:** Branch coverage can be lower than line coverage while still meeting global thresholds; see `jest --coverage` output for per-file detail.
