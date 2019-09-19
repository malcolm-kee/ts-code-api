import micromatch from 'micromatch';

export const isDefined = <T>(x: T | undefined): x is T =>
  typeof x !== 'undefined';

export const isMatch = (path: string, patterns: string[]) => {
  const result = micromatch.isMatch(path, patterns as any);
  return result;
};
