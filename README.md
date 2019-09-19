# ts-code-api

Extracting exported function definitions from typescript code

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
