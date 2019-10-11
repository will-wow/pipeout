import { Unary, AsyncUnary } from "./types";

/**
 * Create a series of transformers to pipe a value through.
 */
export const pipe = <T, U>(transformer: Unary<T, U>) => {
  const nextChain = <V>(nextTransformer: Unary<U, V>) =>
    pipe<T, V>((value: T) => nextTransformer(transformer(value)));
  nextChain.run = (value: T) => transformer(value);
  return nextChain;
};

/**
 *
 * Create a series of transformers to pipe a value through, where the value and transformers can be promises.
 * @param transformer - A function that transforms the value.
 * @returns - a function to chain again, with a .run property to run the functions.
 */
export const pipeAsync = <T, U>(transformer: AsyncUnary<T, U>) => {
  const nextChain = <V>(nextTransformer: AsyncUnary<U, V>) =>
    pipeAsync(
      async (valuePromise: T | Promise<T>): Promise<V> => {
        const value = await valuePromise;
        const next = await transformer(value);
        return nextTransformer(next);
      }
    );
  nextChain.run = (value: T) => transformer(value);
  return nextChain;
};
