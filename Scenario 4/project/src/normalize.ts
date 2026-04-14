import type { CustomerOrder } from './types';

function trimString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

/**
 * Deep-trims all string fields so validation and mapping run on clean data.
 */
function optionalTrim(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const t = trimString(value);
  return t.length === 0 ? undefined : t;
}

export function normalizeCustomerOrder(raw: CustomerOrder): CustomerOrder {
  return {
    orderNumber: trimString(raw.orderNumber),
    orderDate: trimString(raw.orderDate),
    customer: {
      custId: trimString(raw.customer?.custId),
      fullName: trimString(raw.customer?.fullName),
      email: optionalTrim(raw.customer?.email),
      phone: optionalTrim(raw.customer?.phone),
      shippingAddr: {
        street1: trimString(raw.customer?.shippingAddr?.street1),
        street2: optionalTrim(raw.customer?.shippingAddr?.street2),
        city: trimString(raw.customer?.shippingAddr?.city),
        state: trimString(raw.customer?.shippingAddr?.state),
        zip: trimString(raw.customer?.shippingAddr?.zip),
        country: trimString(raw.customer?.shippingAddr?.country),
      },
    },
    items: (raw.items ?? []).map((item) => {
      const rawItem = item as Record<string, unknown>;
      const dimsValue = rawItem.dims ?? rawItem.dimensions;

      return {
        sku: trimString(rawItem.sku),
        description: trimString(rawItem.description),
        qty: (rawItem.qty ?? rawItem.quantity) as number,
        weight_oz: (rawItem.weight_oz ?? rawItem.weight) as number,
        dims: trimString(dimsValue),
        price: rawItem.price as number | undefined,
      };
    }),
    shipFromWarehouse: trimString(raw.shipFromWarehouse),
    requestedShipDate: trimString(raw.requestedShipDate),
    serviceLevel: trimString(raw.serviceLevel),
  };
}
