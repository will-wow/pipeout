import { pipe, pip, pipeA, piper, piperA } from "./index";
import * as fp from "lodash/fp";
import * as _ from "lodash";

interface Marble {
  color: string;
  size: number;
}

interface User {
  marbles: Marble[];
}

const marbles: Marble[] = [
  { color: "red", size: 2 },
  { color: "red", size: 1 },
  { color: "blue", size: 2 },
  { color: "red", size: 2 },
  { color: "blue", size: 1 }
];

const user = { marbles };

const isRed = (marble: Marble) => marble.color === "red";
const filterReds = fp.filter(isRed);
const getLength = <T>(xs: T[]): number => xs.length;

const fetchMarbles = (user: User) => Promise.resolve(user.marbles);
const fetchFavoriteColor = () => Promise.resolve("red");
const filterWithAsyncColor = async (marbles: Marble[]) => {
  const color = await fetchFavoriteColor();
  return _.filter(marbles, marble => marble.color === color);
};

describe("readme", () => {
  describe("pipe", () => {
    it("handles the readme example", () => {
      const redCount = pipe(marbles)
        .thru(filterReds)
        .thru(getLength)
        .value();

      expect(redCount).toBe(3);
    });
  });

  describe("pip", () => {
    it("handles the readme example", () => {
      const redCount = pip(marbles)
        .thru(filterReds)
        .thru(getLength)
        .value();

      expect(redCount).toBe(3);
    });
  });

  describe("piper", () => {
    it("handles the readme example", () => {
      const redCounter = piper.thru(filterReds).thru(getLength).run;
      const redCount = redCounter(marbles);

      expect(redCount).toBe(3);
    });
  });

  describe("pipeA", () => {
    it("handles the readme example", async () => {
      const redCount = await pipeA(user)
        .thru(fetchMarbles)
        .thru(filterWithAsyncColor)
        .thru(getLength)
        .value();

      expect(redCount).toBe(3);
    });
  });

  describe("piperA", () => {
    it("handles the readme example", async () => {
      const redCounter = piperA
        .thru(fetchMarbles)
        .thru(filterWithAsyncColor)
        .thru(getLength).run;

      const redCount = await redCounter(Promise.resolve(user));

      expect(redCount).toBe(3);
    });
  });
});
