import type { Dealer } from "./dealer.js";
import { Deck, type Card } from "./deck.js";
import type { Hand, Player } from "./player.js";

export type HandResult = "Player Win" | "Dealer Win" | "Push" | "BJ";

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

  public static compareHands(playerHand: Hand, dealerHand: Hand): HandResult {
    const playerHandValue = HandEvaluator.evaluate(playerHand.cards);
    const dealerHandValue = HandEvaluator.evaluate(dealerHand.cards);

    if (
      playerHand.cards.length === 2 &&
      HandEvaluator.evaluate(playerHand.cards) === 21 &&
      !(
        dealerHand.cards.length === 2 &&
        HandEvaluator.evaluate(dealerHand.cards) === 21
      )
    ) {
      return "BJ";
    } else if (playerHandValue > 21) {
      return "Dealer Win";
    } else if (dealerHandValue > 21) {
      return "Player Win";
    } else if (playerHandValue === dealerHandValue) {
      return "Push";
    } else if (playerHandValue > dealerHandValue) {
      return "Player Win";
    } else {
      return "Dealer Win";
    }
  }

  public static stringifyHand(hand: Card[]) {
    let shorts: string[] = [];

    hand.forEach((card) => {
      const short = Deck.getRankShort(card.rank) + Deck.getSuitShort(card.suit);
      shorts.push(short);
    });

    return `${shorts.join(" -> ")} = ${HandEvaluator.evaluate(hand)}`;
  }
}
