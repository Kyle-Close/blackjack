import { expect, test } from "vitest";
import { HandEvaluator } from "../handEvaluator.js";

test("Evaluates a single ace correctly", () => {
  expect(
    HandEvaluator.evaluate([{ suit: "Heart", rank: "Ace", value: 1 }]),
  ).toBe(11);
});

test("Evaluates long hand correctly", () => {
  expect(
    HandEvaluator.evaluate([
      { suit: "Heart", rank: "3", value: 3 },
      { suit: "Heart", rank: "2", value: 2 },
      { suit: "Heart", rank: "5", value: 5 },
      { suit: "Heart", rank: "Ace", value: 1 },
      { suit: "Club", rank: "2", value: 2 },
      { suit: "Heart", rank: "7", value: 7 },
    ]),
  ).toBe(20);
});

test("Evaluates over 21 correctly", () => {
  expect(
    HandEvaluator.evaluate([
      { suit: "Heart", rank: "Jack", value: 10 },
      { suit: "Heart", rank: "5", value: 5 },
      { suit: "Heart", rank: "King", value: 10 },
    ]),
  ).toBe(25);
});

test("Evaluates exactly 21 correctly", () => {
  expect(
    HandEvaluator.evaluate([
      { suit: "Heart", rank: "Ace", value: 1 },
      { suit: "Heart", rank: "King", value: 10 },
    ]),
  ).toBe(21);
});
