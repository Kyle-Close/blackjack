import { Dealer } from "./dealer.js";
import { HandEvaluator } from "./handEvaluator.js";
import type { Player } from "./player.js";
import { Shoe } from "./shoe.js";
import { Table } from "./table.js";

const DEFAULT_DECKS_IN_SHOE = 4;
const DEFAULT_SEATS_AT_TABLE = 6;

export class Engine {
  shoe: Shoe;
  table: Table;

  constructor() {
    const dealer = new Dealer();

    this.shoe = new Shoe(DEFAULT_DECKS_IN_SHOE);
    this.table = new Table(dealer, DEFAULT_SEATS_AT_TABLE, true);
  }

  run() {
    this.dealHand();

    const dealerShowCard = this.table.dealer.getShowCard();
    const players = this.table.getSeatedPlayers();

    players.forEach((player) => {
      this.autoExecuteTurn(player);
    });

    this.autoExecuteTurn(this.table.dealer);

    console.log(
      `Dealer Total: ${HandEvaluator.evaluate(this.table.dealer.cards)}`,
    );

    this.table.getSeatedPlayers().forEach((player) => {
      console.log(`${player.name}: ${HandEvaluator.evaluate(player.cards)}`);
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
