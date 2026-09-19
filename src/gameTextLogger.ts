import { Deck } from "./deck.js";
import type { Engine } from "./engine.js";
import { HandEvaluator } from "./handEvaluator.js";
import { Logger } from "./logger.js";

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
