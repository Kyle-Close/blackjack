import { Dealer } from "./dealer.js";
import { HandEvaluator } from "./handEvaluator.js";
import { DEFAULT_DECKS_IN_SHOE, DEFAULT_SEATS_AT_TABLE } from "./index.js";
import { Logger } from "./logger.js";
import type { Player } from "./player.js";
import { Shoe } from "./shoe.js";
import { Table } from "./table.js";



export class Engine {
  static playerWinCount: number = 0;
  static playerPushCount: number = 0;
  static dealerWinCount: number = 0;

  shoe: Shoe;
  table: Table;
  logger: Logger;

  constructor(logger: Logger) {
    const dealer = new Dealer();

    this.shoe = new Shoe(DEFAULT_DECKS_IN_SHOE);
    this.table = new Table(dealer, DEFAULT_SEATS_AT_TABLE, true);
    this.logger = logger;
  }

  run() {
    this.dealHand();

    const dealerShowCard = this.table.dealer.getShowCard();
    const players = this.table.getSeatedPlayers();

    players.forEach((player) => {
      this.autoExecuteTurn(player);
    });

    this.autoExecuteTurn(this.table.dealer);

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
  autoExecuteTurn(entity: Player | Dealer) {
    let action = entity.getNextDealerAction();

    while (action === "Hit") {
      this.table.dealer.dealSingle(this.shoe, entity);
      action = entity.getNextDealerAction();
    }
  }

  dealHand() {
    // 1. Reset player cards & dealer cards
    this.table.clearAllHands();

    // 2. Check if the shoe needs reshuffled before dealing
    if (this.shoe.newShuffle) {
      this.shoe = new Shoe(DEFAULT_DECKS_IN_SHOE);
    }

    // 3. Deal cards
    this.table.dealer.deal(this.shoe, this.table.getSeatedPlayers());
  }
}
