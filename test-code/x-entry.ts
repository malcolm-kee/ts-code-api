import { xVillain } from './x-dependent.excluded';

/**
 * @param isXManWin
 */
export const xMan = (isXManWin: boolean) =>
  isXManWin ? console.log(`Heee Ya!!!`) : xVillain();

export { xWomen } from './x-dependent-included';

interface CreateXManOption {
  /** is this x-man strong */
  isStrong?: boolean;
}

/**
 * @param options
 */
export const createXMan = (options: CreateXManOption) => ({
  strong: options.isStrong,
  name: 'X-Man',
});
