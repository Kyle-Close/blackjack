import { expect, test } from "vitest";
import { DealerStrategy, type Decision } from "../playerStrategy.js";
import { makeCard } from "./testHelpers.js";

test("DealerStrategy hits on hand values below 17", () => {
  const decision: Decision = {
    hand: [makeCard("10"), makeCard("6")],
    dealerUpCard: makeCard("5"),
    legalActions: ["Hit", "Stand"],
  };

  expect(DealerStrategy.getNextAction(decision)).toBe("Hit");
});

test("DealerStrategy stands on exactly 17 (edge of the hit/stand boundary)", () => {
  const decision: Decision = {
    hand: [makeCard("10"), makeCard("7")],
    dealerUpCard: makeCard("5"),
    legalActions: ["Hit", "Stand"],
  };

  expect(DealerStrategy.getNextAction(decision)).toBe("Stand");
});

test("DealerStrategy stands above 17", () => {
  const decision: Decision = {
    hand: [makeCard("10"), makeCard("9")],
    dealerUpCard: makeCard("5"),
    legalActions: ["Hit", "Stand"],
  };

  expect(DealerStrategy.getNextAction(decision)).toBe("Stand");
});

test("DealerStrategy treats a soft hand using the ace-high total", () => {
  // Ace + 6 = soft 17, should stand
  const decision: Decision = {
    hand: [makeCard("Ace"), makeCard("6")],
    dealerUpCard: makeCard("5"),
    legalActions: ["Hit", "Stand"],
  };

  expect(DealerStrategy.getNextAction(decision)).toBe("Stand");
});

test("throws when the chosen action is not in the legal actions list", () => {
  const decision: Decision = {
    hand: [makeCard("2"), makeCard("3")],
    dealerUpCard: makeCard("5"),
    legalActions: ["Stand"],
  };

  expect(() => DealerStrategy.getNextAction(decision)).toThrow();
});
