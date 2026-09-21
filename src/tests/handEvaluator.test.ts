import { expect, test } from "vitest";
import { HandEvaluator } from "../handEvaluator.js";
import { Hand } from "../player.js";
import { makeCard } from "./testHelpers.js";

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

test("Multiple aces only promote one to 11 when it keeps the hand at or under 21", () => {
  expect(
    HandEvaluator.evaluate([makeCard("Ace"), makeCard("Ace"), makeCard("9")]),
  ).toBe(21);
});

test("Multiple aces all count low once promoting would bust the hand", () => {
  expect(
    HandEvaluator.evaluate([
      makeCard("Ace"),
      makeCard("Ace"),
      makeCard("Ace"),
      makeCard("9"),
    ]),
  ).toBe(12);
});

test("compareHands: player natural blackjack beats a dealer non-blackjack hand", () => {
  const player = new Hand(10, [makeCard("Ace"), makeCard("King")]);
  const dealer = new Hand(10, [makeCard("10"), makeCard("9")]);

  expect(HandEvaluator.compareHands(player, dealer)).toBe("BJ");
});

test("compareHands: dealer natural blackjack beats a player non-blackjack hand", () => {
  const player = new Hand(10, [makeCard("10"), makeCard("9")]);
  const dealer = new Hand(10, [makeCard("Ace"), makeCard("King")]);

  expect(HandEvaluator.compareHands(player, dealer)).toBe("Dealer Win");
});

test("compareHands: both natural blackjacks push", () => {
  const player = new Hand(10, [makeCard("Ace"), makeCard("King")]);
  const dealer = new Hand(10, [makeCard("Ace"), makeCard("Queen")]);

  expect(HandEvaluator.compareHands(player, dealer)).toBe("Push");
});

test("compareHands: a 21 made with 3+ cards is not treated as a natural blackjack", () => {
  const player = new Hand(10, [makeCard("7"), makeCard("7"), makeCard("7")]);
  const dealer = new Hand(10, [makeCard("10"), makeCard("9")]);

  expect(HandEvaluator.compareHands(player, dealer)).toBe("Player Win");
});

test("compareHands: player bust loses even if the dealer also busts", () => {
  const player = new Hand(10, [makeCard("King"), makeCard("Queen"), makeCard("5")]);
  const dealer = new Hand(10, [makeCard("King"), makeCard("Queen"), makeCard("King")]);

  expect(HandEvaluator.compareHands(player, dealer)).toBe("Dealer Win");
});

test("compareHands: dealer bust with player under 21 is a player win", () => {
  const player = new Hand(10, [makeCard("10"), makeCard("8")]);
  const dealer = new Hand(10, [makeCard("King"), makeCard("Queen"), makeCard("King")]);

  expect(HandEvaluator.compareHands(player, dealer)).toBe("Player Win");
});

test("compareHands: equal totals under 21 push", () => {
  const player = new Hand(10, [makeCard("10"), makeCard("8")]);
  const dealer = new Hand(10, [makeCard("9"), makeCard("9")]);

  expect(HandEvaluator.compareHands(player, dealer)).toBe("Push");
});

test("compareHands: higher non-bust total wins", () => {
  const player = new Hand(10, [makeCard("10"), makeCard("8")]);
  const dealer = new Hand(10, [makeCard("10"), makeCard("6")]);

  expect(HandEvaluator.compareHands(player, dealer)).toBe("Player Win");
});

test("compareHands: lower non-bust total loses", () => {
  const player = new Hand(10, [makeCard("10"), makeCard("6")]);
  const dealer = new Hand(10, [makeCard("10"), makeCard("8")]);

  expect(HandEvaluator.compareHands(player, dealer)).toBe("Dealer Win");
});

test("stringifyHand formats ranks, suits, and the evaluated total", () => {
  expect(
    HandEvaluator.stringifyHand([makeCard("Ace"), makeCard("King", "Spade")]),
  ).toBe("A♥ -> K♠ = 21");
});
