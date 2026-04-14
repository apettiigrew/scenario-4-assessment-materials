import { ValidationError } from './errors';
import { parseDimensions } from './conversions';
import type { CustomerOrder } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const US_ZIP = /^\d{5}(-\d{4})?$/;
const CA_ZIP = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const COUNTRY_CODE = /^[A-Za-z]{2}$/;

function assertPresent(value: unknown, field: string): void {
  if (value === undefined || value === null) {
    throw new ValidationError(`Missing required field: ${field}`);
  }
  if (typeof value === 'string' && value.length === 0) {
    throw new ValidationError(`Missing required field: ${field}`);
  }
}

function validateEmailWhenPresent(email: string | undefined): void {
  if (email === undefined || email.length === 0) {
    return;
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new ValidationError('Invalid email format');
  }
}

function validatePostalCode(zip: string, country: string): void {
  const c = country.toUpperCase();
  if (c === 'US') {
    if (!US_ZIP.test(zip)) {
      throw new ValidationError(
        'Invalid postal code format for country US'
      );
    }
    return;
  }
  if (c === 'CA') {
    const compact = zip.replace(/\s+/g, '');
    if (!CA_ZIP.test(compact) && !/^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/i.test(compact)) {
      throw new ValidationError(
        'Invalid postal code format for country CA'
      );
    }
    return;
  }
  if (zip.length === 0) {
    throw new ValidationError('Missing required field: customer.shippingAddr.zip');
  }
}

function validateOrderDate(orderDate: string): void {
  assertPresent(orderDate, 'orderDate');
  const t = Date.parse(orderDate);
  if (Number.isNaN(t)) {
    throw new ValidationError('Invalid orderDate: must be a valid ISO 8601 datetime');
  }
}

function validateRequestedShipDate(value: string): void {
  assertPresent(value, 'requestedShipDate');
  if (!ISO_DATE_ONLY.test(value)) {
    throw new ValidationError(
      'Invalid requestedShipDate: expected YYYY-MM-DD'
    );
  }
}

/**
 * Validates normalized customer order. Throws {@link ValidationError} on failure.
 */
export function validateOrder(order: CustomerOrder): void {
  assertPresent(order.orderNumber, 'orderNumber');
  assertPresent(order.orderDate, 'orderDate');
  validateOrderDate(order.orderDate);

  assertPresent(order.customer, 'customer');
  assertPresent(order.customer.custId, 'customer.custId');
  assertPresent(order.customer.fullName, 'customer.fullName');
  validateEmailWhenPresent(order.customer.email);

  assertPresent(order.customer.shippingAddr, 'customer.shippingAddr');
  const addr = order.customer.shippingAddr;
  assertPresent(addr.street1, 'customer.shippingAddr.street1');
  assertPresent(addr.city, 'customer.shippingAddr.city');
  assertPresent(addr.state, 'customer.shippingAddr.state');
  assertPresent(addr.zip, 'customer.shippingAddr.zip');
  assertPresent(addr.country, 'customer.shippingAddr.country');

  if (!COUNTRY_CODE.test(addr.country)) {
    throw new ValidationError('Invalid country: must be ISO 3166-1 alpha-2');
  }

  const countryUpper = addr.country.toUpperCase();
  if (countryUpper === 'US' || countryUpper === 'CA') {
    if (addr.state.length !== 2) {
      throw new ValidationError(
        'Invalid state: must be a 2-character code for US/CA addresses'
      );
    }
  }

  validatePostalCode(addr.zip, addr.country);

  assertPresent(order.items, 'items');
  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw new ValidationError('Order must have at least one item');
  }

  assertPresent(order.shipFromWarehouse, 'shipFromWarehouse');
  assertPresent(order.serviceLevel, 'serviceLevel');
  validateRequestedShipDate(order.requestedShipDate);

  if (order.orderNumber.length > 255) {
    throw new ValidationError('orderNumber exceeds maximum length of 255');
  }

  order.items.forEach((item, index) => {
    const prefix = `items[${index}]`;
    assertPresent(item.sku, `${prefix}.sku`);
    assertPresent(item.description, `${prefix}.description`);

    if (typeof item.qty !== 'number' || Number.isNaN(item.qty)) {
      throw new ValidationError(`${prefix}.qty must be a number`);
    }
    if (!Number.isInteger(item.qty)) {
      throw new ValidationError('Quantity must be a whole number');
    }
    if (item.qty <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    if (typeof item.weight_oz !== 'number' || Number.isNaN(item.weight_oz)) {
      throw new ValidationError(`${prefix}.weight_oz must be a number`);
    }
    if (item.weight_oz <= 0) {
      throw new ValidationError('Weight must be greater than 0');
    }

    if (item.dims === undefined || item.dims === null) {
      throw new ValidationError(`Missing required field: ${prefix}.dims`);
    }
    if (item.dims.trim().length === 0) {
      throw new ValidationError('Dimensions cannot be empty');
    }
    parseDimensions(item.dims);
  });
}
