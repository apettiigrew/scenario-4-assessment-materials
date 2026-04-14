import type { CustomerOrder } from './schema';
export type { CustomerOrder } from './schema';
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
//# sourceMappingURL=types.d.ts.map