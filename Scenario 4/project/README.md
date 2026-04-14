# Scenario 4 — OMS to Shipium order transformer

TypeScript library that validates customer OMS orders and maps them to the Shipium order JSON shape (field renames, ounces to pounds, `LxWxH` dimension parsing, optional field omission).

## Prerequisites

- Node.js 18+ (tested with Node 22)

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

Compiled output is written to `dist/`.

## Run tests

```bash
npm test
```

Coverage report:

```bash
npm run test:coverage
```

## API

- `transformOrder(customerOrder: CustomerOrder): ShipiumOrder` — validates then transforms; throws `ValidationError` on invalid input.
- `transformOrderBatch` / `transformOrders` (alias) — runs `transformOrder` per row; failures are collected with `error` message strings without stopping the batch.
- `validateOrder`, `convertOuncesToPounds`, `parseDimensions`, `normalizeCustomerOrder` — exported for focused tests or reuse.

## Design decisions

1. **Normalize then validate** — All string fields are trimmed first (`normalizeCustomerOrder`). Optional strings that become empty (`email`, `street2`) are treated as absent so the Shipium payload omits those keys (no `null`).
2. **Country and state** — `country` is uppercased on output. For `US` and `CA`, `state` must be exactly two characters after trim; other countries allow longer province names.
3. **Postal codes** — `US`: `12345` or `12345-6789`. `CA`: spaced or compact Canadian postal forms. Other countries: any non-empty trimmed `zip`.
4. **Dimensions** — Split on `x` with surrounding whitespace allowed (including tabs). Exactly three positive finite numbers required.
5. **Weights** — `pounds = ounces / 16` with full float precision (tests use `toBeCloseTo` where needed).

## Assumptions (spec gaps)

- **Email in output** — Instructions mention mapping email to contact info, but the provided Shipium schema and golden JSON have no recipient email field. This implementation **only validates** email when it is present; it is not copied onto `ShipiumOrder`.
- **Phone** — Not present in the supplied OMS examples; `customer.phone` is optional in types but unused. No normalization implemented.
- **Line item price** — Instructions mention `price >= 0`, but the OMS schema and fixtures include no `price` field; no price validation is implemented.

## Optional AWS Lambda wrapper

See [deployment/lambda-handler.example.ts](deployment/lambda-handler.example.ts) for a minimal pattern (API Gateway proxy integration): parse JSON body, call `transformOrder`, return 200 or 400 with the validation message.

## Fixture JSON files

Jest tests load `scenario_4_sample_orders.json` and `scenario_4_edge_cases.json` from the **parent directory** (`../` relative to this `project/` folder), where the assessment materials live alongside this code.

## Project layout

| Path | Purpose |
|------|---------|
| `src/types.ts` | Input/output interfaces |
| `src/errors.ts` | `ValidationError` |
| `src/normalize.ts` | Deep string trim / optional clearing |
| `src/validation.ts` | Rules and descriptive errors |
| `src/conversions.ts` | Weight and dimension parsing |
| `src/transform.ts` | `transformOrder` / `transformOrderBatch` |
| `src/index.ts` | Public exports |
| `tests/order-transformer.test.ts` | Jest suite (fixtures from this folder) |
