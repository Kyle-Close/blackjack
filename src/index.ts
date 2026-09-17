import { Engine } from "./engine.js";
import { Logger } from "./logger.js";
import { existsSync } from 'node:fs'

export const ROUNDS_TO_RUN = 100000;
export const DEFAULT_DECKS_IN_SHOE = 4;
export const DEFAULT_SEATS_AT_TABLE = 6;

let logger: Logger;
const loggerFilePath = 'data.csv'
const header = "timestamp,strategy,decks,hands,totalWagered,netResult";

if (!existsSync(loggerFilePath)) {
  logger = new Logger('data.csv');
  logger.log(header);
} else {
  logger = new Logger('data.csv');
}

const engine = new Engine(logger);

for (let i = 0; i < ROUNDS_TO_RUN; i++) {
  engine.run();
}


const timeStamp = new Date().toISOString().slice(0, 16);
const strategy = 'dealer';
const decks = DEFAULT_DECKS_IN_SHOE;
const hands = DEFAULT_SEATS_AT_TABLE * ROUNDS_TO_RUN;
const totalWagered = hands; // Assume $1 wagered for each hand for now. in future will need to handle dbls
const netResult = Engine.playerWinCount * 2;

logger.log(`${timeStamp},${strategy},${decks},${hands},${totalWagered},${netResult}`)

await logger.close();
