"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertOuncesToPounds = convertOuncesToPounds;
exports.parseDimensions = parseDimensions;
const errors_1 = require("./errors");
const DIM_SPLIT = /\s*x\s*/i;
function convertOuncesToPounds(ounces) {
    return ounces / 16;
}
/**
 * Parses "LxWxH" with flexible whitespace around x (including tabs).
 */
function parseDimensions(dims) {
    const trimmed = dims.trim();
    if (trimmed.length === 0) {
        throw new errors_1.ValidationError('Dimensions cannot be empty');
    }
    const parts = trimmed.split(DIM_SPLIT);
    if (parts.length !== 3) {
        throw new errors_1.ValidationError('Invalid dimension format: must be LxWxH');
    }
    const length = Number(parts[0]);
    const width = Number(parts[1]);
    const height = Number(parts[2]);
    if (Number.isNaN(length) ||
        Number.isNaN(width) ||
        Number.isNaN(height) ||
        !Number.isFinite(length) ||
        !Number.isFinite(width) ||
        !Number.isFinite(height)) {
        throw new errors_1.ValidationError('Invalid dimension format: dimensions must be numbers');
    }
    if (length <= 0 || width <= 0 || height <= 0) {
        throw new errors_1.ValidationError('All dimensions must be greater than 0');
    }
    return { length, width, height, unit: 'in' };
}
//# sourceMappingURL=conversions.js.map