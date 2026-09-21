import { Engine } from "./engine.js";
import { attachGameTextLogger } from "./gameTextLogger.js";
import { Logger } from "./logger.js";
import { existsSync } from "node:fs";
import { DEFAULT_DECKS_IN_SHOE, DEFAULT_SEATS_AT_TABLE, ROUNDS_TO_RUN } from "./config.js";

let csvLogger: Logger;
let txtLogger: Logger;

const csvLoggerFilePath = "data.csv";
const txtLoggerFilePath = "log.txt";

const csvHeader =
  "timestamp,strategy,decks,hands,totalWagered,netResult,houseEdge";

if (!existsSync(csvLoggerFilePath)) {
  csvLogger = new Logger(csvLoggerFilePath);
  csvLogger.log(csvHeader);
} else {
  csvLogger = new Logger(csvLoggerFilePath);
}

txtLogger = new Logger(txtLoggerFilePath);

const engine = new Engine();
attachGameTextLogger(engine, txtLogger);

for (let i = 0; i < ROUNDS_TO_RUN; i++) {
  engine.run();
}

const timeStamp = new Date().toISOString().slice(0, 16);
const strategy = "dealer";
const decks = DEFAULT_DECKS_IN_SHOE;
const hands = DEFAULT_SEATS_AT_TABLE * ROUNDS_TO_RUN;
const houseEdge = (-Engine.netResult / Engine.totalWagered) * 100;

csvLogger.log(
  `${timeStamp},${strategy},${decks},${hands},${Engine.totalWagered},${Engine.netResult},${houseEdge.toFixed(2)}%`,
);

console.log("Win Count: ", Engine.winCount);
console.log("Loss Count: ", Engine.lossCount);
console.log("Push Count: ", Engine.pushCount);

await csvLogger.close();
