import type { CustomerOrder } from './schema';
/**
 * Validates required OMS fields before normalization so nested missing objects are not masked.
 */
export declare function validateRequiredOrderFields(data: unknown): void;
/**
 * Parses and validates a normalized customer order. Throws {@link ValidationError} on failure.
 */
export declare function parseValidatedCustomerOrder(data: unknown): CustomerOrder;
/**
 * Validates a customer order end-to-end. Throws {@link ValidationError} on failure.
 */
export declare function validateOrder(order: CustomerOrder): void;
//# sourceMappingURL=validation.d.ts.map