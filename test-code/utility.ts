/**
 * Typeguard to assert a variable is not `undefined`.
 * @param value value that may be `undefined`
 */
export const isDefined = <T>(value: T | undefined): value is T =>
  typeof value !== 'undefined';

/**
 * @private
 * @param value value that you want to assert if it is string
 */
export const isString = (value: any): value is string =>
  typeof value === 'string';

/**
 * Create an array with the specified length, handy kickstart an array chains
 *
 * Examples:
 *
 * ```js
 * createEmptyArray(5).map((_, index) => index).forEach(num => console.log(num));)
 * ```
 *
 * @param length length of the array that you want to create
 * @returns an empty array with the specified length
 */
export function createEmptyArray(length: number) {
  if (Array.from) {
    return Array.from({ length });
  }

  const result = [];

  for (let index = 0; index < length; index++) {
    result.push(undefined);
  }

  return result;
}
