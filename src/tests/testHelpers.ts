import type { Card, Rank, Suit } from "../deck.js";
import type { Action, Decision, Strategy } from "../playerStrategy.js";
import { Shoe } from "../shoe.js";

export function makeCard(rank: Rank, suit: Suit = "Heart"): Card {
  let value: number;

  if (rank === "Ace") {
    value = 1;
  } else if (rank === "Jack" || rank === "Queen" || rank === "King") {
    value = 10;
  } else {
    value = Number(rank);
  }

  return { rank, suit, value };
}

/**
 * Builds a Shoe whose cards are drawn in the exact order given,
 * and that never triggers a mid-test reshuffle.
 */
export function makeControlledShoe(drawOrder: Card[]): Shoe {
  const shoe = new Shoe(1);
  shoe.cards = [...drawOrder].reverse();
  shoe.cutCardPosition = shoe.cards.length;
  return shoe;
}

/** A Strategy that returns each action in order, then throws if asked for more. */
export function makeScriptedStrategy(actions: Action[]): Strategy {
  let index = 0;
  return {
    name: "scripted",
    getNextAction: (_decision: Decision) => {
      const action = actions[index];
      if (action === undefined) {
        throw new Error("Scripted strategy ran out of actions");
      }
      index++;
      return action;
    },
  };
}

export function makeFixedStrategy(action: Action): Strategy {
  return { name: "fixed", getNextAction: () => action };
}

export function makeStrategyThatShouldNotBeCalled(): Strategy {
  return {
    name: "should-not-be-called",
    getNextAction: () => {
      throw new Error("Strategy should not have been consulted");
    },
  };
}
