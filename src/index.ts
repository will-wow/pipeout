export type PossiblePromise<T> = T | Promise<T>;
export type Unary<In, Out> = (x: In) => Out;
export type AsyncUnary<In, Out> = (x: In) => PossiblePromise<Out>;

export interface Pipe<T> {
  thru: <U>(transformer: Unary<T, U>) => Pipe<U>;
  value: () => T;
}

export interface PipeA<T> {
  thru: <U>(transformer: AsyncUnary<T, U>) => PipeA<U>;
  value: () => Promise<T>;
}

export interface Piper<T, U> {
  thru: <V>(transformer: Unary<U, V>) => Piper<T, V>;
  run: (value: T) => U;
}

export interface PiperA<T, U> {
  thru: <V>(transformer: AsyncUnary<U, V>) => PiperA<T, V>;
  run: (value: PossiblePromise<T>) => Promise<U>;
}

/**
 * Pipe a value through a series of transformers.
 * @param value - The value to send through the pipeline.
 * @returns nextPipe - Pass a transformer to pipe again. Or, use .value to get the transformed value.
 */
export function pipe<T>(value: T): Pipe<T> {
  function nextPipe<U>(transformer: Unary<T, U>): Pipe<U> {
    return pipe<U>(transformer(value));
  }

  return {
    value: () => value,
    thru: nextPipe
  };
}

export { pipe as pip };

/**
 * Pipe a value through a series of transformers,
 * where the value can be a promise and transformers can return promises.
 * @param value - The value to send through the pipeline.
 * @returns nextPipe - Pass a transformer to pipe again. Or, use .value to get the transformed value.
 */
export function pipeA<T>(value: PossiblePromise<T>): PipeA<T> {
  function nextPipe<U>(transformer: AsyncUnary<T, U>): PipeA<U> {
    return pipeA(Promise.resolve(value).then(transformer));
  }

  return {
    value: () => Promise.resolve(value),
    thru: nextPipe
  };
}

function _piper<T, U>(transformer: Unary<T, U>): Piper<T, U> {
  function nextPipe<V>(nextTransformer: Unary<U, V>): Piper<T, V> {
    return _piper<T, V>(function(value: T) {
      return nextTransformer(transformer(value));
    });
  }

  function run(value: T) {
    return transformer(value);
  }

  return {
    run,
    thru: nextPipe
  };
}

/**
 * Create a series of transformers to pipe a value through.
 * @param transformer - A function that transforms the value.
 * @returns nextPipe - Pass a transformer to pipe again. Or, call .run to run the transforms.
 */

export const piper = {
  thru: _piper
};

function _piperA<T, U>(transformer: AsyncUnary<T, U>): PiperA<T, U> {
  function nextPipe<V>(nextTransformer: AsyncUnary<U, V>): PiperA<T, V> {
    async function transformers(value: T): Promise<V> {
      const next = await transformer(value);
      return nextTransformer(next);
    }

    return _piperA(transformers);
  }

  async function run(value: PossiblePromise<T>) {
    return transformer(await value);
  }

  return {
    run,
    thru: nextPipe
  };
}

/**
 * Create a series of transformers to pipe a value through,
 * where the value can be a promise and transformers can return promises.
 * @param transformer - A function that transforms the value.
 * @returns nextPipe - Pass a transformer to pipe again. Or, call .run to run the transforms.
 */
export const piperA = {
  thru: _piperA
};
