import { shuffleArray } from "./util.js";

export type Suit = "Heart" | "Diamond" | "Spade" | "Club";
export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "Jack"
  | "Queen"
  | "King"
  | "Ace";

export type Card = {
  suit: Suit;
  rank: Rank;
  value: number;
};

export class Deck {
  cards: Card[];
  constructor() {
    this.cards = this.create();
  }

  print() {
    this.cards.forEach((card) =>
      console.log(
        `card: {\n suit: ${card.suit},\n rank: ${card.rank},\n value: ${card.value}\n}`,
      ),
    );
  }

  shuffle() {
    this.cards = shuffleArray(this.cards);
  }

  create(): Card[] {
    const newDeck: Card[] = [];
    for (let i = 0; i < 13; i++) {
      let value = i + 2 > 10 ? 10 : i + 2;

      if (i === 12) {
        value = 1;
      }

      const rank = this.getRank(i);

      for (let j = 0; j < 4; j++) {
        const suit = this.getSuit(j);
        const newCard: Card = {
          suit,
          rank,
          value,
        };
        newDeck.push(newCard);
      }
    }

    return newDeck;
  }

  getSuit(index: number): Suit {
    switch (index) {
      case 0:
        return "Heart";
      case 1:
        return "Diamond";
      case 2:
        return "Spade";
      case 3:
        return "Club";
      default:
        throw new Error(`Invalid index passed to getSuit: ${index}`);
    }
  }

  getRank(index: number): Rank {
    switch (index) {
      case 0:
        return "2";
      case 1:
        return "3";
      case 2:
        return "4";
      case 3:
        return "5";
      case 4:
        return "6";
      case 5:
        return "7";
      case 6:
        return "8";
      case 7:
        return "9";
      case 8:
        return "10";
      case 9:
        return "Jack";
      case 10:
        return "Queen";
      case 11:
        return "King";
      case 12:
        return "Ace";
      default:
        throw new Error(`Invalid index passed to getRank: ${index}`);
    }
  }

  public static getRankShort(rank: Rank): string {
    switch(rank) {
      case 'Ace':
        return 'A';
      case 'King':
        return 'K';
      case 'Queen':
        return 'Q';
      case 'Jack':
        return 'J';
      default:
        return rank;
    }
  }

  public static getSuitShort(suit: Suit) {
    switch(suit) {
      case 'Spade':
        return '\u2660'
      case 'Club':
        return '\u2663'
      case 'Heart':
        return '\u2666'
      case 'Diamond':
        return '\u2663'
    }
  }
}
