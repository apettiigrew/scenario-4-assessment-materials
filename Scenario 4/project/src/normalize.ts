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
    items: (raw.items ?? []).map((item) => ({
      sku: trimString(item?.sku),
      description: trimString(item?.description),
      qty: item?.qty as number,
      weight_oz: item?.weight_oz as number,
      dims: trimString(item?.dims),
    })),
    shipFromWarehouse: trimString(raw.shipFromWarehouse),
    requestedShipDate: trimString(raw.requestedShipDate),
    serviceLevel: trimString(raw.serviceLevel),
  };
}
