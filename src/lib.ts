import micromatch from 'micromatch';

export const isMatch = (path: string, patterns: string[]) =>
  micromatch.isMatch(path, patterns as any);
