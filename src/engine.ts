import { Dealer } from "./dealer.js";
import { Deck, type Card } from "./deck.js";
import { HandEvaluator } from "./handEvaluator.js";
import { DEFAULT_DECKS_IN_SHOE, DEFAULT_SEATS_AT_TABLE } from "./index.js";
import { Logger } from "./logger.js";
import type { Player } from "./player.js";
import { DealerStrategy, type Action, type Decision, type PlayerAction, type Strategy } from "./playerStrategy.js";
import { Shoe } from "./shoe.js";
import { Table } from "./table.js";

export type Entity = Player | Dealer

export class Engine {
  static roundCount: number = 0;
  static playerWinCount: number = 0;
  static playerPushCount: number = 0;
  static dealerWinCount: number = 0;

  shoe: Shoe;
  table: Table;
  csvLogger: Logger;
  txtLogger: Logger;

  constructor(csvLogger: Logger, txtLogger: Logger) {
    const dealer = new Dealer();

    this.shoe = new Shoe(DEFAULT_DECKS_IN_SHOE);
    this.table = new Table(dealer, DEFAULT_SEATS_AT_TABLE, true);

    this.csvLogger = csvLogger;
    this.txtLogger = txtLogger;
  }

  run() {
    Engine.roundCount += 1;
    this.dealNewRound();

    const dealerUpCard = this.table.dealer.getUpCard();

    this.txtLogger.log(`  Dealer upcard: ${Deck.getRankShort(dealerUpCard.rank) +  Deck.getSuitShort(dealerUpCard.suit)}`)

    if (!dealerUpCard) {
      throw new Error('Dealer upcard is missing. Something went wrong.')
    }

    const players = this.table.getSeatedPlayers();

    players.forEach((player) => {
      this.autoExecuteTurn(player, DealerStrategy, dealerUpCard);
    });

    this.autoExecuteTurn(this.table.dealer, DealerStrategy, dealerUpCard);

    this.table.getSeatedPlayers().forEach((player) => {
      const result = HandEvaluator.compareHands(player, this.table.dealer);

      if (result === "Player Win") {
        Engine.playerWinCount += 1;
      } else if (result === "Dealer Win") {
        Engine.dealerWinCount += 1;
      } else {
        Engine.playerPushCount += 1;
      }

    });
  }

  // This is what runs after players have been dealt their 2 initial cards and it's now their turn to play out the rest of the hand.
  // It will play the same as the dealer for now
  autoExecuteTurn(entity: Entity, strategy: Strategy, dealerUpCard: Card) {
    if('name' in entity) {
      this.txtLogger.log(`  Simulating '${entity.name}' turn:`)
    } else {
      this.txtLogger.log(`  Simulating dealer turn:`)
    }
   
    const decision: Decision = {
      hand: entity.cards,
      legalActions: this.getAvailableActions(entity),
      dealerUpCard
    }

    this.txtLogger.log(`    ${HandEvaluator.stringifyHand(entity.cards)}`)

    let action = strategy.getNextAction(decision);

    this.txtLogger.log(`    ${action}`)

    while (action !== 'Stand') {
      if (action === "Hit") {
        this.table.dealer.dealSingle(this.shoe, entity);
      } else if (action === "Split"){

      } else if (action === "Double") {

      }

      this.txtLogger.log(`    ${HandEvaluator.stringifyHand(entity.cards)}`)

      if (HandEvaluator.evaluate(entity.cards) > 21) {
        this.txtLogger.log('    Bust')
        return;
      }
        
      action = strategy.getNextAction(decision);
      this.txtLogger.log(`    ${action}`)
    }
  }

  getAvailableActions(entity: Entity): Action[] {
    const firstCard = entity.cards[0];

    if (firstCard === undefined) {
      throw new Error('Cannot get available players actions because the player has no cards');
    }

    const result: PlayerAction[] = ['Hit', 'Stand']

    const isFirstAction = entity.cards.length === 2;
    const isDealer = !("wallet" in entity);

    if (!isFirstAction || isDealer) return result;

    result.push('Double');

    const allowSplit = entity.cards.every(card => card.value === firstCard.value)

    if (allowSplit) {
      result.push('Split');
    }

    return result;
  }

  dealNewRound() {
    this.txtLogger.log(`Round ${Engine.roundCount}:`)
    this.table.clearAllHands();

    if (this.shoe.newShuffle) {
      this.shoe = new Shoe(DEFAULT_DECKS_IN_SHOE);
    }

    this.table.dealer.deal(this.shoe, this.table.getSeatedPlayers());
  }
}
