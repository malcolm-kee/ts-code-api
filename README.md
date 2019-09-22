# ts-code-api

[![version](https://img.shields.io/npm/v/ts-code-api.svg)](https://www.npmjs.com/package/ts-code-api) ![license](https://img.shields.io/npm/l/ts-code-api.svg)

Extract function and constants definitions with JSDocs comments from typescript code to a JavaScript object. You can then use this object generate documentations with your favorite template engine.

> If you want to output markdown, generate HTML then use converter library (e.g. [turndown](https://github.com/domchristie/turndown)) to convert them to markdown files.

## Installation

```bash
npm i -D ts-code-api
```

## Usage

Assuming that you have following typescript code:

```ts
// src/helper.ts
const add = (a: number, b: number) => a + b;

/**
 * Sum up a set of numbers
 * @param numbers numbers which you want to sum up
 * @returns sum of the numbers
 */
export const sum = (a: number, ...numbers: number[]) => numbers.reduce(add, a);

/**
 * Some magic number
 */
export const MAGIC_NUMBER: number = 89757;
```

Using this library:

```js
// your NodeJS script
const { tsDoc } = require('ts-code-api');

const output = tsDoc({
  files: ['src/helper.ts'],
});

console.log(output);
```

The output will be:

```json
[
  {
    "fileName": "helper",
    "items": [
      {
        "isFunction": true,
        "name": "sum",
        "typeString": "(a: number, ...numbers: number[]) => number",
        "comments": ["Sum up a set of numbers"],
        "params": [
          {
            "name": "a",
            "type": "number"
          },
          {
            "name": "numbers",
            "description": "numbers which you want to sum up",
            "type": "number[]"
          }
        ],
        "returns": {
          "type": "number",
          "description": "sum of the numbers"
        },
        "jsDocTags": [
          {
            "name": "param",
            "text": "numbers numbers which you want to sum up"
          },
          {
            "name": "returns",
            "text": "sum of the numbers"
          }
        ]
      },
      {
        "isFunction": false,
        "name": "MAGIC_NUMBER",
        "typeString": "number",
        "comments": ["Some magic number"],
        "jsDocTags": []
      }
    ]
  }
]
```

## Options

`tsDoc` accepts an options object as parameter. The options are:

- files (`string[]`, required): relative paths to files which you want to extract the typescript definitions. Note that you only need to provide the entries files; imported modules will automatically included.
- excludes (`string[]`, optional): pattern to exclude specific files. Example: `**/*.tsx`
- showPrivate (`boolean`, optional): make members tagged with `@private` to be exported. Default to `false`.
- warnIfParamMissingJsDoc (`boolean`, optional): warn if function parameter could not find is associated jsdoc comment. Default to `true`.

## Supported Features

Currently this library only supports function and constants. Many Typescript constructs (e.g. `type` and `interface`) are not supported intentionally because your JavaScript library documentation should not requires Typescript knowledge. `class` definition is currently not supported as I do not have use case of that; I seldom code in OOP.

- [x] function
- [x] constants
- [ ] class

## Comparisons with other libraries

[typedoc](https://typedoc.org/) is handy if you want a standardized format of Typescript documentation, but it doesn't allows you to easily extract the metadata and use your own rendering logic.

[api-extractor](https://api-extractor.com/) seems like allow you to do what this library does too, but it has higher learning curve.
