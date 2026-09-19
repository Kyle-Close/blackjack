import { EventEmitter } from "node:events";
import { Dealer } from "./dealer.js";
import type { Card } from "./deck.js";
import { HandEvaluator } from "./handEvaluator.js";
import {
  BLACK_JACK_MULTIPLIER,
  DEFAULT_DECKS_IN_SHOE,
  DEFAULT_PLAYER_WAGER,
  DEFAULT_SEATS_AT_TABLE,
} from "./index.js";
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

export type EngineEvents = {
  "round:start": [roundNumber: number];
  "dealer:upcard": [card: Card];
  "player:turnStart": [playerName: string];
  "hand:state": [cards: Card[]];
  "player:action": [action: Action];
  "hand:bust": [];
  "dealer:hand": [cards: Card[]];
};

export class Engine extends EventEmitter<EngineEvents> {
  static roundCount: number = 0;

  static totalWagered: number = 0;
  static netResult: number = 0;

  static winCount: number = 0;
  static lossCount: number = 0;
  static pushCount: number = 0;

  shoe: Shoe;
  table: Table;

  constructor() {
    super();

    const dealer = new Dealer();

    this.shoe = new Shoe(DEFAULT_DECKS_IN_SHOE);
    this.table = new Table(dealer, DEFAULT_SEATS_AT_TABLE, true);
  }

  run() {
    this.collectPlayerWagers();
    this.dealNewRound();

    const dealerUpCard = this.table.dealer.getUpCard();

    if (!dealerUpCard) {
      throw new Error("Dealer upcard is missing. Something went wrong.");
    }

    this.emit("dealer:upcard", dealerUpCard);

    const players = this.table.getSeatedPlayers();

    players.forEach((player) => {
      this.autoExecuteTurn(player, DealerStrategy, dealerUpCard);
    });

    this.table.dealer.executeTurn(this.shoe, DealerStrategy);

    this.emit("dealer:hand", this.table.dealer.hand.cards);

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
          case "BJ":
            Engine.winCount += 1;
            Engine.netResult += hand.wager * BLACK_JACK_MULTIPLIER;
            break;
          case "Dealer Win":
            Engine.lossCount += 1;
            Engine.netResult -= hand.wager;
            break;
          case "Player Win":
            Engine.winCount += 1;
            Engine.netResult += hand.wager;
            break;
          case "Push":
            Engine.pushCount += 1;
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

    this.emit("player:turnStart", player.name);

    const decision: Decision = {
      hand: dealtHand.cards,
      legalActions: this.getAvailablePlayerActions(player),
      dealerUpCard,
    };

    this.emit("hand:state", dealtHand.cards);

    let action = strategy.getNextAction(decision);
    this.emit("player:action", action);

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

    if (this.isBJ(hand)) {
      hand.isBlackJack = true;
      return didSplit;
    }

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

      this.emit("hand:state", hand.cards);

      if (HandEvaluator.evaluate(hand.cards) > 21) {
        this.emit("hand:bust");
        return didSplit;
      }

      const decision: Decision = {
        hand: hand.cards,
        dealerUpCard: this.table.dealer.getUpCard(),
        legalActions: this.getAvailablePlayerActions(player),
      };
      action = strategy.getNextAction(decision);
      this.emit("player:action", action);
    }

    return didSplit;
  }

  isBJ(hand: Hand) {
    return hand.cards.length === 2 && HandEvaluator.evaluate(hand.cards) === 21;
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
    this.emit("round:start", Engine.roundCount);
    this.table.clearAllHands();

    if (this.shoe.newShuffle) {
      this.shoe = new Shoe(DEFAULT_DECKS_IN_SHOE);
    }

    this.table.dealer.dealTable(this.shoe, this.table.getSeatedPlayers());
  }
}
