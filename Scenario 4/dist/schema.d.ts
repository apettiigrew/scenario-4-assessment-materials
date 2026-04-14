import { z } from 'zod';
export declare const customerOrderSchema: z.ZodEffects<z.ZodObject<{
    orderNumber: z.ZodEffects<z.ZodString, string, string>;
    orderDate: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    customer: z.ZodEffects<z.ZodObject<{
        custId: z.ZodEffects<z.ZodString, string, string>;
        fullName: z.ZodEffects<z.ZodString, string, string>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        shippingAddr: z.ZodEffects<z.ZodObject<{
            street1: z.ZodEffects<z.ZodString, string, string>;
            street2: z.ZodOptional<z.ZodString>;
            city: z.ZodEffects<z.ZodString, string, string>;
            state: z.ZodEffects<z.ZodString, string, string>;
            zip: z.ZodString;
            country: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        }, {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        }>, {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        }, {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        custId: string;
        fullName: string;
        shippingAddr: {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        };
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        custId: string;
        fullName: string;
        shippingAddr: {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        };
        email?: string | undefined;
        phone?: string | undefined;
    }>, {
        custId: string;
        fullName: string;
        shippingAddr: {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        };
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        custId: string;
        fullName: string;
        shippingAddr: {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        };
        email?: string | undefined;
        phone?: string | undefined;
    }>;
    items: z.ZodArray<z.ZodObject<{
        sku: z.ZodString;
        description: z.ZodString;
        qty: z.ZodNumber;
        weight_oz: z.ZodNumber;
        dims: z.ZodString;
        price: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        sku: string;
        description: string;
        qty: number;
        weight_oz: number;
        dims: string;
        price?: number | undefined;
    }, {
        sku: string;
        description: string;
        qty: number;
        weight_oz: number;
        dims: string;
        price?: number | undefined;
    }>, "many">;
    shipFromWarehouse: z.ZodEffects<z.ZodString, string, string>;
    serviceLevel: z.ZodEffects<z.ZodString, string, string>;
    requestedShipDate: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
}, "strip", z.ZodTypeAny, {
    orderNumber: string;
    orderDate: string;
    customer: {
        custId: string;
        fullName: string;
        shippingAddr: {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        };
        email?: string | undefined;
        phone?: string | undefined;
    };
    items: {
        sku: string;
        description: string;
        qty: number;
        weight_oz: number;
        dims: string;
        price?: number | undefined;
    }[];
    shipFromWarehouse: string;
    serviceLevel: string;
    requestedShipDate: string;
}, {
    orderNumber: string;
    orderDate: string;
    customer: {
        custId: string;
        fullName: string;
        shippingAddr: {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        };
        email?: string | undefined;
        phone?: string | undefined;
    };
    items: {
        sku: string;
        description: string;
        qty: number;
        weight_oz: number;
        dims: string;
        price?: number | undefined;
    }[];
    shipFromWarehouse: string;
    serviceLevel: string;
    requestedShipDate: string;
}>, {
    orderNumber: string;
    orderDate: string;
    customer: {
        custId: string;
        fullName: string;
        shippingAddr: {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        };
        email?: string | undefined;
        phone?: string | undefined;
    };
    items: {
        sku: string;
        description: string;
        qty: number;
        weight_oz: number;
        dims: string;
        price?: number | undefined;
    }[];
    shipFromWarehouse: string;
    serviceLevel: string;
    requestedShipDate: string;
}, {
    orderNumber: string;
    orderDate: string;
    customer: {
        custId: string;
        fullName: string;
        shippingAddr: {
            street1: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            street2?: string | undefined;
        };
        email?: string | undefined;
        phone?: string | undefined;
    };
    items: {
        sku: string;
        description: string;
        qty: number;
        weight_oz: number;
        dims: string;
        price?: number | undefined;
    }[];
    shipFromWarehouse: string;
    serviceLevel: string;
    requestedShipDate: string;
}>;
export type CustomerOrder = z.infer<typeof customerOrderSchema>;
//# sourceMappingURL=schema.d.ts.map