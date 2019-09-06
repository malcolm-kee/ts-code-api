import { isMatch } from '../src/lib';

test('isMatch', () => {
  expect(isMatch('src/lib/dom', ['src/lib/*'])).toBe(true);
});
