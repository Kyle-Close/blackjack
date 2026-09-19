import type { Card } from "./deck.js";

export class Player {
  static id = 1;

  id: number;
  name: string;
  wallet: number;
  hands: Hand[];

  constructor(name: string, amount: number) {
    this.id = Player.id++;
    this.name = name;
    this.wallet = amount;
    this.hands = [];
  }

  clearCards() {
    this.hands = [];
  }
}

export class Hand {
  cards: Card[];
  hasDoubled: boolean;
  wager: number;

  constructor(cards?: Card[]) {
    this.cards = cards ?? [];
    this.hasDoubled = false;
    this.wager = 0;
  }
}
