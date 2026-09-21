import { expect, test } from "vitest";
import { Hand, Player } from "../player.js";
import { makeCard } from "./testHelpers.js";

test("constructor sets name, wallet, empty hands, and null initial wager", () => {
  const player = new Player("Alice", 500);

  expect(player.name).toBe("Alice");
  expect(player.wallet).toBe(500);
  expect(player.hands).toEqual([]);
  expect(player.initialWager).toBeNull();
});

test("each player is assigned a unique, increasing id", () => {
  const a = new Player("A", 100);
  const b = new Player("B", 100);

  expect(b.id).toBe(a.id + 1);
});

test("setWager sets the initial wager", () => {
  const player = new Player("Alice", 500);
  player.setWager(25);
  expect(player.initialWager).toBe(25);
});

test("clearCards resets hands to an empty array", () => {
  const player = new Player("Alice", 500);
  player.hands.push(new Hand(10));

  player.clearCards();

  expect(player.hands).toEqual([]);
});

test("Hand defaults to no cards, no double, and not blackjack", () => {
  const hand = new Hand(10);

  expect(hand.cards).toEqual([]);
  expect(hand.wager).toBe(10);
  expect(hand.hasDoubled).toBe(false);
  expect(hand.isBlackJack).toBe(false);
  expect(hand.result).toBeUndefined();
});

test("Hand accepts an initial set of cards", () => {
  const cards = [makeCard("Ace"), makeCard("King")];
  const hand = new Hand(10, cards);

  expect(hand.cards).toBe(cards);
});
