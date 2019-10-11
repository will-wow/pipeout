/**
 * Pipe a value through a series of transformers.
 */
export const pipe = <T>(value: T) => {
  const nextChain = <U>(transformer: (t: T) => U) =>
    pipe<U>(transformer(value));
  nextChain.value = value;
  return nextChain;
};

/**
 * Pipe a value through a series of transformers, where the value and transformers can be promises.
 * @param value - The starting value
 * @param transformer - A function that tranforms the value.
 * @returns - a function to chain again, with a .value property to return the promise.
 */
export const pipeAsync = <T>(value: T | Promise<T>) => {
  const nextChain = <U>(transformer: (t: T) => U | Promise<U>) =>
    pipeAsync(Promise.resolve(value).then(transformer));
  nextChain.value = value;
  return nextChain;
};
