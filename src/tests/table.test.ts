import { expect, test } from "vitest";
import { Dealer } from "../dealer.js";
import { Hand, Player } from "../player.js";
import { Table } from "../table.js";
import { makeCard } from "./testHelpers.js";

test("autoFill seats the table with the requested number of players", () => {
  const table = new Table(new Dealer(), 4, true);

  expect(table.seats).toHaveLength(4);
  table.seats.forEach((seat) => expect(seat).toBeInstanceOf(Player));
});

test("without autoFill the table starts with no seated players", () => {
  const table = new Table(new Dealer(), 4, false);

  expect(table.seats).toHaveLength(0);
  expect(table.getSeatedPlayers()).toHaveLength(0);
});

test("seatPlayer adds a player to an open table", () => {
  const table = new Table(new Dealer(), 2, false);
  const player = new Player("Alice", 100);

  table.seatPlayer(player);

  expect(table.getSeatedPlayers()).toEqual([player]);
});

test("seatPlayer throws once the table is full", () => {
  const table = new Table(new Dealer(), 1, false);
  table.seatPlayer(new Player("Alice", 100));

  expect(() => table.seatPlayer(new Player("Bob", 100))).toThrow();
});

test("getSeatedPlayers filters out empty seats", () => {
  const table = new Table(new Dealer(), 2, false);
  const player = new Player("Alice", 100);
  table.seats.push(player, null);

  expect(table.getSeatedPlayers()).toEqual([player]);
});

test("clearAllHands resets the dealer's hand and every seated player's hands", () => {
  const dealer = new Dealer();
  const table = new Table(dealer, 2, true);
  const [player] = table.getSeatedPlayers();
  player!.hands.push(new Hand(1));
  dealer.hand.cards.push(makeCard("Ace"));

  table.clearAllHands();

  expect(dealer.hand.cards).toEqual([]);
  table.getSeatedPlayers().forEach((p) => expect(p.hands).toEqual([]));
});
