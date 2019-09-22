import { tsDoc } from '../src';

describe('tsDoc', () => {
  test('only exported function are included', () => {
    const output = tsDoc({
      files: ['../test-code/math.ts'],
    });

    const result = output[0];

    expect(result.items.length).toBe(2);
    const firstItem = result.items[0];
    expect(firstItem).toEqual({
      name: 'sum',
      typeString: '(a: number, ...numbers: number[]) => number',
      comments: ['Sum up a set of numbers'],
      params: [
        {
          name: 'a',
          description: '',
          type: 'number',
        },
        {
          name: 'numbers',
          description: 'numbers which you want to sum up',
          type: 'number[]',
        },
      ],
      returns: {
        type: 'number',
        description: 'sum of the numbers',
      },
      jsDocTags: [
        {
          name: 'param',
          text: 'a',
        },
        {
          name: 'param',
          text: 'numbers numbers which you want to sum up',
        },
        {
          name: 'returns',
          text: 'sum of the numbers',
        },
      ],
    });
  });

  test('excludes option can used to exclude some files', () => {
    const output = tsDoc({
      files: ['../test-code/x-entry.ts'],
      excludes: ['../**/*.excluded.ts'],
    });

    expect(output.length).toBe(2);
    expect(output.map(o => o.fileName)).toEqual([
      'x-dependent-included',
      'x-entry',
    ]);
    expect(output.map(o => o.relativePath)).toEqual([
      '../test-code/x-dependent-included',
      '../test-code/x-entry',
    ]);
  });

  test('dependent code also extracted', () => {
    const output = tsDoc({
      files: ['../test-code/entry.ts'],
    });

    expect(output.length).toEqual(2);
    expect(output.map(res => res.items.length)).toEqual([2, 1]);
  });

  test('private exports should be excluded', () => {
    const output = tsDoc({
      files: ['../test-code/utility.ts'],
    });

    const result = output[0];

    expect(result.items.length).toBe(2);
  });

  test('private exports can be exposed with correct flag', () => {
    const output = tsDoc({
      files: ['../test-code/utility.ts'],
      showPrivate: true,
    });

    const result = output[0];

    expect(result.items.length).toBe(3);
  });

  test('undocumented param will cause warning', () => {
    const spy = jest.spyOn(global.console, 'warn').mockImplementation(() => {});

    tsDoc({
      files: ['../test-code/shitty-code.ts'],
    });

    expect(spy).toHaveBeenCalledTimes(2);

    spy.mockRestore();
  });

  test('undocumented param warning can be suppressed', () => {
    const spy = jest.spyOn(global.console, 'warn');

    tsDoc({
      files: ['../test-code/shitty-code.ts'],
      warnIfParamMissingJsDoc: false,
    });

    expect(spy).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });
});
