type PossiblePromise<T> = T | Promise<T>;
type Unary<In, Out> = (x: In) => Out;
type AsyncUnary<In, Out> = (x: In) => PossiblePromise<Out>;

interface Pipe<T> {
  <U>(transformer: Unary<T, U>): Pipe<U>;
  value: T;
}

interface PipeA<T> {
  <U>(transformer: AsyncUnary<T, U>): PipeA<U>;
  value: Promise<T>;
}

interface Piper<T, U> {
  <V>(transformer: Unary<U, V>): Piper<T, V>;
  run: (value: T) => U;
}

interface PiperA<T, U> {
  <V>(transformer: AsyncUnary<U, V>): PiperA<T, V>;
  run: (value: PossiblePromise<T>) => Promise<U>;
}

/**
 * Pipe a value through a series of transformers.
 * @param value - The value to send through the pipeline.
 * @returns nextPipe - A function that call be called to pipe again. Or, use .value to get the transformed value.
 */
export const pipe = <T>(value: T): Pipe<T> => {
  const nextPipe = <U>(transformer: Unary<T, U>) => pipe<U>(transformer(value));
  nextPipe.value = value;
  return nextPipe;
};

/**
 * Pipe a value through a series of transformers,
 * where the value can be a promise and transformers can return promises.
 * @param value - The value to send through the pipeline.
 * @returns nextPipe - A function that call be called to pipe again. Or, use .value to get the transformed value.
 */
export const pipeA = <T>(value: PossiblePromise<T>): PipeA<T> => {
  const nextPipe = <U>(transformer: AsyncUnary<T, U>) =>
    pipeA(Promise.resolve(value).then(transformer));
  nextPipe.value = Promise.resolve(value);
  return nextPipe;
};

/**
 * Create a series of transformers to pipe a value through.
 * @param transformer - A function that transforms the value.
 * @returns nextPipe - A function that call be called to pipe again. Or, call .run to run the transforms.
 */
export const piper = <T, U>(transformer: Unary<T, U>): Piper<T, U> => {
  const nextPipe = <V>(nextTransformer: Unary<U, V>) =>
    piper<T, V>((value: T) => nextTransformer(transformer(value)));
  nextPipe.run = (value: T) => transformer(value);
  return nextPipe;
};

/**
 * Create a series of transformers to pipe a value through,
 * where the value can be a promise and transformers can return promises.
 * @param transformer - A function that transforms the value.
 * @returns nextPipe - A function that call be called to pipe again. Or, call .run to run the transforms.
 */
export const piperA = <T, U>(transformer: AsyncUnary<T, U>): PiperA<T, U> => {
  const nextPipe = <V>(nextTransformer: AsyncUnary<U, V>) =>
    piperA(
      async (valuePromise: PossiblePromise<T>): Promise<V> => {
        const value = await valuePromise;
        const next = await transformer(value);
        return nextTransformer(next);
      }
    );
  nextPipe.run = async (value: PossiblePromise<T>) => transformer(await value);
  return nextPipe;
};
