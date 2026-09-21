import { expect, test } from "vitest";
import { Dealer } from "../dealer.js";
import { Deck } from "../deck.js";
import { Hand, Player } from "../player.js";
import { DealerStrategy } from "../playerStrategy.js";
import { Table } from "../table.js";
import { Shoe } from "../shoe.js";
import { makeCard, makeControlledShoe } from "./testHelpers.js";

test("Expect correct amount of cards to be dealt to each player & dealer", () => {
  const dealer = new Dealer();
  const table = new Table(dealer, 5, true);
  const shoe = new Shoe(4);

  const players = table.getSeatedPlayers();
  players.forEach((player) => player.setWager(1));

  dealer.dealTable(shoe, players);

  const totalPlayerCardCount = players.reduce(
    (accumulator, currentPlayer) =>
      accumulator +
      currentPlayer.hands.reduce(
        (accumulator, currentHand) => accumulator + currentHand.cards.length,
        0,
      ),
    0,
  );

  const totalDealerCardCount = table.dealer.hand.cards.length;

  expect(totalPlayerCardCount).toBe(10);
  expect(totalDealerCardCount).toBe(2);
});

test("dealTable throws if a player has not placed a wager", () => {
  const dealer = new Dealer();
  const shoe = new Shoe(4);
  const player = new Player("Alice", 100);

  expect(() => dealer.dealTable(shoe, [player])).toThrow();
});

test("getUpCard returns the dealer's first card", () => {
  const dealer = new Dealer();
  const upCard = makeCard("King");
  dealer.hand.cards.push(upCard, makeCard("5"));

  expect(dealer.getUpCard()).toBe(upCard);
});

test("getUpCard throws when the dealer has no cards", () => {
  const dealer = new Dealer();
  expect(() => dealer.getUpCard()).toThrow();
});

test("resetHand replaces the hand with a fresh, empty hand", () => {
  const dealer = new Dealer();
  dealer.hand.cards.push(makeCard("5"));

  dealer.resetHand();

  expect(dealer.hand.cards).toEqual([]);
});

test("dealSingle draws one card from the shoe onto the hand and returns it", () => {
  const dealer = new Dealer();
  const shoe = makeControlledShoe([makeCard("7")]);
  const hand = new Hand(1);

  const drawn = dealer.dealSingle(shoe, hand);

  expect(drawn.rank).toBe("7");
  expect(hand.cards).toEqual([drawn]);
  expect(shoe.cards).toHaveLength(0);
});

test("executeTurn hits until reaching 17 or more", () => {
  const dealer = new Dealer();
  dealer.hand.cards.push(makeCard("5"), makeCard("2"));
  const shoe = makeControlledShoe([makeCard("4"), makeCard("6")]);

  dealer.executeTurn(shoe, DealerStrategy);

  expect(dealer.hand.cards.map((c) => c.rank)).toEqual([
    "5",
    "2",
    "4",
    "6",
  ]);
});

test("executeTurn stops hitting as soon as the dealer busts", () => {
  const dealer = new Dealer();
  dealer.hand.cards.push(makeCard("10"), makeCard("6"));
  const shoe = makeControlledShoe([makeCard("King"), makeCard("King")]);

  dealer.executeTurn(shoe, DealerStrategy);

  // Only one card should have been drawn before the bust check exits the loop
  expect(dealer.hand.cards).toHaveLength(3);
  expect(shoe.cards).toHaveLength(1);
});
