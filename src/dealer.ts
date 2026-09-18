import type { Card } from "./deck.js";
import type { Player } from "./player.js";
import type { Shoe } from "./shoe.js";

export type DealerAction = "Hit" | "Stand"

export class Dealer {
  cards: Card[];

  constructor() {
    this.cards = [];
  }

  clearCards() {
    this.cards = [];
  }

  getUpCard() {
    const showCard = this.cards[0];
    if (!showCard) {
      throw new Error("Cannot get show card from dealer with no cards.");
    }
    return showCard;
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
}
