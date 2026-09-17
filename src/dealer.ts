import type { Card, Deck } from "./deck.js";
import { HandEvaluator } from "./handEvaluator.js";
import type { Player } from "./player.js";
import type { Shoe } from "./shoe.js";

export type DealerAction = "Hit" | "Stand" | "Bust";

export class Dealer {
  cards: Card[];

  constructor() {
    this.cards = [];
  }

  clearCards() {
    this.cards = [];
  }

  getShowCard() {
    if (this.cards.length === 0) {
      throw new Error("Cannot get show card from dealer with no cards.");
    }
    return this.cards[0];
  }

  deal(shoe: Shoe, players: Player[]) {
    const dealPlayersOne = () => {
      players.forEach((player) => {
        const nextCard = shoe.draw();
        player.cards.push(nextCard);
      });
    };

    const dealDealerOne = () => {
      const nextCard = shoe.draw();
      this.cards.push(nextCard);
    };

    dealPlayersOne();
    dealDealerOne();
    dealPlayersOne();
    dealDealerOne();
  }

  dealSingle(shoe: Shoe, entity: Player | Dealer) {
    const nextCard = shoe.draw();
    entity.cards.push(nextCard);
    return nextCard;
  }

  getNextDealerAction(): DealerAction {
    const currentHandValue = HandEvaluator.evaluate(this.cards);

    if (currentHandValue > 21) {
      return "Bust";
    }

    if (currentHandValue < 17) {
      return "Hit";
    } else {
      return "Stand";
    }
  }
}
