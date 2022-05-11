import { pipe, pip, pipeA } from "./index";
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
  { color: "blue", size: 1 },
];

const user = { marbles };

const isRed = (marble: Marble) => marble.color === "red";
const onlyRed = fp.filter(isRed);
const isSmall = (marble: Marble) => marble.size === 1;
const onlySmall = fp.filter(isSmall);
const getLength = <T>(xs: T[]): number => xs.length;

const fetchMarbles = (user: User) => Promise.resolve(user.marbles);
const fetchMarblesWillFail = (_user: User) =>
  Promise.reject("you've lost your marbles!");
const fetchFavoriteColor = () => Promise.resolve("red");
const filterForFavoriteColor = async (marbles: Marble[]) => {
  const color = await fetchFavoriteColor();
  return _.filter(marbles, (marble) => marble.color === color);
};

describe("readme", () => {
  describe("pipe", () => {
    it("handles the readme example", () => {
      const redCount = pipe(marbles).thru(onlyRed).thru(getLength).value();

      expect(redCount).toBe(3);
    });
  });

  describe("pip", () => {
    it("handles the readme example", () => {
      const redCount = pip(marbles).thru(onlyRed).thru(getLength).value();

      expect(redCount).toBe(3);
    });
  });

  describe("point-free pipe", () => {
    it("handles the readme example", () => {
      const redCounter = pipe.thru(onlyRed).thru(getLength);
      const redCount = redCounter(marbles);

      expect(redCount).toBe(3);
    });

    it("handles the readme example about immutable updates", () => {
      const getSmallReds = pipe.thru(onlyRed).thru(onlySmall);
      const smallRedCounter = getSmallReds.thru(getLength);

      const smallReds = getSmallReds(marbles);
      const smallRedCount = smallRedCounter(marbles);

      expect(smallReds.length).toBe(1);
      expect(smallRedCount).toBe(1);
    });
  });

  describe("pipeA", () => {
    it("handles the readme example", async () => {
      const redCount = await pipeA(user)
        .thru(fetchMarbles)
        .thru(filterForFavoriteColor)
        .thru(getLength)
        .value();

      expect(redCount).toBe(3);
    });

    it("handles the readme example about errors", async () => {
      const redCount = await pipeA(user)
        .thru(fetchMarblesWillFail)
        .thru(filterForFavoriteColor)
        .thru(getLength)
        .value()
        .catch(() => 0);

      expect(redCount).toBe(0);
    });
  });

  describe("point-free pipeA", () => {
    it("handles the readme example", async () => {
      const redCounter = pipeA
        .thru(fetchMarbles)
        .thru(filterForFavoriteColor)
        .thru(getLength);

      const redCount = await redCounter(Promise.resolve(user));

      expect(redCount).toBe(3);
    });

    it("handles the readme example about errors", async () => {
      const redCounter = pipeA
        .thru(fetchMarblesWillFail)
        .thru(filterForFavoriteColor)
        .thru(getLength);

      try {
        await redCounter(Promise.resolve(user));
      } catch (error) {
        expect(error).toBe("you've lost your marbles!");
      }
    });
  });
});
