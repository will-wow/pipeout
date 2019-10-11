export const chain = <T>(t: T) => {
  const fn = <U>(fa: (t: T) => U) => chain<U>(fa(t));
  fn.value = t;
  return fn;
};

export const pchain = <T>(t: T | Promise<T>) => {
  const fn = <U>(fa: (t: T) => U | Promise<U>) =>
    pchain(Promise.resolve(t).then(fa));
  fn.value = t;
  return fn;
};