type X = { a: "x" };
type Y = { a: "y" };
type Z = { a: "z" };
type Q = { a: "q" };

const a = (_: X): Y => ({ a: "y" });
const b = (_: Y): Z => ({ a: "z" });
const c = (_: X): Q => ({ a: "q" });

const qa = async (_: X): Promise<Y> => ({ a: "y" });
const qb = async (_: Y): Promise<Z> => ({ a: "z" });
const qc = async (_: X): Promise<Q> => ({ a: "q" });

const chain = <T>(t: T) => {
  const fn = <U>(fa: (t: T) => U) => chain<U>(fa(t));
  fn.value = t;
  return fn;
};

const pchain = <T>(t: T | Promise<T>) => {
  const fn = <U>(fa: (t: T) => U | Promise<U>) =>
    pchain(Promise.resolve(t).then(fa));
  fn.value = t;
  return fn;
};

const xchain = <T, U>(transformer: (t: T) => U) => {
  const fn = <V>(fa: (u: U) => V) => xchain<T, V>((t: T) => fa(transformer(t)));
  fn.run = (t: T) => transformer(t);
  return fn;
};

const pxchain = <T, U>(transformer: (t: T | Promise<T>) => U | Promise<U>) => {
  const fn = <V>(fa: (u: U | Promise<U>) => V | Promise<V>) =>
    pxchain((t: T) => Promise.resolve(t).then(t => fa(transformer(t))));
  fn.run = (t: T) => transformer(t);
  return fn;
};

const px = Promise.resolve({ a: "x" });
const x: X = { a: "x" };

const main = async () => {
  console.log(await pxchain(a)(b).run(x));
  console.log(await pxchain(qa)(b).run(x));
  console.log(await pxchain(a)(qb).run(x));
  console.log(await pxchain(qa)(qb).run(x));

  console.log(await pchain(x)(a)(b).value);
  console.log(await pchain(x)(qa)(b).value);
  console.log(await pchain(x)(a)(qb).value);
  console.log(await pchain(x)(qa)(qb).value);
};
