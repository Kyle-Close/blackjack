import { expect, test } from "vitest";
import { Shoe } from "../shoe.js";
import { makeCard } from "./testHelpers.js";

test("constructor throws for less than 1 deck", () => {
  expect(() => new Shoe(0)).toThrow();
  expect(() => new Shoe(-1)).toThrow();
});

test("constructor builds deckCount * 52 cards", () => {
  expect(new Shoe(1).cards).toHaveLength(52);
  expect(new Shoe(4).cards).toHaveLength(208);
});

test("cutCardPosition falls within the middle 50%-75% of the shoe", () => {
  const shoe = new Shoe(4);
  const min = Math.floor(shoe.cards.length / 2);
  const max = Math.floor(shoe.cards.length * 0.75);

  expect(shoe.cutCardPosition).toBeGreaterThanOrEqual(min);
  expect(shoe.cutCardPosition).toBeLessThanOrEqual(max);
});

test("draw() removes and returns the top card, decrementing cutCardPosition", () => {
  const shoe = new Shoe(1);
  const expectedCard = shoe.cards[shoe.cards.length - 1];
  const startingPosition = shoe.cutCardPosition;

  const drawn = shoe.draw();

  expect(drawn).toBe(expectedCard);
  expect(shoe.cards).toHaveLength(51);
  expect(shoe.cutCardPosition).toBe(startingPosition - 1);
});

test("draw() throws once the shoe is empty", () => {
  const shoe = new Shoe(1);
  for (let i = 0; i < 52; i++) shoe.draw();

  expect(() => shoe.draw()).toThrow();
});

test("newShuffle flips to true only once the cut card is reached", () => {
  const shoe = new Shoe(1);
  shoe.cards = [makeCard("2"), makeCard("3")];
  shoe.cutCardPosition = 1;

  shoe.draw(); // cutCardPosition: 1 -> 0, newShuffle still false
  expect(shoe.newShuffle).toBe(false);

  shoe.draw(); // cutCardPosition was 0 entering this draw -> newShuffle flips true
  expect(shoe.newShuffle).toBe(true);
});
