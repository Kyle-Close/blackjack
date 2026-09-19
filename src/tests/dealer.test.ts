import { expect, test } from "vitest";
import { Dealer } from "../dealer.js";
import { Deck } from "../deck.js";
import { Table } from "../table.js";
import { Shoe } from "../shoe.js";

test("Expect correct amount of cards to be dealt to each player & dealer", () => {
  const dealer = new Dealer();
  const table = new Table(dealer, 5, true);
  const shoe = new Shoe(4);

  const players = table.getSeatedPlayers();

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
