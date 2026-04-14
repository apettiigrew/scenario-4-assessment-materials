"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerOrderSchema = void 0;
const zod_1 = require("zod");
const conversions_1 = require("./conversions");
const errors_1 = require("./errors");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_ALLOWED_CHARS = /^\+?[0-9().\-\s]+$/;
const US_ZIP = /^\d{5}(-\d{4})?$/;
const CA_ZIP = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const COUNTRY_CODE = /^[A-Za-z]{2}$/;
function nonemptyField(fieldPath) {
    return zod_1.z.string().refine((s) => s.length > 0, {
        message: `Missing required field: ${fieldPath}`,
    });
}
function postalCodeError(zip, country) {
    const c = country.toUpperCase();
    if (c === 'US') {
        if (!US_ZIP.test(zip)) {
            return 'Invalid postal code format for country US';
        }
        return null;
    }
    if (c === 'CA') {
        const compact = zip.replace(/\s+/g, '');
        if (!CA_ZIP.test(compact) &&
            !/^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/i.test(compact)) {
            return 'Invalid postal code format for country CA';
        }
        return null;
    }
    if (zip.length === 0) {
        return 'Missing required field: customer.shippingAddr.zip';
    }
    return null;
}
function isValidPhoneNumber(phone) {
    if (!PHONE_ALLOWED_CHARS.test(phone)) {
        return false;
    }
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
}
const shippingAddrSchema = zod_1.z
    .object({
    street1: nonemptyField('customer.shippingAddr.street1'),
    street2: zod_1.z.string().optional(),
    city: nonemptyField('customer.shippingAddr.city'),
    state: nonemptyField('customer.shippingAddr.state'),
    zip: zod_1.z.string(),
    country: nonemptyField('customer.shippingAddr.country'),
})
    .superRefine((addr, ctx) => {
    if (!COUNTRY_CODE.test(addr.country)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Invalid country: must be ISO 3166-1 alpha-2',
            path: ['country'],
        });
        return;
    }
    const countryUpper = addr.country.toUpperCase();
    if (countryUpper === 'US' || countryUpper === 'CA') {
        if (addr.state.length !== 2) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Invalid state: must be a 2-character code for US/CA addresses',
                path: ['state'],
            });
        }
    }
    const postalErr = postalCodeError(addr.zip, addr.country);
    if (postalErr) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: postalErr,
            path: ['zip'],
        });
    }
});
const customerSchema = zod_1.z
    .object({
    custId: nonemptyField('customer.custId'),
    fullName: nonemptyField('customer.fullName'),
    email: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    shippingAddr: shippingAddrSchema,
})
    .superRefine((c, ctx) => {
    if (c.email !== undefined &&
        c.email.length > 0 &&
        !EMAIL_PATTERN.test(c.email)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Invalid email format',
            path: ['email'],
        });
    }
    if (c.phone !== undefined &&
        c.phone.length > 0 &&
        !isValidPhoneNumber(c.phone)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Invalid phone format',
            path: ['phone'],
        });
    }
});
const orderItemSchema = zod_1.z.object({
    sku: zod_1.z.string(),
    description: zod_1.z.string(),
    qty: zod_1.z.number(),
    weight_oz: zod_1.z.number(),
    dims: zod_1.z.string(),
    price: zod_1.z.number().optional(),
});
exports.customerOrderSchema = zod_1.z
    .object({
    orderNumber: nonemptyField('orderNumber'),
    orderDate: nonemptyField('orderDate').refine((s) => !Number.isNaN(Date.parse(s)), {
        message: 'Invalid orderDate: must be a valid ISO 8601 datetime',
    }),
    customer: customerSchema,
    items: zod_1.z.array(orderItemSchema).min(1, {
        message: 'Order must have at least one item',
    }),
    shipFromWarehouse: nonemptyField('shipFromWarehouse'),
    serviceLevel: nonemptyField('serviceLevel'),
    requestedShipDate: zod_1.z
        .string()
        .refine((s) => s.length > 0, {
        message: 'Missing required field: requestedShipDate',
    })
        .refine((s) => ISO_DATE_ONLY.test(s), {
        message: 'Invalid requestedShipDate: expected YYYY-MM-DD',
    }),
})
    .superRefine((order, ctx) => {
    if (order.orderNumber.length > 255) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'orderNumber exceeds maximum length of 255',
            path: ['orderNumber'],
        });
    }
    order.items.forEach((item, index) => {
        const prefix = `items[${index}]`;
        if (item.sku.length === 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Missing required field: ${prefix}.sku`,
                path: ['items', index, 'sku'],
            });
        }
        if (item.description.length === 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Missing required field: ${prefix}.description`,
                path: ['items', index, 'description'],
            });
        }
        if (typeof item.qty !== 'number' || Number.isNaN(item.qty)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `${prefix}.quantity must be a number`,
                path: ['items', index, 'qty'],
            });
        }
        else {
            if (!Number.isInteger(item.qty)) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: 'Quantity must be a whole number',
                    path: ['items', index, 'qty'],
                });
            }
            else if (item.qty <= 0) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: 'Quantity must be greater than 0',
                    path: ['items', index, 'qty'],
                });
            }
        }
        if (typeof item.weight_oz !== 'number' || Number.isNaN(item.weight_oz)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `${prefix}.weight must be a number`,
                path: ['items', index, 'weight_oz'],
            });
        }
        else if (item.weight_oz <= 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Weight must be greater than 0',
                path: ['items', index, 'weight_oz'],
            });
        }
        if (item.dims === undefined || item.dims === null) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Missing required field: ${prefix}.dimensions`,
                path: ['items', index, 'dims'],
            });
        }
        else if (item.dims.trim().length === 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Dimensions cannot be empty',
                path: ['items', index, 'dims'],
            });
        }
        else {
            try {
                (0, conversions_1.parseDimensions)(item.dims);
            }
            catch (e) {
                const msg = e instanceof errors_1.ValidationError
                    ? e.message
                    : e instanceof Error
                        ? e.message
                        : 'Invalid dimension format';
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: msg,
                    path: ['items', index, 'dims'],
                });
            }
        }
        if (item.price !== undefined) {
            if (typeof item.price !== 'number' || Number.isNaN(item.price)) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `${prefix}.price must be a number`,
                    path: ['items', index, 'price'],
                });
            }
            else if (item.price < 0) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: 'Price must be greater than or equal to 0',
                    path: ['items', index, 'price'],
                });
            }
        }
    });
});
//# sourceMappingURL=schema.js.map