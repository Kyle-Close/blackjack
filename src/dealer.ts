import type { Card, Deck } from "./deck.js";
import type { Player } from "./player.js";
import type { Shoe } from "./shoe.js";

type DealerAction = "Hit" | "Stand";

export class Dealer {
  cards: Card[];

  constructor() {
    this.cards = [];
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

  getNextDealerAction(): DealerAction {
    const currentHandValue = this.cards.reduce(
      (accumulator, currentCard) => accumulator + currentCard.value,
      0,
    );

    if (currentHandValue > 21) {
      throw new Error(
        `Cannot get next dealer action as the dealer has already busted with: ${currentHandValue}`,
      );
    }

    if (currentHandValue < 17) {
      return "Hit";
    } else {
      return "Stand";
    }
  }
}
