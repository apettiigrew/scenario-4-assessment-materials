import { ValidationError } from './errors';

const DIM_SPLIT = /\s*x\s*/i;

export function convertOuncesToPounds(ounces: number): number {
  return ounces / 16;
}

export interface ParsedDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'in';
}

/**
 * Parses "LxWxH" with flexible whitespace around x (including tabs).
 */
export function parseDimensions(dims: string): ParsedDimensions {
  const trimmed = dims.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('Dimensions cannot be empty');
  }

  const parts = trimmed.split(DIM_SPLIT);
  if (parts.length !== 3) {
    throw new ValidationError('Invalid dimension format: must be LxWxH');
  }

  const length = Number(parts[0]);
  const width = Number(parts[1]);
  const height = Number(parts[2]);

  if (
    Number.isNaN(length) ||
    Number.isNaN(width) ||
    Number.isNaN(height) ||
    !Number.isFinite(length) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    throw new ValidationError(
      'Invalid dimension format: dimensions must be numbers'
    );
  }

  if (length <= 0 || width <= 0 || height <= 0) {
    throw new ValidationError('All dimensions must be greater than 0');
  }

  return { length, width, height, unit: 'in' };
}
