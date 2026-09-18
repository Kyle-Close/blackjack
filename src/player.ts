import type { DealerAction } from "./dealer.js";
import type { Card } from "./deck.js";
import { HandEvaluator } from "./handEvaluator.js";

export class Player {
  static id = 1;

  id: number;
  name: string;
  wallet: number;
  cards: Card[];

  constructor(name: string, amount: number) {
    this.id = Player.id++;
    this.name = name;
    this.wallet = amount;
    this.cards = [];
  }

  clearCards() {
    this.cards = [];
  }
}
