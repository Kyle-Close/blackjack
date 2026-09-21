import { expect, test } from "vitest";
import { getCutCardIndex, shuffleArray } from "../util.js";
import { makeCard } from "./testHelpers.js";

test("shuffleArray preserves length and multiset of elements", () => {
  const original = Array.from({ length: 52 }, (_, i) => i);
  const shuffled = shuffleArray([...original]);

  expect(shuffled).toHaveLength(original.length);
  expect([...shuffled].sort((a, b) => a - b)).toEqual(original);
});

test("shuffleArray handles empty array", () => {
  expect(shuffleArray([])).toEqual([]);
});

test("shuffleArray handles single element array", () => {
  expect(shuffleArray([1])).toEqual([1]);
});

test("getCutCardIndex returns an index within the middle 50%-75% of the shoe", () => {
  const cards = Array.from({ length: 208 }, () => makeCard("2"));
  const min = Math.floor(cards.length / 2);
  const max = Math.floor(cards.length * 0.75);

  for (let i = 0; i < 100; i++) {
    const index = getCutCardIndex(cards);
    expect(index).toBeGreaterThanOrEqual(min);
    expect(index).toBeLessThanOrEqual(max);
  }
});

test("getCutCardIndex handles an empty array without error", () => {
  expect(getCutCardIndex([])).toBe(0);
});
