export declare function convertOuncesToPounds(ounces: number): number;
export interface ParsedDimensions {
    length: number;
    width: number;
    height: number;
    unit: 'in';
}
/**
 * Parses "LxWxH" with flexible whitespace around x (including tabs).
 */
export declare function parseDimensions(dims: string): ParsedDimensions;
//# sourceMappingURL=conversions.d.ts.map