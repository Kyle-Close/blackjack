import type { Card } from "./deck.js";
import type { HandResult } from "./handEvaluator.js";

export class Player {
  static id = 1;

  id: number;
  name: string;
  wallet: number;
  hands: Hand[];
  initialWager: number | null;

  constructor(name: string, amount: number) {
    this.id = Player.id++;
    this.name = name;
    this.wallet = amount;
    this.hands = [];
    this.initialWager = null;
  }

  clearCards() {
    this.hands = [];
  }

  setWager(wager: number) {
    this.initialWager = wager;
  }
}

export class Hand {
  cards: Card[];
  hasDoubled: boolean;
  wager: number;
  result: HandResult | undefined;
  isBlackJack: boolean;

  constructor(wager: number, cards?: Card[]) {
    this.cards = cards ?? [];
    this.hasDoubled = false;
    this.wager = wager;
    this.isBlackJack = false;
  }
}
