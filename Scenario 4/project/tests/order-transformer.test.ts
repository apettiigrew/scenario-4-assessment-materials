import * as fs from 'fs';
import * as path from 'path';
import {
  convertOuncesToPounds,
  parseDimensions,
  transformOrder,
  transformOrderBatch,
  ValidationError,
} from '../src/index';

/** Assessment fixtures live in the parent `Scenario 4/` folder. */
const scenarioDir = path.join(__dirname, '..', '..');

function readJson<T>(file: string): T {
  const p = path.join(scenarioDir, file);
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
}

describe('transformOrder', () => {
  describe('golden paths from scenario_4_sample_orders.json', () => {
    const data = readJson<{ sample_orders: Array<{ name: string; order: unknown; expected_output?: unknown }> }>(
      'scenario_4_sample_orders.json'
    );

    it.each(
      data.sample_orders.filter((s) => s.expected_output !== undefined)
    )('$name matches expected_output', ({ order, expected_output }) => {
      const result = transformOrder(order as never);
      expect(result).toEqual(expected_output);
    });

    it('Missing Optional Fields: omits street2 and accepts missing email', () => {
      const entry = data.sample_orders.find((s) => s.name === 'Missing Optional Fields')!;
      const result = transformOrder(entry.order as never);
      expect(result.destination_address).not.toHaveProperty('street2');
      expect(result.external_order_id).toBe('ORD-2026-003');
    });

    it('Decimal Weight: 12.5 oz -> 0.78125 lb', () => {
      const entry = data.sample_orders.find((s) => s.name === 'Decimal Weight')!;
      const result = transformOrder(entry.order as never);
      expect(result.items[0].weight.value).toBeCloseTo(0.78125, 10);
    });

    it('Dimensions with Spaces: parses 20 x 16 x 12', () => {
      const entry = data.sample_orders.find((s) => s.name === 'Dimensions with Spaces')!;
      const result = transformOrder(entry.order as never);
      expect(result.items[0].dimensions).toEqual({
        length: 20,
        width: 16,
        height: 12,
        unit: 'in',
      });
    });

    it('Canadian Address: preserves postal and uppercases country', () => {
      const entry = data.sample_orders.find((s) => s.name === 'Canadian Address')!;
      const result = transformOrder(entry.order as never);
      expect(result.destination_address.country).toBe('CA');
      expect(result.destination_address.postal_code).toBe('M5B 2H1');
      expect(result.destination_address.state).toBe('ON');
    });

    it('Heavy Item: 320 oz -> 20 lb', () => {
      const entry = data.sample_orders.find((s) => s.name === 'Heavy Item')!;
      const result = transformOrder(entry.order as never);
      expect(result.items[0].weight.value).toBe(20);
    });

    it('Small Dimensions: 2 oz -> 0.125 lb', () => {
      const entry = data.sample_orders.find((s) => s.name === 'Small Dimensions')!;
      const result = transformOrder(entry.order as never);
      expect(result.items[0].weight.value).toBeCloseTo(0.125, 10);
    });

    it('Mixed Case and Whitespace: trims and normalizes country', () => {
      const entry = data.sample_orders.find((s) => s.name === 'Mixed Case and Whitespace')!;
      const result = transformOrder(entry.order as never);
      expect(result.external_order_id).toBe('ORD-2026-009');
      expect(result.destination_address.country).toBe('US');
      expect(result.destination_address.state).toBe('FL');
      expect(result.items[0].external_line_item_id).toBe('MESSY-DATA');
    });
  });

  describe('documented happy paths (scenario_4_test_cases.md excerpts)', () => {
    const complete = {
      orderNumber: 'ORD-2026-001',
      orderDate: '2026-01-15T10:30:00Z',
      customer: {
        custId: 'CUST-123',
        fullName: 'John Smith',
        email: 'john.smith@example.com',
        shippingAddr: {
          street1: '123 Main St',
          street2: 'Apt 4',
          city: 'Seattle',
          state: 'WA',
          zip: '98101',
          country: 'US',
        },
      },
      items: [
        {
          sku: 'PROD-001',
          description: 'Blue Widget',
          qty: 2,
          weight_oz: 16,
          dims: '10x8x6',
        },
      ],
      shipFromWarehouse: 'DC-WEST-01',
      requestedShipDate: '2026-01-16',
      serviceLevel: 'GROUND',
    };

    it('transforms complete order successfully', () => {
      const result = transformOrder(complete as never);
      expect(result.external_order_id).toBe('ORD-2026-001');
      expect(result.items[0].weight.value).toBe(1);
      expect(result.destination_address.street2).toBe('Apt 4');
    });

    it('handles missing optional street2', () => {
      const input = {
        ...complete,
        orderNumber: 'ORD-2026-002',
        orderDate: '2026-01-15T11:00:00Z',
        customer: {
          ...complete.customer,
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          shippingAddr: {
            street1: '456 Oak Ave',
            city: 'Portland',
            state: 'OR',
            zip: '97201',
            country: 'US',
          },
        },
        items: [
          {
            sku: 'PROD-002',
            description: 'Red Gadget',
            qty: 1,
            weight_oz: 24,
            dims: '12x10x8',
          },
        ],
        shipFromWarehouse: 'DC-WEST-02',
        serviceLevel: '2-DAY',
      };
      const result = transformOrder(input as never);
      expect(result.destination_address).not.toHaveProperty('street2');
      expect(result.items[0].weight.value).toBe(1.5);
    });

    it('transforms order with multiple items', () => {
      const input = {
        orderNumber: 'ORD-2026-003',
        orderDate: '2026-01-15T12:00:00Z',
        customer: {
          custId: 'CUST-789',
          fullName: 'Bob Johnson',
          email: 'bob@example.com',
          shippingAddr: {
            street1: '789 Pine St',
            city: 'San Francisco',
            state: 'CA',
            zip: '94102',
            country: 'US',
          },
        },
        items: [
          { sku: 'PROD-A', description: 'Item A', qty: 2, weight_oz: 16, dims: '10x8x6' },
          { sku: 'PROD-B', description: 'Item B', qty: 1, weight_oz: 32, dims: '14x12x10' },
        ],
        shipFromWarehouse: 'DC-WEST-01',
        requestedShipDate: '2026-01-16',
        serviceLevel: 'GROUND',
      };
      const result = transformOrder(input as never);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].external_line_item_id).toBe('PROD-A');
      expect(result.items[1].weight.value).toBe(2);
    });
  });

  describe('scenario_4_edge_cases.json', () => {
    const { edge_cases } = readJson<{
      edge_cases: Array<{
        case_name: string;
        order: unknown;
        expected_behavior: string;
      }>;
    }>('scenario_4_edge_cases.json');

    const throwsCases = edge_cases.filter(
      (c) =>
        c.expected_behavior.includes('Should throw') ||
        c.expected_behavior.includes('throw error')
    );

    it.each(throwsCases)('$case_name', ({ order, expected_behavior, case_name }) => {
      const quoted = /'([^']+)'/.exec(expected_behavior);
      const expectedMessage = quoted ? quoted[1] : expected_behavior;
      if (case_name.includes('Dimension Format') || case_name.includes('Zero Dimension')) {
        expect(() => transformOrder(order as never)).toThrow(ValidationError);
        expect(() => transformOrder(order as never)).toThrow(
          /^(Invalid dimension format|Invalid dimension format: must be LxWxH|Invalid dimension format: dimensions must be numbers|All dimensions must be greater than 0)/
        );
      } else {
        expect(() => transformOrder(order as never)).toThrow(ValidationError);
        expect(() => transformOrder(order as never)).toThrow(expectedMessage);
      }
    });

    const successCases = edge_cases.filter(
      (c) =>
        c.expected_behavior.includes('transform successfully') ||
        c.expected_behavior.includes('parse successfully') ||
        c.expected_behavior.includes('trim all whitespace')
    );

    it.each(successCases)('$case_name succeeds', ({ order }) => {
      expect(() => transformOrder(order as never)).not.toThrow();
      const out = transformOrder(order as never);
      expect(out.items[0].weight.value).toBeGreaterThan(0);
    });

    it('Dimension String with Inconsistent Spacing parses 10 x8x 6', () => {
      const c = edge_cases.find((x) => x.case_name.includes('Inconsistent Spacing'))!;
      const out = transformOrder(c.order as never);
      expect(out.items[0].dimensions).toMatchObject({
        length: 10,
        width: 8,
        height: 6,
      });
    });

    it('Dimension String with Tabs parses', () => {
      const c = edge_cases.find((x) => x.case_name.includes('Tabs'))!;
      const out = transformOrder(c.order as never);
      expect(out.items[0].dimensions).toMatchObject({
        length: 10,
        width: 8,
        height: 6,
      });
    });

    it('Whitespace edge order trims orderNumber', () => {
      const c = edge_cases.find((x) => x.case_name.includes('Leading/Trailing'))!;
      const out = transformOrder(c.order as never);
      expect(out.external_order_id).toBe('ORD-EDGE-014');
    });
  });

  describe('validation errors (explicit messages)', () => {
    const base = {
      orderNumber: 'ORD-X',
      orderDate: '2026-01-15T10:00:00Z',
      customer: {
        custId: 'C1',
        fullName: 'Test',
        email: 'test@example.com',
        shippingAddr: {
          street1: '1 Main',
          city: 'City',
          state: 'CA',
          zip: '90001',
          country: 'US',
        },
      },
      items: [{ sku: 'S', description: 'D', qty: 1, weight_oz: 16, dims: '10x8x6' }],
      shipFromWarehouse: 'DC',
      requestedShipDate: '2026-01-16',
      serviceLevel: 'GROUND',
    };

    it('throws for missing orderNumber', () => {
      const { orderNumber: _n, ...rest } = base;
      expect(() => transformOrder(rest as never)).toThrow('Missing required field: orderNumber');
    });

    it('throws for empty items', () => {
      expect(() =>
        transformOrder({ ...base, items: [] } as never)
      ).toThrow('Order must have at least one item');
    });

    it('throws for negative quantity', () => {
      expect(() =>
        transformOrder({
          ...base,
          items: [{ ...base.items[0], qty: -1 }],
        } as never)
      ).toThrow('Quantity must be greater than 0');
    });

    it('throws for decimal quantity', () => {
      expect(() =>
        transformOrder({
          ...base,
          items: [{ ...base.items[0], qty: 1.5 }],
        } as never)
      ).toThrow('Quantity must be a whole number');
    });

    it('throws for zero weight', () => {
      expect(() =>
        transformOrder({
          ...base,
          items: [{ ...base.items[0], weight_oz: 0 }],
        } as never)
      ).toThrow('Weight must be greater than 0');
    });

    it('throws for invalid dimensions 10x8', () => {
      expect(() =>
        transformOrder({
          ...base,
          items: [{ ...base.items[0], dims: '10x8' }],
        } as never)
      ).toThrow('Invalid dimension format: must be LxWxH');
    });

    it('throws for axbxc dimensions', () => {
      expect(() =>
        transformOrder({
          ...base,
          items: [{ ...base.items[0], dims: 'axbxc' }],
        } as never)
      ).toThrow('Invalid dimension format: dimensions must be numbers');
    });

    it('throws for empty dims', () => {
      expect(() =>
        transformOrder({
          ...base,
          items: [{ ...base.items[0], dims: '   ' }],
        } as never)
      ).toThrow('Dimensions cannot be empty');
    });

    it('throws for invalid email', () => {
      expect(() =>
        transformOrder({
          ...base,
          customer: { ...base.customer, email: 'not-an-email' },
        } as never)
      ).toThrow('Invalid email format');
    });

    it('throws for invalid US postal code', () => {
      expect(() =>
        transformOrder({
          ...base,
          customer: {
            ...base.customer,
            shippingAddr: { ...base.customer.shippingAddr, zip: '1234' },
          },
        } as never)
      ).toThrow('Invalid postal code format for country US');
    });

    it('throws for invalid orderDate', () => {
      expect(() =>
        transformOrder({ ...base, orderDate: 'not-a-date' } as never)
      ).toThrow('Invalid orderDate');
    });

    it('throws for invalid requestedShipDate', () => {
      expect(() =>
        transformOrder({ ...base, requestedShipDate: '15-01-2026' } as never)
      ).toThrow('Invalid requestedShipDate');
    });

    it('allows non-2-char state outside US and CA', () => {
      expect(() =>
        transformOrder({
          ...base,
          customer: {
            ...base.customer,
            shippingAddr: {
              ...base.customer.shippingAddr,
              country: 'GB',
              state: 'England',
              zip: 'SW1A1AA',
            },
          },
        } as never)
      ).not.toThrow();
    });
  });
});

describe('convertOuncesToPounds', () => {
  it.each([
    [8, 0.5],
    [16, 1.0],
    [32, 2.0],
    [48, 3.0],
    [0.5, 0.03125],
  ])('%s oz -> %s lb', (oz, lb) => {
    expect(convertOuncesToPounds(oz)).toBeCloseTo(lb as number, 10);
  });
});

describe('parseDimensions', () => {
  it.each([
    ['10x8x6', { length: 10, width: 8, height: 6 }],
    ['10 x 8 x 6', { length: 10, width: 8, height: 6 }],
    ['10 x8x 6', { length: 10, width: 8, height: 6 }],
    ['12x10x8', { length: 12, width: 10, height: 8 }],
  ])('parses %s', (input, expected) => {
    expect(parseDimensions(input)).toMatchObject({ ...expected, unit: 'in' });
  });

  it('rejects zero dimension', () => {
    expect(() => parseDimensions('10x0x6')).toThrow('All dimensions must be greater than 0');
  });
});

describe('transformOrderBatch', () => {
  it('collects successes and failures without stopping', () => {
    const good = {
      orderNumber: 'G1',
      orderDate: '2026-01-15T10:00:00Z',
      customer: {
        custId: 'C',
        fullName: 'N',
        email: 'a@b.co',
        shippingAddr: {
          street1: '1',
          city: 'X',
          state: 'CA',
          zip: '90001',
          country: 'US',
        },
      },
      items: [{ sku: 'S', description: 'D', qty: 1, weight_oz: 16, dims: '10x8x6' }],
      shipFromWarehouse: 'DC',
      requestedShipDate: '2026-01-16',
      serviceLevel: 'GROUND',
    };
    const bad = { ...good, orderNumber: '', items: good.items };
    const result = transformOrderBatch([good as never, bad as never, good as never]);
    expect(result.successful).toHaveLength(2);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].error).toMatch(/orderNumber/i);
  });
});
