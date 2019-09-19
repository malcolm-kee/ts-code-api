import { xVillain } from './x-dependent.excluded';

export const xMan = (isXManWin: boolean) =>
  isXManWin ? console.log(`Heee Ya!!!`) : xVillain();

export { xWomen } from './x-dependent-included';

interface CreateXManOption {
  /** is this x-man strong */
  isStrong?: boolean;
}

export const createXMan = (options: CreateXManOption) => ({
  strong: options.isStrong,
  name: 'X-Man',
});
