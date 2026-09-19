import type { DealerAction } from "./dealer.js";
import type { Card } from "./deck.js";
import { HandEvaluator } from "./handEvaluator.js";

export type PlayerAction = "Hit" | "Stand" | "Split" | "Double";
export type Action = PlayerAction | DealerAction;

export interface Decision {
  hand: Card[];
  dealerUpCard: Card;
  legalActions: PlayerAction[];
}

export interface Strategy {
  readonly name: string;
  getNextAction: (decision: Decision) => Action;
}

function selectAvailableAction(
  action: Action,
  availableActions: Action[],
): Action {
  if (availableActions.includes(action)) {
    return action;
  }
  throw new Error(`Cannot select action: ${action} as it's not available.`);
}

export const DealerStrategy: Strategy = {
  name: "dealer",
  getNextAction: (decision: Decision) => {
    const currentHandValue = HandEvaluator.evaluate(decision.hand);

    if (currentHandValue < 17) {
      return selectAvailableAction("Hit", decision.legalActions);
    } else {
      return selectAvailableAction("Stand", decision.legalActions);
    }
  },
};

export const BasicStrategy: Strategy = {
  name: "basic",
  getNextAction: (decision: Decision) => {
    return "Hit";
  },
};
