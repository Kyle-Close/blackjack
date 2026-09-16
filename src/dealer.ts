import type { Card, Deck } from "./deck.js";
import type { Table } from "./table.js";

export class Dealer {
  cards: Card[];

  constructor() {
    this.cards = [];
  }

  deal(deck: Deck, table: Table) {
    // Deal 1 card to each player
    // Deal 1 card to dealer (face up)
    // Deal 1 card to each player
    // Deal 1 card to dealer (face down)

    table.seats.forEach((player) => {
      const nextCard = deck.cards.pop();
      if (!nextCard) {
        throw new Error("The deck is empty!");
      }
      player?.cards.push(nextCard);
    });
  }
}
