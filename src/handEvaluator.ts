import type { Dealer } from "./dealer.js";
import type { Card } from "./deck.js";
import type { Player } from "./player.js";

type CompareHandResult = "Player Win" | "Dealer Win" | "Push";

export class HandEvaluator {
  public static evaluate(cards: Card[]) {
    let sum = 0;
    let aceCount = 0;

    cards.forEach((card) => {
      if (card.value === 1) {
        aceCount++;
      } else {
        sum += card.value;
      }
    });

    for (let i = 0; i < aceCount; i++) {
      if (sum + 11 > 21) {
        sum += 1;
      } else {
        sum += 11;
      }
    }

    return sum;
  }


  public static compareHands(player: Player, dealer: Dealer): CompareHandResult {
    const playerHandValue = HandEvaluator.evaluate(player.cards);
    const dealerHandValue = HandEvaluator.evaluate(dealer.cards);

    if (playerHandValue > 21) {
      return 'Dealer Win'
    } else if (dealerHandValue > 21) {
      return 'Player Win'
    } else if (playerHandValue === dealerHandValue) {
      return "Push";
    } else if (playerHandValue > dealerHandValue) {
      return "Player Win";
    } else {
      return "Dealer Win";
    }
  }
}
