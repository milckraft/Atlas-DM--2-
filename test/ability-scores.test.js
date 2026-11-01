import test from "node:test";
import assert from "node:assert/strict";

import {
  STANDARD_ARRAY,
  applyBackgroundAbilityIncreases,
  assignStandardArray
} from "../src/characters/ability-scores.js";

const base = { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 };

test("standard array contains the six 2024 values", () => {
  assert.deepEqual(STANDARD_ARRAY, [15, 14, 13, 12, 10, 8]);
});

test("standard array assignment uses every value exactly once", () => {
  assert.deepEqual(assignStandardArray(base), base);
  assert.throws(() => assignStandardArray({ ...base, CHA: 9 }), /matriz estándar/);
});

test("background can add +2 and +1 to distinct abilities", () => {
  const result = applyBackgroundAbilityIncreases(base, [
    { ability: "STR", amount: 2 },
    { ability: "CON", amount: 1 }
  ]);
  assert.equal(result.STR, 17);
  assert.equal(result.CON, 14);
  assert.equal(base.STR, 15);
});

test("background can add +1 to three distinct abilities", () => {
  const result = applyBackgroundAbilityIncreases(base, [
    { ability: "STR", amount: 1 },
    { ability: "DEX", amount: 1 },
    { ability: "CHA", amount: 1 }
  ]);
  assert.deepEqual(result, { STR: 16, DEX: 15, CON: 13, INT: 12, WIS: 10, CHA: 9 });
});

test("invalid allocations and scores above 20 are rejected", () => {
  assert.throws(() => applyBackgroundAbilityIncreases(base, [
    { ability: "STR", amount: 2 },
    { ability: "STR", amount: 1 }
  ]), /distinta/);
  assert.throws(() => applyBackgroundAbilityIncreases(
    { ...base, STR: 19 },
    [{ ability: "STR", amount: 2 }, { ability: "DEX", amount: 1 }]
  ), /superar 20/);
});
