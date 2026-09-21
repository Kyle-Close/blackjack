import { expect, test } from "vitest";
import { Deck } from "../deck.js";

test("create() builds a standard 52 card deck", () => {
  const deck = new Deck();
  expect(deck.cards).toHaveLength(52);

  const suits = new Set(deck.cards.map((c) => c.suit));
  const ranks = new Set(deck.cards.map((c) => c.rank));

  expect(suits).toEqual(new Set(["Heart", "Diamond", "Spade", "Club"]));
  expect(ranks.size).toBe(13);

  // exactly 4 of each rank
  for (const rank of ranks) {
    expect(deck.cards.filter((c) => c.rank === rank)).toHaveLength(4);
  }
});

test("create() assigns correct values: Ace=1, face cards=10, numeric cards=rank", () => {
  const deck = new Deck();

  deck.cards.forEach((card) => {
    if (card.rank === "Ace") {
      expect(card.value).toBe(1);
    } else if (["Jack", "Queen", "King"].includes(card.rank)) {
      expect(card.value).toBe(10);
    } else {
      expect(card.value).toBe(Number(card.rank));
    }
  });
});

test("shuffle() preserves the full card multiset", () => {
  const deck = new Deck();
  const before = [...deck.cards];
  const key = (c: (typeof before)[number]) => `${c.rank}-${c.suit}`;

  deck.shuffle();

  expect(deck.cards).toHaveLength(52);
  expect([...deck.cards].sort((a, b) => key(a).localeCompare(key(b)))).toEqual(
    [...before].sort((a, b) => key(a).localeCompare(key(b))),
  );
});

test("getRankShort maps face ranks to single letters and passes through others", () => {
  expect(Deck.getRankShort("Ace")).toBe("A");
  expect(Deck.getRankShort("King")).toBe("K");
  expect(Deck.getRankShort("Queen")).toBe("Q");
  expect(Deck.getRankShort("Jack")).toBe("J");
  expect(Deck.getRankShort("10")).toBe("10");
  expect(Deck.getRankShort("7")).toBe("7");
});

test("getSuitShort maps suits to their unicode symbols", () => {
  expect(Deck.getSuitShort("Spade")).toBe("♠");
  expect(Deck.getSuitShort("Club")).toBe("♣");
  expect(Deck.getSuitShort("Heart")).toBe("♥");
  expect(Deck.getSuitShort("Diamond")).toBe("♦");
});

test("getRank throws for an out-of-range index", () => {
  const deck = new Deck();
  expect(() => deck.getRank(13)).toThrow();
  expect(() => deck.getRank(-1)).toThrow();
});

test("getSuit throws for an out-of-range index", () => {
  const deck = new Deck();
  expect(() => deck.getSuit(4)).toThrow();
  expect(() => deck.getSuit(-1)).toThrow();
});
