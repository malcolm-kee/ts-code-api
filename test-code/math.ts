export type FirstThreePrimeNumbers = 2 | 3 | 5;

/**
 * Add two numbers
 * @param a first number
 * @param b second number
 */
const add = (a: number, b: number) => a + b;

/**
 * Sum up a set of numbers
 * @param a
 * @param numbers numbers which you want to sum up
 * @returns sum of the numbers
 */
export const sum = (a: number, ...numbers: number[]) => numbers.reduce(add, a);

/**
 * Get the maximum number among a set of numbers
 * @param numbers all numbers which you want to find the max
 * @returns the highest number among the `numbers`
 */
export const max = (...numbers: number[]) => Math.max(...numbers);
