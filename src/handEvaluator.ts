import type { Card } from "./deck.js";

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
}
