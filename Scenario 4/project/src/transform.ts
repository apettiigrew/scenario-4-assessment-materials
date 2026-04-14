import { convertOuncesToPounds, parseDimensions } from './conversions';
import { ValidationError } from './errors';
import { normalizeCustomerOrder } from './normalize';
import type { BatchResult, CustomerOrder, ShipiumOrder } from './types';
import { validateOrder } from './validation';

function buildDestinationAddress(order: CustomerOrder): ShipiumOrder['destination_address'] {
  const address = order.customer.shippingAddr;
  const base: ShipiumOrder['destination_address'] = {
    name: order.customer.fullName,
    street1: address.street1,
    city: address.city,
    state: address.state.toUpperCase(),
    postal_code: address.zip,
    country: address.country.toUpperCase(),
  };
  if (address.street2 !== undefined && address.street2.length > 0) {
    base.street2 = address.street2;
  }
  return base;
}

function mapItems(order: CustomerOrder): ShipiumOrder['items'] {
  return order.items.map((item) => {
    const dims = parseDimensions(item.dims);
    return {
      external_line_item_id: item.sku,
      description: item.description,
      quantity: item.qty,
      weight: {
        value: convertOuncesToPounds(item.weight_oz),
        unit: 'lb' as const,
      },
      dimensions: dims,
    };
  });
}

/**
 * Converts a single customer OMS order into Shipium API format.
 */
export function transformOrder(customerOrder: CustomerOrder): ShipiumOrder {
  const normalized = normalizeCustomerOrder(customerOrder);
  validateOrder(normalized);

  return {
    external_order_id: normalized.orderNumber,
    order_placed_ts: normalized.orderDate,
    destination_address: buildDestinationAddress(normalized),
    items: mapItems(normalized),
    origin_address: {
      facility_alias: normalized.shipFromWarehouse,
    },
    ship_option: {
      service_level: normalized.serviceLevel,
    },
  };
}

/**
 * Batch transform: continues on errors and returns successes and failures.
 */
export function transformOrderBatch(orders: CustomerOrder[]): BatchResult {
  const successful: ShipiumOrder[] = [];
  const failed: BatchResult['failed'] = [];

  for (const order of orders) {
    try {
      successful.push(transformOrder(order));
    } catch (e) {
      const message =
        e instanceof ValidationError
          ? e.message
          : e instanceof Error
            ? e.message
            : String(e);
      failed.push({ order, error: message });
    }
  }

  return { successful, failed };
}

/** Alias for assessment wording (`transformOrders`). */
export const transformOrders = transformOrderBatch;
