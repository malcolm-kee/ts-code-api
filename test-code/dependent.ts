export type PowerOfTwo = 2 | 4 | 8 | 16 | 32 | 64;

/**
 *
 * @param x
 */
export const dependentExportedFunction = (x: number) => x * 2;

/**
 *
 * @param x
 */
export const dependentExportedFunctionTwo = (x: number) => Math.pow(x, 2);
