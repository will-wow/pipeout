export type PossiblePromise<T> = T | Promise<T>;
export type Unary<In, Out> = (x: In) => Out;
export type AsyncUnary<In, Out> = (x: In) => PossiblePromise<Out>;

export interface Pipe<T> {
  <U>(transformer: Unary<T, U>): Pipe<U>;
  value: T;
}

export interface PipeA<T> {
  <U>(transformer: AsyncUnary<T, U>): PipeA<U>;
  value: Promise<T>;
}

export interface Piper<T, U> {
  <V>(transformer: Unary<U, V>): Piper<T, V>;
  run: (value: T) => U;
}

export interface PiperA<T, U> {
  <V>(transformer: AsyncUnary<U, V>): PiperA<T, V>;
  run: (value: PossiblePromise<T>) => Promise<U>;
}

/**
 * Pipe a value through a series of transformers.
 * @param value - The value to send through the pipeline.
 * @returns nextPipe - Pass a transformer to pipe again. Or, use .value to get the transformed value.
 */
export function pipe<T>(value: T): Pipe<T> {
  function nextPipe<U>(transformer: Unary<T, U>) {
    return pipe<U>(transformer(value));
  }
  nextPipe.value = value;
  return nextPipe;
}

export { pipe as pip };

/**
 * Pipe a value through a series of transformers,
 * where the value can be a promise and transformers can return promises.
 * @param value - The value to send through the pipeline.
 * @returns nextPipe - Pass a transformer to pipe again. Or, use .value to get the transformed value.
 */
export function pipeA<T>(value: PossiblePromise<T>): PipeA<T> {
  function nextPipe<U>(transformer: AsyncUnary<T, U>) {
    return pipeA(Promise.resolve(value).then(transformer));
  }
  nextPipe.value = Promise.resolve(value);
  return nextPipe;
}

/**
 * Create a series of transformers to pipe a value through.
 * @param transformer - A function that transforms the value.
 * @returns nextPipe - Pass a transformer to pipe again. Or, call .run to run the transforms.
 */
export function piper<T, U>(transformer: Unary<T, U>): Piper<T, U> {
  function nextPipe<V>(nextTransformer: Unary<U, V>) {
    return piper<T, V>(function(value: T) {
      return nextTransformer(transformer(value));
    });
  }
  nextPipe.run = (value: T) => transformer(value);
  return nextPipe;
}

/**
 * Create a series of transformers to pipe a value through,
 * where the value can be a promise and transformers can return promises.
 * @param transformer - A function that transforms the value.
 * @returns nextPipe - Pass a transformer to pipe again. Or, call .run to run the transforms.
 */
export function piperA<T, U>(transformer: AsyncUnary<T, U>): PiperA<T, U> {
  function nextPipe<V>(nextTransformer: AsyncUnary<U, V>) {
    return piperA(async function(valuePromise: PossiblePromise<T>): Promise<V> {
      const value = await valuePromise;
      const next = await transformer(value);
      return nextTransformer(next);
    });
  }
  nextPipe.run = async function(value: PossiblePromise<T>) {
    return transformer(await value);
  };
  return nextPipe;
}
