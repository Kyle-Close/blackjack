import type { Dealer } from "./dealer.js";
import { Deck, type Card } from "./deck.js";
import type { Hand, Player } from "./player.js";

export type HandResult = "Player Win" | "Dealer Win" | "Push" | "BJ";

export class HandEvaluator {
  public static evaluate(cards: Card[]) {
    let sumWithoutAces = 0;
    let aceCount = 0;

    cards.forEach((card) => {
      if (card.rank === "Ace") {
        aceCount++;
      } else {
        sumWithoutAces += card.value;
      }
    });

    if (aceCount > 0 && sumWithoutAces + aceCount <= 11) {
      return sumWithoutAces + aceCount + 10;
    }

    return sumWithoutAces + aceCount;
  }

  public static compareHands(playerHand: Hand, dealerHand: Hand): HandResult {
    const playerHandValue = HandEvaluator.evaluate(playerHand.cards);
    const dealerHandValue = HandEvaluator.evaluate(dealerHand.cards);

    const playerBJ = this.isBJ(playerHand.cards);
    const dealerBJ = this.isBJ(dealerHand.cards);

    if (playerBJ && !dealerBJ) {
      return "BJ";
    } else if (!playerBJ && dealerBJ) {
      return "Dealer Win";
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

  private static isBJ(cards: Card[]) {
    return cards.length === 2 && HandEvaluator.evaluate(cards) === 21;
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
