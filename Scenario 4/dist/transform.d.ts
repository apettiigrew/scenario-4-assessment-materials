import type { BatchResult, CustomerOrder, ShipiumOrder } from './types';
/**
 * Converts a single customer OMS order into Shipium API format.
 */
export declare function transformOrder(customerOrder: CustomerOrder): ShipiumOrder;
/**
 * Batch transform: continues on errors and returns successes and failures.
 */
export declare function transformOrderBatch(orders: CustomerOrder[]): BatchResult;
/** Alias for assessment wording (`transformOrders`). */
export declare const transformOrders: typeof transformOrderBatch;
//# sourceMappingURL=transform.d.ts.map