import { beforeEach, expect, test } from "vitest";
import { DEFAULT_PLAYER_WAGER, DEFAULT_SEATS_AT_TABLE } from "../config.js";
import { Engine } from "../engine.js";
import { Hand } from "../player.js";
import { DealerStrategy } from "../playerStrategy.js";
import {
  makeCard,
  makeControlledShoe,
  makeFixedStrategy,
  makeScriptedStrategy,
  makeStrategyThatShouldNotBeCalled,
} from "./testHelpers.js";

beforeEach(() => {
  Engine.roundCount = 0;
  Engine.totalWagered = 0;
  Engine.netResult = 0;
  Engine.winCount = 0;
  Engine.lossCount = 0;
  Engine.pushCount = 0;
});

// ---- isBJ ----

test("isBJ is true for a 2-card 21", () => {
  const engine = new Engine();
  const hand = new Hand(1, [makeCard("Ace"), makeCard("King")]);
  expect(engine.isBJ(hand)).toBe(true);
});

test("isBJ is false for a 21 made with more than 2 cards", () => {
  const engine = new Engine();
  const hand = new Hand(1, [makeCard("7"), makeCard("7"), makeCard("7")]);
  expect(engine.isBJ(hand)).toBe(false);
});

test("isBJ is false for a 2-card hand under 21", () => {
  const engine = new Engine();
  const hand = new Hand(1, [makeCard("10"), makeCard("6")]);
  expect(engine.isBJ(hand)).toBe(false);
});

// ---- getAvailablePlayerActions ----

test("getAvailablePlayerActions offers Hit, Stand, Double, and Split on a starting pair", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [new Hand(1, [makeCard("8"), makeCard("8")])];

  expect(engine.getAvailablePlayerActions(player).sort()).toEqual(
    ["Double", "Hit", "Split", "Stand"].sort(),
  );
});

test("getAvailablePlayerActions allows Split on same-value cards of different ranks (King + Queen)", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [new Hand(1, [makeCard("King"), makeCard("Queen")])];

  expect(engine.getAvailablePlayerActions(player)).toContain("Split");
});

test("getAvailablePlayerActions offers Hit, Stand, and Double (no Split) on a non-pair starting hand", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [new Hand(1, [makeCard("10"), makeCard("6")])];

  expect(engine.getAvailablePlayerActions(player).sort()).toEqual(
    ["Double", "Hit", "Stand"].sort(),
  );
});

test("getAvailablePlayerActions only offers Hit and Stand once the hand has more than 2 cards", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [new Hand(1, [makeCard("2"), makeCard("2"), makeCard("2")])];

  expect(engine.getAvailablePlayerActions(player)).toEqual(["Hit", "Stand"]);
});

test("getAvailablePlayerActions only offers Hit and Stand once the player has more than one hand", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [
    new Hand(1, [makeCard("8"), makeCard("2")]),
    new Hand(1, [makeCard("8"), makeCard("3")]),
  ];

  expect(engine.getAvailablePlayerActions(player)).toEqual(["Hit", "Stand"]);
});

test("getAvailablePlayerActions throws when the player has not been dealt a hand", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [];

  expect(() => engine.getAvailablePlayerActions(player)).toThrow();
});

// ---- playHand (Split branch intentionally not exercised here) ----

test("playHand: a natural blackjack short-circuits before any action is taken", () => {
  const engine = new Engine();
  const hand = new Hand(1, [makeCard("Ace"), makeCard("King")]);
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [hand];

  const didSplit = engine.playHand(
    player,
    "Hit",
    hand,
    makeStrategyThatShouldNotBeCalled(),
  );

  expect(hand.isBlackJack).toBe(true);
  expect(hand.cards).toHaveLength(2);
  expect(didSplit).toBe(false);
});

test("playHand: Stand as the initial action deals no extra cards", () => {
  const engine = new Engine();
  const hand = new Hand(1, [makeCard("10"), makeCard("6")]);
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [hand];

  const didSplit = engine.playHand(
    player,
    "Stand",
    hand,
    makeStrategyThatShouldNotBeCalled(),
  );

  expect(hand.cards).toHaveLength(2);
  expect(didSplit).toBe(false);
});

test("playHand: hits and stops as soon as it busts", () => {
  const engine = new Engine();
  const hand = new Hand(1, [makeCard("10"), makeCard("5")]); // 15
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [hand];
  engine.shoe = makeControlledShoe([makeCard("King")]); // 15 + 10 = 25, bust

  let busted = false;
  engine.on("hand:bust", () => (busted = true));

  const didSplit = engine.playHand(
    player,
    "Hit",
    hand,
    makeStrategyThatShouldNotBeCalled(),
  );

  expect(busted).toBe(true);
  expect(hand.cards.map((c) => c.rank)).toEqual(["10", "5", "King"]);
  expect(didSplit).toBe(false);
});

test("playHand: keeps hitting via the strategy until it stands", () => {
  const engine = new Engine();
  const hand = new Hand(1, [makeCard("2"), makeCard("3")]); // 5
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [hand];
  engine.table.dealer.hand.cards.push(makeCard("5"));
  engine.shoe = makeControlledShoe([makeCard("4"), makeCard("5")]); // 5 -> 9 -> 14

  const strategy = makeScriptedStrategy(["Hit", "Stand"]);

  const didSplit = engine.playHand(player, "Hit", hand, strategy);

  expect(hand.cards.map((c) => c.rank)).toEqual(["2", "3", "4", "5"]);
  expect(didSplit).toBe(false);
});

test("playHand: BUG - Double as the initial action is unreachable and does nothing", () => {
  // The while-loop guard is `action !== "Stand" && action !== "Double"`, so when
  // "Double" is the action passed in, the loop body (which contains the only
  // code that deals the extra card, sets hasDoubled, and doubles the wager)
  // never runs. This documents the current (likely unintended) behavior.
  const engine = new Engine();
  const hand = new Hand(10, [makeCard("6"), makeCard("5")]); // 11
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [hand];
  engine.shoe = makeControlledShoe([makeCard("King")]);

  const didSplit = engine.playHand(
    player,
    "Double",
    hand,
    makeStrategyThatShouldNotBeCalled(),
  );

  expect(hand.cards).toHaveLength(2);
  expect(hand.hasDoubled).toBe(false);
  expect(hand.wager).toBe(10);
  expect(engine.shoe.cards).toHaveLength(1); // nothing was drawn
  expect(didSplit).toBe(false);
});

// ---- updateHandResults / updateStaticResults ----

test("updateHandResults sets each player's hand result against the dealer's hand", () => {
  const engine = new Engine();
  const players = engine.table.getSeatedPlayers();
  players.forEach((p) => (p.hands = []));

  const player = players[0]!;
  player.hands = [new Hand(1, [makeCard("10"), makeCard("9")])]; // 19
  engine.table.dealer.hand = new Hand(0, [makeCard("10"), makeCard("6")]); // 16

  engine.updateHandResults();

  expect(player.hands[0]!.result).toBe("Player Win");
});

test("updateStaticResults accumulates wins, net result, and total wagered for a Player Win", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  const hand = new Hand(10);
  hand.result = "Player Win";
  player.hands = [hand];

  engine.updateStaticResults([player]);

  expect(Engine.winCount).toBe(1);
  expect(Engine.netResult).toBe(10);
  expect(Engine.totalWagered).toBe(10);
});

test("updateStaticResults applies the blackjack multiplier on a BJ result", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  const hand = new Hand(10);
  hand.result = "BJ";
  player.hands = [hand];

  engine.updateStaticResults([player]);

  expect(Engine.winCount).toBe(1);
  expect(Engine.netResult).toBe(15);
});

test("updateStaticResults counts a loss and subtracts the wager on a Dealer Win", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  const hand = new Hand(10);
  hand.result = "Dealer Win";
  player.hands = [hand];

  engine.updateStaticResults([player]);

  expect(Engine.lossCount).toBe(1);
  expect(Engine.netResult).toBe(-10);
});

test("updateStaticResults counts a push without changing net result", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  const hand = new Hand(10);
  hand.result = "Push";
  player.hands = [hand];

  engine.updateStaticResults([player]);

  expect(Engine.pushCount).toBe(1);
  expect(Engine.netResult).toBe(0);
  expect(Engine.totalWagered).toBe(10);
});

test("updateStaticResults throws when a hand has no result", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  const hand = new Hand(10);
  player.hands = [hand];

  expect(() => engine.updateStaticResults([player])).toThrow();
});

// ---- collectPlayerWagers ----

test("collectPlayerWagers sets the default wager for every seated player", () => {
  const engine = new Engine();

  engine.collectPlayerWagers();

  engine.table
    .getSeatedPlayers()
    .forEach((p) => expect(p.initialWager).toBe(DEFAULT_PLAYER_WAGER));
});

// ---- dealNewRound ----

test("dealNewRound increments the round count and deals 2 cards to everyone", () => {
  const engine = new Engine();
  engine.collectPlayerWagers();

  engine.dealNewRound();

  expect(Engine.roundCount).toBe(1);
  expect(engine.table.dealer.hand.cards).toHaveLength(2);
  engine.table
    .getSeatedPlayers()
    .forEach((p) => expect(p.hands[0]!.cards).toHaveLength(2));
});

test("dealNewRound keeps the same shoe when no reshuffle was triggered", () => {
  const engine = new Engine();
  engine.collectPlayerWagers();
  engine.shoe.newShuffle = false;
  const oldShoe = engine.shoe;

  engine.dealNewRound();

  expect(engine.shoe).toBe(oldShoe);
});

test("dealNewRound replaces the shoe once a reshuffle has been triggered", () => {
  const engine = new Engine();
  engine.collectPlayerWagers();
  engine.shoe.newShuffle = true;
  const oldShoe = engine.shoe;

  engine.dealNewRound();

  expect(engine.shoe).not.toBe(oldShoe);
});

// ---- autoExecuteTurn ----

test("autoExecuteTurn throws when the player has no dealt hand", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  player.hands = [];

  expect(() =>
    engine.autoExecuteTurn(player, DealerStrategy, makeCard("5")),
  ).toThrow();
});

test("autoExecuteTurn emits turnStart/hand:state/action and does not split when the strategy stands", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  const hand = new Hand(1, [makeCard("10"), makeCard("6")]);
  player.hands = [hand];

  const events: string[] = [];
  engine.on("player:turnStart", (name) => events.push(`turnStart:${name}`));
  engine.on("hand:state", () => events.push("hand:state"));
  engine.on("player:action", (action) => events.push(`action:${action}`));

  engine.autoExecuteTurn(player, makeFixedStrategy("Stand"), makeCard("5"));

  expect(events).toEqual([
    `turnStart:${player.name}`,
    "hand:state",
    "action:Stand",
  ]);
  expect(player.hands).toHaveLength(1);
  expect(hand.cards).toHaveLength(2);
});

test("autoExecuteTurn hits on the strategy's initial action, then defers to DealerStrategy for the rest", () => {
  const engine = new Engine();
  const player = engine.table.getSeatedPlayers()[0]!;
  const hand = new Hand(1, [makeCard("10"), makeCard("2")]); // 12
  player.hands = [hand];
  engine.table.dealer.hand.cards.push(makeCard("5"));
  engine.shoe = makeControlledShoe([makeCard("5")]); // 12 -> 17, DealerStrategy then stands

  engine.autoExecuteTurn(player, makeFixedStrategy("Hit"), makeCard("5"));

  expect(hand.cards.map((c) => c.rank)).toEqual(["10", "2", "5"]);
});

// ---- run() (integration, no split expected since DealerStrategy never returns Split) ----

test("run() plays a full round and resolves every hand", () => {
  const engine = new Engine();

  const upcards: unknown[] = [];
  engine.on("dealer:upcard", (card) => upcards.push(card));

  engine.run();

  expect(Engine.roundCount).toBe(1);
  expect(upcards).toHaveLength(1);
  expect(engine.table.dealer.hand.cards.length).toBeGreaterThanOrEqual(2);

  const players = engine.table.getSeatedPlayers();
  expect(players).toHaveLength(DEFAULT_SEATS_AT_TABLE);
  players.forEach((player) => {
    expect(player.hands.length).toBeGreaterThanOrEqual(1);
    player.hands.forEach((hand) => expect(hand.result).toBeDefined());
  });

  expect(Engine.totalWagered).toBeGreaterThan(0);
  expect(Engine.winCount + Engine.lossCount + Engine.pushCount).toBeGreaterThan(0);
});
