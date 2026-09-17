import { Deck, type Card } from "./deck.js";
import { getCutCardIndex } from "./util.js";

export class Shoe {
  cards: Card[];
  cutCardPosition: number;
  newShuffle: boolean;
  deckCount: number;

  constructor(deckCount: number) {
    if (deckCount < 1) {
      throw new Error("Cannot initialize a shoe with less than 1 deck.");
    }

    this.newShuffle = false;
    this.deckCount = deckCount;
    this.cards = [];

    for (let i = 0; i < deckCount; i++) {
      const deck = new Deck();
      deck.shuffle();
      this.cards.push(...deck.cards);
    }

    this.cutCardPosition = getCutCardIndex(this.cards);
  }

  draw(): Card {
    if (this.cutCardPosition === 0) {
      this.newShuffle = true;
    }

    const card = this.cards.pop();

    if (card === undefined) {
      throw new Error(`Cannot draw from the shoe as it's empty`);
    }

    this.cutCardPosition--;

    return card;
  }
}
