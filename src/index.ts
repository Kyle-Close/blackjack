import { Engine } from "./engine.js";

export const HANDS_TO_PLAY = 1000;

const engine = new Engine();

for (let i = 0; i < HANDS_TO_PLAY; i++) {
  engine.run();
}


console.log(`Player stats after simulating ${HANDS_TO_PLAY * 6} hands`);
console.log(`Player wins: ${Engine.playerWinCount}`)
console.log(`Dealer wins: ${Engine.dealerWinCount}`)
console.log(`Player pushes: ${Engine.playerPushCount}`)
