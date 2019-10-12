# Pipeout

<img width="80" height="80" src="./assets/logo.png" alt="logo" align="right" />

A library for piping values through transformations, in a type-safe way.

[![npm package](https://img.shields.io/npm/v/pipeout.svg)](https://www.npmjs.com/package/pipeout)
[![codecov](https://codecov.io/gh/will-wow/pipeout/branch/master/graph/badge.svg)](https://codecov.io/gh/will-wow/pipeout)
[![David Dependency Status](https://david-dm.org/will-wow/pipeout.svg)](https://david-dm.org/will-wow/pipeout)

It's like `pipe` from lodash and Ramda, but with partial application for better type safety.

## Installation

```bash
npm i pipeout --save
# or
yarn add pipeout
```

```typescript
import { pipe, pipeA, piper, piperA } from "pipeout";
```

## Examples

### Synchronous

`pipe` and `piper` work with synchronous data (which is not wrapped in a promise).

Here's an example trying to find how many red marbles are in a list.

#### `pipe`

`pipe` is a basic pipe, like `|>` in Haskell or Elixir. The first value passed in is a value to transform. After that you can pass a series of transformer functions. Each one will transform the value returned from the previous function, and return function ready to be piped again.

When you want to extract the value, just use `.value`.

```typescript
import { pipe } from "pipeout";

const redCount = pipe(marbles)(filterReds)(getLength).value;
```

**Note**

Since `pipe` is a pretty common function name in libraries
([like RxJS](https://rxjs-dev.firebaseapp.com/api/index/function/pipe)),
`pipe` is aliased as `pip` for convenience.

```javascript
import { pip } from "pipeout";`
```

#### `piper`

`piper` is more like the `pipe` from Lodash or Ramda. It takes a series of transformer functions, but doesn't do any work until you call `.run` with a value. At that point the value is transformed through the series of registered transformers.

It's often useful to return `.run` without calling it. That will give you access to a function that can be run at a later time.

```typescript
import { piper } from "pipeout";

const redCounter = piper(filterReds)(getLength).run;
const redCount = redCounter(marbles);
```

### Asynchronous

There are also asynchronous variants, `pipeA` and `piperA`.
These will always result in a promise, and will work whether your values and functions are synchronous or asynchronous.

All transformer functions should take a value, and can return a value OR a promise.

The starting value can be a promise or a value.

For this example, we'll imagine that getting the user's marbles and getting the user's favorite color are asynchronous API operations.

#### `pipeA`

```typescript
import { pipeA } from "pipeout";

const redCount = await pipeA(user)(fetchMarbles)(filterWithAsyncColor)(
  getLength
).value;
```

#### `piper`

```typescript
import { piperA } from "pipeout";

const redCounter = piperA(fetchMarbles)(filterWithAsyncColor)(getLength);
const redCount = await redCounter.run(user);
```

## Contributing

```bash
yarn install
yarn test
yarn lint
yarn format
yarn build
```
