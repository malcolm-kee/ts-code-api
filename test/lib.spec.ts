import { isMatch } from '../src/lib';

test('isMatch', () => {
  expect(isMatch('src/lib/dom', ['src/lib/*'])).toBe(true);
  expect(isMatch('src/lib/dom.ts', ['**.ts'])).toBe(true);
  expect(isMatch('src/lib/dom.ts.js', ['**.ts'])).toBe(false);

  expect(isMatch('src/lib/dom.something.ts', ['**.something.ts'])).toBe(true);
});
