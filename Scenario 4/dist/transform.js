"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformOrders = void 0;
exports.transformOrder = transformOrder;
exports.transformOrderBatch = transformOrderBatch;
const conversions_1 = require("./conversions");
const errors_1 = require("./errors");
const normalize_1 = require("./normalize");
const validation_1 = require("./validation");
function buildDestinationAddress(order) {
    const address = order.customer.shippingAddr;
    const base = {
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
function mapItems(order) {
    return order.items.map((item) => {
        const dims = (0, conversions_1.parseDimensions)(item.dims);
        return {
            external_line_item_id: item.sku,
            description: item.description,
            quantity: item.qty,
            weight: {
                value: (0, conversions_1.convertOuncesToPounds)(item.weight_oz),
                unit: 'lb',
            },
            dimensions: dims,
        };
    });
}
/**
 * Converts a single customer OMS order into Shipium API format.
 */
function transformOrder(customerOrder) {
    (0, validation_1.validateRequiredOrderFields)(customerOrder);
    const normalized = (0, normalize_1.normalizeCustomerOrder)(customerOrder);
    const order = (0, validation_1.parseValidatedCustomerOrder)(normalized);
    return {
        external_order_id: order.orderNumber,
        order_placed_ts: order.orderDate,
        destination_address: buildDestinationAddress(order),
        items: mapItems(order),
        origin_address: {
            facility_alias: order.shipFromWarehouse,
        },
        ship_option: {
            service_level: order.serviceLevel,
        },
    };
}
/**
 * Batch transform: continues on errors and returns successes and failures.
 */
function transformOrderBatch(orders) {
    const successful = [];
    const failed = [];
    for (const order of orders) {
        try {
            successful.push(transformOrder(order));
        }
        catch (e) {
            const message = e instanceof errors_1.ValidationError
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
exports.transformOrders = transformOrderBatch;
//# sourceMappingURL=transform.js.map