export type PowerOfTwo = 2 | 4 | 8 | 16 | 32 | 64;

export const dependentExportedFunction = (x: number) => x * 2;

export const dependentExportedFunctionTwo = (x: number) => Math.pow(x, 2);
