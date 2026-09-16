import type { Player } from "./player.js";

type Seat = Player | null;

export class Table {
  dealer: Dealer;
  seatCount: number;
  seats: Seat[];

  constructor(seats: number) {
    this.seatCount = seats;
    this.seats = [];
  }

  seatPlayer(player: Player) {
    if (this.seatCount <= this.seats.length) {
      throw new Error(`Cannot seat player because the table is full.`);
    }

    this.seats.push(player);
  }
}
