import { Dealer } from "./dealer.js";
import { Player } from "./player.js";

type Seat = Player | null;

export class Table {
  dealer: Dealer;
  seatCount: number;
  seats: Seat[];

  constructor(dealer: Dealer, seats: number, autoFill: boolean) {
    this.dealer = dealer;
    this.seatCount = seats;
    this.seats = [];

    if (autoFill) {
      for (let i = 0; i < this.seatCount; i++) {
        const player = new Player(`Guy ${i + 1}`, 1000);
        this.seats.push(player);
      }
    }
  }

  seatPlayer(player: Player) {
    if (this.seatCount <= this.seats.length) {
      throw new Error(`Cannot seat player because the table is full.`);
    }

    this.seats.push(player);
  }

  getSeatedPlayers(): Player[] {
    return this.seats.filter((seat) => seat !== null);
  }

  clearAllHands() {
    this.dealer.resetHand();
    this.getSeatedPlayers().forEach((player) => player.clearCards());
  }
}
