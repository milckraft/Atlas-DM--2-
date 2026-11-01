import test from "node:test";
import assert from "node:assert/strict";
import {
  getRogueProgression,
  getRogueSneakAttackDice,
  getRogueProficiencyBonus
} from "../src/characters/rogue-progression.js";

test("rogue progression contains all twenty levels", () => {
  assert.equal(Array.from({ length: 20 }, (_, i) => getRogueProgression(i + 1)).length, 20);
});

test("Sneak Attack dice increase every two levels", () => {
  const expected = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];
  assert.deepEqual(expected.map((_, i) => getRogueSneakAttackDice(i + 1)), expected);
});

test("proficiency bonus follows the 2024 level bands", () => {
  assert.deepEqual([1, 5, 9, 13, 17].map(getRogueProficiencyBonus), [2, 3, 4, 5, 6]);
});

test("invalid rogue levels are rejected", () => {
  for (const level of [0, 21, 1.5, "3", null]) {
    assert.throws(() => getRogueProgression(level), RangeError);
  }
});

test("progression data is immutable", () => {
  assert.ok(Object.isFrozen(getRogueProgression(1)));
  assert.ok(Object.isFrozen(getRogueProgression(1).features));
});
