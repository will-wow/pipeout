# Pipeout

<img width="80" height="80" src="./assets/logo.png" alt="logo" align="right" />

A library for piping values through transformations, in a type-safe way.

[![npm package](https://img.shields.io/npm/v/pipeout.svg)](https://www.npmjs.com/package/pipeout)
[![codecov](https://codecov.io/gh/will-wow/pipeout/branch/master/graph/badge.svg)](https://codecov.io/gh/will-wow/pipeout)
[![David Dependency Status](https://david-dm.org/will-wow/pipeout.svg)](https://david-dm.org/will-wow/pipeout)

It's like `pipe` from lodash and Ramda, but with partial application for better type safety. It also includes an asynchronous pipe function for dealing with promises.

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

// prettier-ignore
const redCount = await pipeA
  (user)
  (fetchMarbles)
  (filterWithAsyncColor)
  (getLength)
  .value;
```

#### `piper`

```typescript
import { piperA } from "pipeout";

// prettier-ignore
const redCounter = piperA
  (fetchMarbles)
  (filterWithAsyncColor)
  (getLength)
  .run;

const redCount = await redCounter(user);
```

## Formatting

JavaScript allows whitespace between a function and its arguments when calling it. That means that for a long pipeline you can put every function on its on line, like so:

```javascript
// prettier-ignore
const redCount = await pipeA
  (user)
  (fetchMarbles)
  (filterWithAsyncColor)
  (getLength)
  .value;
```

That's nicely readable, and a visually distinct pipeline. Unfortunately as the `// prettier-ignore` comment suggests, [prettier](https://prettier.io) will reformat that to this:

```javascript
const redCount = await pipeA(user)(fetchMarbles)(filterWithAsyncColor)(
  getLength
).value;
```

That's not great. At some point custom eslint rule might be able to solve this problem. In the meantime, if you use prettier, adding `// prettier-ignore` above long pipelines is a good idea.

## Why another pipe function?

In JavaScript, the traditional `pipe` function in a variadic function that takes any number of unary transformer functions, and returns a function that pipes a value through each transformer.

It usually looks a little like this:

```javascript
pipe(
  a,
  b,
  c
)(value);
```

That works pretty well! But creating TypeScript typings for it is a pain, as you have to declare a separate overload for every possible arity, like these [Ramda types]():

```typescript
pipe<T1>(fn0: () => T1): () => T1;
pipe<V0, T1>(fn0: (x0: V0) => T1): (x0: V0) => T1;
pipe<V0, V1, T1>(fn0: (x0: V0, x1: V1) => T1): (x0: V0, x1: V1) => T1;
pipe<V0, V1, V2, T1>(fn0: (x0: V0, x1: V1, x2: V2) => T1): (x0: V0, x1: V1, x2: V2) => T1;
...
```

What a pain to maintain! Pipeout takes a different approach. `pipe` is mostly useful for curried functions - so why not curry `pipe` itself? `pipeout.piper` is a recursive curried function. It takes a single function, and returns a version of `piper` that already has the first function in memory. So you can keep calling that function, passing in more transformers. When you're done setting up functions, you call `.run` with an argument, and it passing your value through all the functions.

It looks like this:
That means we can write pipelines like this:

```javascript
piper(a)(b)(c).run(value);
```

And this type can handle as many transformer functions as you want:

```typescript
export interface Piper<T, U> {
  <V>(transformer: (u: U) => V): Piper<T, V>;
  run: (value: T) => U;
}
```

That keeps the types simple for maintainers, and is conceptually satisfying - the type returned at any point in the pipeline is just `Piper<T, U>`, where `T` in the value is pass in, and `U` is the value that will come out if you call `.run`, or that the next transformer should take as an argument. All the intermediate transformations aren't relevant, so they don't have to show up in the type. Simple!

## Contributing

```bash
yarn install
yarn test
yarn lint
yarn format
yarn build
```
