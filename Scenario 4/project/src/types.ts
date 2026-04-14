/**
 * Customer OMS order (input). Some fields are optional in real payloads.
 */
export interface CustomerOrder {
  orderNumber: string;
  orderDate: string;
  customer: {
    custId: string;
    fullName: string;
    email?: string;
    phone?: string;
    shippingAddr: {
      street1: string;
      street2?: string;
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
    weight_oz: number;
    dims: string;
  }>;
  shipFromWarehouse: string;
  requestedShipDate: string;
  serviceLevel: string;
}

/**
 * Shipium API order payload (output).
 */
export interface ShipiumOrder {
  external_order_id: string;
  order_placed_ts: string;
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
      value: number;
      unit: 'lb';
    };
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: 'in';
    };
  }>;
  origin_address: {
    facility_alias: string;
  };
  ship_option: {
    service_level: string;
  };
}

export interface BatchResult {
  successful: ShipiumOrder[];
  failed: Array<{
    order: CustomerOrder;
    error: string;
  }>;
}
