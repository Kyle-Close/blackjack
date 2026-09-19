import type { Card } from "./deck.js";
import { HandEvaluator } from "./handEvaluator.js";
import { Hand, type Player } from "./player.js";
import type { Decision, Strategy } from "./playerStrategy.js";
import type { Shoe } from "./shoe.js";

export type DealerAction = "Hit" | "Stand";

export class Dealer {
  hand: Hand;

  constructor() {
    this.hand = new Hand();
  }

  resetHand() {
    this.hand = new Hand();
  }

  getUpCard() {
    const showCard = this.hand.cards[0];

    if (!showCard) {
      throw new Error("Cannot get show card from dealer with no cards.");
    }

    return showCard;
  }

  dealTable(shoe: Shoe, players: Player[]) {
    const initPlayerHands = () => {
      players.forEach((player) => {
        if (player.initialWager === null)
          throw new Error("Cannot deal to player who has not wagered");

        player.hands.push(new Hand(player.initialWager));
      });
    };

    const dealPlayersOne = () => {
      players.forEach((player) => {
        const nextCard = shoe.draw();
        const playerHand = player.hands[0];

        if (playerHand === undefined)
          throw new Error("Cannot deal player - no hands");

        playerHand.cards.push(nextCard);
      });
    };

    const dealDealerOne = () => {
      const nextCard = shoe.draw();
      this.hand.cards.push(nextCard);
    };

    initPlayerHands();

    dealPlayersOne();
    dealDealerOne();
    dealPlayersOne();
    dealDealerOne();
  }

  dealSingle(shoe: Shoe, hand: Hand) {
    const nextCard = shoe.draw();
    hand.cards.push(nextCard);
    return nextCard;
  }

  executeTurn(shoe: Shoe, strategy: Strategy) {
    const decision: Decision = {
      hand: this.hand.cards,
      legalActions: ["Hit", "Stand"],
      dealerUpCard: this.getUpCard(),
    };

    let action = strategy.getNextAction(decision);

    while (action !== "Stand") {
      if (action === "Hit") {
        this.dealSingle(shoe, this.hand);
      }

      if (HandEvaluator.evaluate(this.hand.cards) > 21) return;
      action = strategy.getNextAction(decision);
    }
  }
}
