import { pipe, pipeAsync, pipeCurried, pipeAsyncCurried } from "./index";

type A = { x: "a" };
type B = { x: "b" };
type C = { x: "c" };
type D = { x: "d" };

const a: A = { x: "a" };
const b: B = { x: "b" };
const c: C = { x: "c" };
const d: D = { x: "d" };

const aToB = (_: A): B => b;
const bToC = (_: B): C => c;
const cToD = (_: C): D => d;
// const bToD = (_: B): D => (d);

const aToBAsync = (_: A): Promise<B> => Promise.resolve(b);
const bToCAsync = (_: B): Promise<C> => Promise.resolve(c);
const cToDAsync = (_: C): Promise<D> => Promise.resolve(d);
// const bToD = (_: B): Promise<D> => Promise.resolve(d);

const aAsync = Promise.resolve(a);

describe("pipeout", () => {
  describe("non-curried functions", () => {
    describe("pipe", () => {
      it("returns a value", () => {
        expect(pipe(a).value).toEqual(a);
      });

      it("pipes through multiple transforms", () => {
        const d: D = pipe(a)(aToB)(bToC)(cToD).value;
        expect(d).toEqual({ x: "d" });
      });
    });

    describe("pipeAsync", () => {
      it("returns a promise", async () => {
        expect(await pipeAsync(aAsync).value).toEqual(a);
      });

      it("pipes through multiple transforms", async () => {
        const result: D = await pipeAsync(aAsync)(aToBAsync)(bToCAsync)(
          cToDAsync
        ).value;
        expect(result).toEqual(d);
      });

      it("pipes a non-promise through transformations", async () => {
        const result: D = await pipeAsync(a)(aToB)(bToC)(cToD).value;
        expect(result).toEqual(d);
      });

      it("pipes a through transformations that may or may not be promises", async () => {
        const result: D = await pipeAsync(a)(aToB)(bToC)(cToD).value;
        expect(result).toEqual(d);
      });
    });
  });

  describe("curried functions", () => {
    describe("pipe", () => {
      it("pipes through multiple transforms", () => {
        const transform = pipeCurried(aToB)(bToC)(cToD).run;
        expect(transform(a)).toEqual(d);
      });
    });

    describe("pipeAsync", () => {
      it("pipes through multiple transforms", async () => {
        const transform = pipeAsyncCurried(aToBAsync)(bToCAsync)(cToDAsync).run;
        expect(await transform(a)).toEqual(d);
      });
    });
  });
});
