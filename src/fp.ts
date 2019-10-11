export const xchain = <T, U>(transformer: (t: T) => U) => {
  const fn = <V>(fa: (u: U) => V) => xchain<T, V>((t: T) => fa(transformer(t)));
  fn.run = (t: T) => transformer(t);
  return fn;
};

export const pxchain = <T, U>(transformer: (t: T | Promise<T>) => U | Promise<U>) => {
  const fn = <V>(fa: (u: U | Promise<U>) => V | Promise<V>) =>
    pxchain((t: T) => Promise.resolve(t).then(t => fa(transformer(t))));
  fn.run = (t: T) => transformer(t);
  return fn;
};