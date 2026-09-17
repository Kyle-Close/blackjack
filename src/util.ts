import type { Card } from "./deck.js";

export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}

export function getCutCardIndex(cards: Card[]) {
  const min = Math.floor(cards.length / 2);
  const max = Math.floor(cards.length * 0.75);
  return min + Math.floor(Math.random() * (max - min + 1));
}
