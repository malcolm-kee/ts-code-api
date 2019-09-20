# ts-code-api

[![version](https://img.shields.io/npm/v/ts-code-api.svg)](https://www.npmjs.com/package/ts-code-api) ![license](https://img.shields.io/npm/l/ts-code-api.svg)

Extract function definitions and JSDocs comments from typescript code to generate documentations.

## Installation

```bash
npm i -D ts-code-api
```

## How To

```js
const { tsDoc } = require('ts-code-api');

const output = tsDoc({
  files: ['src/index.ts'],
});

console.log(output);
```

## Supported Features

- [x] function
- [ ] interface
- [ ] class
