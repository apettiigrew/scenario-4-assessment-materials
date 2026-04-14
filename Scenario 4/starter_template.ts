/**
 * Order Transformation Service - Starter Template
 * 
 * This is an optional starter template. You can:
 * - Use this as a starting point
 * - Modify it as needed
 * - Start from scratch with your own structure
 * 
 * Feel free to reorganize, rename, or rewrite anything here.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Customer OMS Order Format (Input)
 */
interface CustomerOrder {
  orderNumber: string;
  orderDate: string;
  customer: {
    custId: string;
    fullName: string;
    email: string;
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
    dims: string; // Format: "LxWxH"
  }>;
  shipFromWarehouse: string;
  requestedShipDate: string;
  serviceLevel: string;
}

/**
 * Shipium API Order Format (Output)
 */
interface ShipiumOrder {
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

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Custom error for validation failures
 */
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates the customer order before transformation
 * @throws {ValidationError} If validation fails
 */
function validateOrder(order: CustomerOrder): void {
  // TODO: Implement validation
  // - Check required fields
  // - Validate data formats
  // - Check business logic constraints
  
  throw new Error('Not implemented');
}

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Converts weight from ounces to pounds
 * @param ounces Weight in ounces
 * @returns Weight in pounds
 */
function convertOuncesToPounds(ounces: number): number {
  // TODO: Implement conversion
  // Formula: pounds = ounces / 16
  
  throw new Error('Not implemented');
}

/**
 * Parses dimension string into structured object
 * @param dims Dimension string in format "LxWxH"
 * @returns Structured dimensions object
 */
function parseDimensions(dims: string): {
  length: number;
  width: number;
  height: number;
  unit: "in";
} {
  // TODO: Implement dimension parsing
  // - Handle spaces around 'x'
  // - Validate format
  // - Validate positive numbers
  
  throw new Error('Not implemented');
}

// ============================================================================
// MAIN TRANSFORMATION
// ============================================================================

/**
 * Transforms a customer order to Shipium API format
 * @param customerOrder Order in customer OMS format
 * @returns Order in Shipium API format
 * @throws {ValidationError} If order data is invalid
 */
export function transformOrder(customerOrder: CustomerOrder): ShipiumOrder {
  // TODO: Implement transformation
  
  // Step 1: Validate input
  validateOrder(customerOrder);
  
  // Step 2: Transform fields
  const shipiumOrder: ShipiumOrder = {
    // Map fields from customerOrder to ShipiumOrder format
    external_order_id: '', // TODO
    order_placed_ts: '', // TODO
    destination_address: {
      name: '', // TODO
      street1: '', // TODO
      // street2: '', // TODO: Handle optional field
      city: '', // TODO
      state: '', // TODO
      postal_code: '', // TODO
      country: '', // TODO
    },
    items: [], // TODO: Transform items array
    origin_address: {
      facility_alias: '', // TODO
    },
    ship_option: {
      service_level: '', // TODO
    },
  };
  
  return shipiumOrder;
}

// ============================================================================
// BONUS: BATCH PROCESSING
// ============================================================================

interface BatchResult {
  successful: ShipiumOrder[];
  failed: Array<{
    order: CustomerOrder;
    error: string;
  }>;
}

/**
 * Transforms multiple orders, collecting successes and failures
 * @param orders Array of customer orders
 * @returns Object with successful and failed transformations
 */
export function transformOrderBatch(orders: CustomerOrder[]): BatchResult {
  // TODO: Implement batch processing (bonus)
  
  throw new Error('Not implemented');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Add any additional helper functions here

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  CustomerOrder,
  ShipiumOrder,
  BatchResult,
};

export {
  ValidationError,
  convertOuncesToPounds,
  parseDimensions,
  validateOrder,
};
