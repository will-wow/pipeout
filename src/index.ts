/** A value that may or may not be a promise. */
export type PossiblePromise<T> = T | Promise<T>;
/** A function that takes a single argument and transforms it. */
export type Unary<T, U> = (x: T) => U;
/** A function that takes a single argument and transforms it, possibly returning a Promise. */
export type AsyncUnary<T, U> = (x: T) => PossiblePromise<U>;

/** The return value from `pipe()` */
export interface Pipe<T> {
  /** Add another transformer */
  thru: <U>(transformer: Unary<T, U>) => Pipe<U>;
  /** Get the transomed value. */
  value: () => T;
}

/** The return value from `pipeA()` */
export interface PipeA<T> {
  /** Add another transformer */
  thru: <U>(transformer: AsyncUnary<T, U>) => PipeA<U>;
  /** Get a promise of the transomed value. */
  value: () => Promise<T>;
}

/** The return value from `pipe.thru()` */
export interface Piper<T, U> {
  /** Transform a value with the pipeline */
  (value: T): U;
  /** Add another transformer */
  thru: <V>(transformer: Unary<U, V>) => Piper<T, V>;
}

/** The return value from `pipeA.thru()` */
export interface PiperA<T, U> {
  /** Transform a value with the pipeline */
  (value: PossiblePromise<T>): Promise<U>;
  /** Add another transformer */
  thru: <V>(transformer: AsyncUnary<U, V>) => PiperA<T, V>;
}

function piper<T, U>(transformer: Unary<T, U>): Piper<T, U> {
  function nextPipe<V>(nextTransformer: Unary<U, V>): Piper<T, V> {
    return piper<T, V>(function (value: T) {
      return nextTransformer(transformer(value));
    });
  }

  function run(value: T) {
    return transformer(value);
  }

  run.thru = nextPipe;

  return run;
}

function piperA<T, U>(transformer: AsyncUnary<T, U>): PiperA<T, U> {
  function nextPipe<V>(nextTransformer: AsyncUnary<U, V>): PiperA<T, V> {
    async function transformers(value: T): Promise<V> {
      const next = await transformer(value);
      return nextTransformer(next);
    }

    return piperA(transformers);
  }

  async function run(value: PossiblePromise<T>) {
    return transformer(await value);
  }

  run.thru = nextPipe;

  return run;
}

/**
 * Pipe a value through a series of transformers.
 * @param value - The value to send through the pipeline.
 * @returns An object with a .value method for getting the transformed value, and a .thru method for piping the value through another transformer.
 */
export function pipe<T>(value: T): Pipe<T> {
  function nextPipe<U>(transformer: Unary<T, U>): Pipe<U> {
    return pipe<U>(transformer(value));
  }

  return {
    value: () => value,
    thru: nextPipe,
  };
}

export namespace pipe {
  /**
   * Create a series of transformers to pipe a value through.
   * @param transformer - A function that transforms the value.
   * @returns run - Takes a value and runs it through the pipeline. Also has a .thru method for adding another function to the pipeline.
   */
  export const thru = piper;
}

export { pipe as pip };

/**
 * Pipe a value through a series of transformers,
 * where the value can be a promise and transformers can return promises.
 * @param value - The value to send through the pipeline. This may be a promise.
 * @returns An object with a .value method for getting a promise of the transformed value, and a .thru method for piping the value through another transformer.
 */
export function pipeA<T>(value: PossiblePromise<T>): PipeA<T> {
  function nextPipe<U>(transformer: AsyncUnary<T, U>): PipeA<U> {
    return pipeA(Promise.resolve(value).then(transformer));
  }

  return {
    value: () => Promise.resolve(value),
    thru: nextPipe,
  };
}

export namespace pipeA {
  /**
   * Create a series of transformers to pipe a value through,
   * where the value can be a promise and transformers can return promises.
   * @param transformer - A function that transforms the value. This may return a promise.
   * @returns run - Takes a value and runs it through the pipeline. Also has a .thru method for adding another function to the pipeline.
   */
  export const thru = piperA;
}
