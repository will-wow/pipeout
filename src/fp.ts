/**
 * Create a series of transformers to pipe a value through.
 */
export const pipe = <T, U>(transformer: (value: T) => U) => {
  const nextChain = <V>(nextTransformer: (nextValue: U) => V) =>
    pipe<T, V>((value: T) => nextTransformer(transformer(value)));
  nextChain.run = (value: T) => transformer(value);
  return nextChain;
};

/**
 *
 * Create a series of transformers to pipe a value through, where the value and transformers can be promises.
 * @param transformer - A function that tranforms the value.
 * @returns - a function to chain again, with a .run property to run the functions.
 */
export const pipeAsync = <T, U>(
  transformer: (value: T | Promise<T>) => U | Promise<U>
) => {
  const nextChain = <V>(
    nextTransformer: (nextValue: U | Promise<U>) => V | Promise<V>
  ) =>
    pipeAsync((value: T) =>
      Promise.resolve(value).then(value => nextTransformer(transformer(value)))
    );
  nextChain.run = (value: T) => transformer(value);
  return nextChain;
};
