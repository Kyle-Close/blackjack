import { Dealer } from "./dealer.js";
import { Deck, type Card } from "./deck.js";
import { HandEvaluator } from "./handEvaluator.js";
import {
  DEFAULT_DECKS_IN_SHOE,
  DEFAULT_PLAYER_WAGER,
  DEFAULT_SEATS_AT_TABLE,
} from "./index.js";
import { Logger } from "./logger.js";
import type { Hand, Player } from "./player.js";
import {
  DealerStrategy,
  type Action,
  type Decision,
  type Strategy,
} from "./playerStrategy.js";
import { Shoe } from "./shoe.js";
import { Table } from "./table.js";

export type Entity = Player | Dealer;

export class Engine {
  static roundCount: number = 0;

  static totalWagered: number = 0;
  static netResult: number = 0;

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
    this.collectPlayerWagers();
    this.dealNewRound();

    const dealerUpCard = this.table.dealer.getUpCard();

    this.txtLogger.log(
      `  Dealer upcard: ${Deck.getRankShort(dealerUpCard.rank) + Deck.getSuitShort(dealerUpCard.suit)}`,
    );

    if (!dealerUpCard) {
      throw new Error("Dealer upcard is missing. Something went wrong.");
    }

    const players = this.table.getSeatedPlayers();

    players.forEach((player) => {
      this.autoExecuteTurn(player, DealerStrategy, dealerUpCard);
    });

    this.table.dealer.executeTurn(this.shoe, DealerStrategy);

    this.txtLogger.log(
      `  Dealer Hand: ${HandEvaluator.stringifyHand(this.table.dealer.hand.cards)}`,
    );

    this.updateHandResults();
    this.updateStaticResults(players);
  }

  collectPlayerWagers() {
    this.table
      .getSeatedPlayers()
      .forEach((player) => player.setWager(DEFAULT_PLAYER_WAGER));
  }

  updateHandResults() {
    const players = this.table.getSeatedPlayers();

    players.forEach((player) => {
      player.hands.forEach((hand) => {
        hand.result = HandEvaluator.compareHands(hand, this.table.dealer.hand);
      });
    });
  }

  updateStaticResults(players: Player[]) {
    players.forEach((player) => {
      player.hands.forEach((hand) => {
        Engine.totalWagered += hand.wager;

        switch (hand.result) {
          case "Dealer Win":
            Engine.netResult -= hand.wager;
            break;
          case "Player Win":
            Engine.netResult += hand.wager;
            break;
          case "Push":
            break;
          default:
            throw new Error(
              "Cannot update engine statics - Hand result is null",
            );
        }
      });
    });
  }

  autoExecuteTurn(player: Player, strategy: Strategy, dealerUpCard: Card) {
    const dealtHand = player.hands[0];
    if (dealtHand === undefined)
      throw new Error("Cannot execute player turn - no hands");

    this.txtLogger.log(`  Simulating '${player.name}' turn:`);

    const decision: Decision = {
      hand: dealtHand.cards,
      legalActions: this.getAvailablePlayerActions(player),
      dealerUpCard,
    };

    this.txtLogger.log(`    ${HandEvaluator.stringifyHand(dealtHand.cards)}`);

    let action = strategy.getNextAction(decision);
    this.txtLogger.log(`    ${action}`);

    const didSplit = this.playHand(player, action, dealtHand, DealerStrategy);

    if (didSplit) {
      const splitHand = player.hands[1];

      if (splitHand === undefined)
        throw new Error("Player split hand but no 2nd hand found");

      this.playHand(player, action, splitHand, DealerStrategy);
    }
  }

  playHand(
    player: Player,
    action: Action,
    hand: Hand,
    strategy: Strategy,
  ): boolean {
    let didSplit = false;

    while (action !== "Stand") {
      if (action === "Hit") {
        this.table.dealer.dealSingle(this.shoe, hand);
      } else if (action === "Split") {
        didSplit = true;
      } else if (action === "Double") {
        this.table.dealer.dealSingle(this.shoe, hand);
        hand.hasDoubled = true;
        hand.wager *= 2;
      }

      this.txtLogger.log(`    ${HandEvaluator.stringifyHand(hand.cards)}`);

      if (HandEvaluator.evaluate(hand.cards) > 21) {
        this.txtLogger.log("    Bust");
        return didSplit;
      }

      const decision: Decision = {
        hand: hand.cards,
        dealerUpCard: this.table.dealer.getUpCard(),
        legalActions: this.getAvailablePlayerActions(player),
      };
      action = strategy.getNextAction(decision);
      this.txtLogger.log(`    ${action}`);
    }

    return didSplit;
  }

  getAvailablePlayerActions(player: Player): Action[] {
    const dealtHand = player.hands[0];

    if (dealtHand === undefined) {
      throw new Error(
        "Cannot get available players actions because the player has no cards",
      );
    }

    const isFirstAction =
      player.hands.length === 1 && dealtHand.cards.length === 2;

    const allowSplit =
      isFirstAction &&
      dealtHand.cards.every((card) => card.value === dealtHand.cards[0]?.value);

    const res: Action[] = ["Hit", "Stand"];

    if (isFirstAction) res.push("Double");
    if (allowSplit) res.push("Split");

    return res;
  }

  dealNewRound() {
    Engine.roundCount += 1;
    this.txtLogger.log(`Round ${Engine.roundCount}:`);
    this.table.clearAllHands();

    if (this.shoe.newShuffle) {
      this.shoe = new Shoe(DEFAULT_DECKS_IN_SHOE);
    }

    this.table.dealer.dealTable(this.shoe, this.table.getSeatedPlayers());
  }
}
