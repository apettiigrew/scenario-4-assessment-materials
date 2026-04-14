"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequiredOrderFields = validateRequiredOrderFields;
exports.parseValidatedCustomerOrder = parseValidatedCustomerOrder;
exports.validateOrder = validateOrder;
const zod_1 = require("zod");
const errors_1 = require("./errors");
const normalize_1 = require("./normalize");
const schema_1 = require("./schema");
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function formatIssue(issue) {
    if (issue.code === 'invalid_type') {
        const received = issue.received;
        const fieldPath = issue.path.join('.');
        if (received === 'undefined' && fieldPath.length > 0) {
            return `Missing required field: ${fieldPath}`;
        }
    }
    return issue.message;
}
const requiredOrderFieldsSchema = zod_1.z.unknown().superRefine((data, ctx) => {
    if (!isPlainObject(data)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Invalid order: expected a non-null object',
        });
        return;
    }
    const requiredFields = ['orderNumber', 'orderDate', 'customer', 'items'];
    for (const field of requiredFields) {
        if (!(field in data) || data[field] === undefined || data[field] === null) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Missing required field: ${field}`,
                path: [field],
            });
        }
    }
    if (!isPlainObject(data.customer)) {
        return;
    }
    if (!('shippingAddr' in data.customer) ||
        data.customer.shippingAddr === undefined ||
        data.customer.shippingAddr === null ||
        !isPlainObject(data.customer.shippingAddr)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Missing required field: customer.shippingAddr',
            path: ['customer', 'shippingAddr'],
        });
    }
    if (!Array.isArray(data.items)) {
        return;
    }
    if (data.items.length === 0) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Order must have at least one item',
            path: ['items'],
        });
        return;
    }
    data.items.forEach((item, index) => {
        if (!isPlainObject(item)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Invalid items[${index}]: expected an object`,
                path: ['items', index],
            });
            return;
        }
        const prefix = `items[${index}]`;
        if (!('sku' in item) || item.sku === undefined || item.sku === null) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Missing required field: ${prefix}.sku`,
                path: ['items', index, 'sku'],
            });
        }
        const hasQuantity = ('qty' in item && item.qty !== undefined && item.qty !== null) ||
            ('quantity' in item && item.quantity !== undefined && item.quantity !== null);
        if (!hasQuantity) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Missing required field: ${prefix}.quantity`,
                path: ['items', index, 'quantity'],
            });
        }
        const hasWeight = ('weight_oz' in item && item.weight_oz !== undefined && item.weight_oz !== null) ||
            ('weight' in item && item.weight !== undefined && item.weight !== null);
        if (!hasWeight) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Missing required field: ${prefix}.weight`,
                path: ['items', index, 'weight'],
            });
        }
        const hasDimensions = ('dims' in item && item.dims !== undefined && item.dims !== null) ||
            ('dimensions' in item &&
                item.dimensions !== undefined &&
                item.dimensions !== null);
        if (!hasDimensions) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Missing required field: ${prefix}.dimensions`,
                path: ['items', index, 'dimensions'],
            });
        }
    });
});
/**
 * Validates required OMS fields before normalization so nested missing objects are not masked.
 */
function validateRequiredOrderFields(data) {
    const result = requiredOrderFieldsSchema.safeParse(data);
    if (!result.success) {
        throw new errors_1.ValidationError(formatIssue(result.error.issues[0]));
    }
}
/**
 * Parses and validates a normalized customer order. Throws {@link ValidationError} on failure.
 */
function parseValidatedCustomerOrder(data) {
    const result = schema_1.customerOrderSchema.safeParse(data);
    if (!result.success) {
        throw new errors_1.ValidationError(formatIssue(result.error.issues[0]));
    }
    return result.data;
}
/**
 * Validates a customer order end-to-end. Throws {@link ValidationError} on failure.
 */
function validateOrder(order) {
    validateRequiredOrderFields(order);
    parseValidatedCustomerOrder((0, normalize_1.normalizeCustomerOrder)(order));
}
//# sourceMappingURL=validation.js.map