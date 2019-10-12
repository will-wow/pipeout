export type Unary<In, Out> = (x: In) => Out;
export type AsyncUnary<In, Out> = (x: In) => Out | Promise<Out>;

/**
 * Pipe a value through a series of transformers.
 */
export const pipe = <T>(value: T) => {
  const nextPipe = <U>(transformer: Unary<T, U>) => pipe<U>(transformer(value));
  nextPipe.value = value;
  return nextPipe;
};

/**
 * Pipe a value through a series of transformers, where the value and transformers can be promises.
 * @param value - The starting value
 * @param transformer - A function that transforms the value.
 * @returns - a function to chain again, with a .value property to return the promise.
 */
export const pipeA = <T>(value: T | Promise<T>) => {
  const nextPipe = <U>(transformer: AsyncUnary<T, U>) =>
    pipeA(Promise.resolve(value).then(transformer));
  nextPipe.value = value;
  return nextPipe;
};

/**
 * Create a series of transformers to pipe a value through.
 */
export const piper = <T, U>(transformer: Unary<T, U>) => {
  const nextPipe = <V>(nextTransformer: Unary<U, V>) =>
    piper<T, V>((value: T) => nextTransformer(transformer(value)));
  nextPipe.run = (value: T) => transformer(value);
  return nextPipe;
};

/**
 *
 * Create a series of transformers to pipe a value through, where the value and transformers can be promises.
 * @param transformer - A function that transforms the value.
 * @returns - a function to chain again, with a .run property to run the functions.
 */
export const piperA = <T, U>(transformer: AsyncUnary<T, U>) => {
  const nextPipe = <V>(nextTransformer: AsyncUnary<U, V>) =>
    piperA(
      async (valuePromise: T | Promise<T>): Promise<V> => {
        const value = await valuePromise;
        const next = await transformer(value);
        return nextTransformer(next);
      }
    );
  nextPipe.run = (value: T) => transformer(value);
  return nextPipe;
};
