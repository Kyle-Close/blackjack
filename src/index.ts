import { Engine } from "./engine.js";
import { Logger } from "./logger.js";
import { existsSync } from "node:fs";

export const ROUNDS_TO_RUN = 10000;
export const DEFAULT_DECKS_IN_SHOE = 4;
export const DEFAULT_SEATS_AT_TABLE = 6;
export const DEFAULT_PLAYER_WAGER = 1;

let csvLogger: Logger;
let txtLogger: Logger;

const csvLoggerFilePath = "data.csv";
const txtLoggerFilePath = "log.txt";

const csvHeader = "timestamp,strategy,decks,hands,totalWagered,netResult";

if (!existsSync(csvLoggerFilePath)) {
  csvLogger = new Logger(csvLoggerFilePath);
  csvLogger.log(csvHeader);
} else {
  csvLogger = new Logger(csvLoggerFilePath);
}

txtLogger = new Logger(txtLoggerFilePath);

const engine = new Engine(csvLogger, txtLogger);

for (let i = 0; i < ROUNDS_TO_RUN; i++) {
  engine.run();
}

const timeStamp = new Date().toISOString().slice(0, 16);
const strategy = "dealer";
const decks = DEFAULT_DECKS_IN_SHOE;
const hands = DEFAULT_SEATS_AT_TABLE * ROUNDS_TO_RUN;

csvLogger.log(
  `${timeStamp},${strategy},${decks},${hands},${Engine.totalWagered},${Engine.netResult}`,
);

await csvLogger.close();
