import type { Card } from "./deck.js";

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
}
