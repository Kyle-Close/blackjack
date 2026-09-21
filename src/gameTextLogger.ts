import { Deck, type Card } from "./deck.js";
import type { Engine } from "./engine.js";
import { HandEvaluator } from "./handEvaluator.js";
import { Logger } from "./logger.js";
import type { Action } from "./playerStrategy.js";

export type EngineEvents = {
  "round:start": [roundNumber: number];
  "dealer:upcard": [card: Card];
  "player:turnStart": [playerName: string];
  "hand:state": [cards: Card[]];
  "player:action": [action: Action];
  "hand:bust": [];
  "dealer:hand": [cards: Card[]];
};

export function attachGameTextLogger(engine: Engine, logger: Logger) {
  engine.on("round:start", (roundNumber) => {
    logger.log(`Round ${roundNumber}:`);
  });

  engine.on("dealer:upcard", (card) => {
    logger.log(
      `  Dealer upcard: ${Deck.getRankShort(card.rank)}${Deck.getSuitShort(card.suit)}`,
    );
  });

  engine.on("player:turnStart", (playerName) => {
    logger.log(`  Simulating '${playerName}' turn:`);
  });

  engine.on("hand:state", (cards) => {
    logger.log(`    ${HandEvaluator.stringifyHand(cards)}`);
  });

  engine.on("player:action", (action) => {
    logger.log(`    ${action}`);
  });

  engine.on("hand:bust", () => {
    logger.log("    Bust");
  });

  engine.on("dealer:hand", (cards) => {
    logger.log(`  Dealer Hand: ${HandEvaluator.stringifyHand(cards)}`);
  });
}
