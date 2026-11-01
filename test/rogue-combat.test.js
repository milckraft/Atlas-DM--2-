import test from "node:test";
import assert from "node:assert/strict";
import { canApplySneakAttack } from "../src/characters/rogue-combat.js";

const base = {
  rogueLevel: 5,
  weaponHasFinesse: true,
  weaponIsRanged: false,
  hasAdvantage: false,
  hasDisadvantage: false,
  allyWithin5FeetOfTarget: true,
  allyIsIncapacitated: false,
  alreadyUsedThisTurn: false
};

test("Sneak Attack applies with a finesse weapon and a qualifying nearby ally", () => {
  const result = canApplySneakAttack(base);
  assert.equal(result.eligible, true);
  assert.equal(result.sneakAttackDice, 3);
  assert.deepEqual(result.reasons, []);
});

test("advantage can satisfy the positioning condition without an ally", () => {
  assert.equal(canApplySneakAttack({
    ...base, hasAdvantage: true, allyWithin5FeetOfTarget: false
  }).eligible, true);
});

test("a ranged weapon qualifies", () => {
  assert.equal(canApplySneakAttack({
    ...base, weaponHasFinesse: false, weaponIsRanged: true
  }).eligible, true);
});

test("disadvantage prevents Sneak Attack even when another condition qualifies", () => {
  assert.equal(canApplySneakAttack({ ...base, hasDisadvantage: true }).eligible, false);
});

test("an incapacitated ally does not qualify", () => {
  assert.equal(canApplySneakAttack({ ...base, allyIsIncapacitated: true }).eligible, false);
});

test("Sneak Attack cannot be applied twice in the same turn", () => {
  assert.equal(canApplySneakAttack({ ...base, alreadyUsedThisTurn: true }).eligible, false);
});

test("a weapon without finesse or ranged property does not qualify", () => {
  assert.equal(canApplySneakAttack({
    ...base, weaponHasFinesse: false, weaponIsRanged: false
  }).eligible, false);
});

test("invalid flags are rejected instead of silently coerced", () => {
  assert.throws(() => canApplySneakAttack({ ...base, hasAdvantage: 1 }), TypeError);
});
