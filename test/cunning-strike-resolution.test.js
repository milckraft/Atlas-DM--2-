import test from "node:test";
import assert from "node:assert/strict";
import { resolveCunningStrike } from "../src/combat/cunning-strike-resolution.js";

const base = {
  level: 5, sneakAttackDice: 3, dexterityScore: 18,
  effects: ["tropiezo"], attackHit: true,
  targetSavingThrowBonuses: { dexterity: 2 },
  randomD20: () => 5
};

test("failed save applies the selected condition and spends its Sneak Attack die", () => {
  const result = resolveCunningStrike(base);
  assert.equal(result.applied, true);
  assert.equal(result.diceSpent, 1);
  assert.equal(result.remainingSneakAttackDice, 2);
  assert.equal(result.saveDc, 10);
  assert.equal(result.outcomes[0].saved, false);
  assert.equal(result.outcomes[0].condition, "prone");
});

test("successful save prevents the condition but the selected effect still costs its die", () => {
  const result = resolveCunningStrike({
    ...base, targetSavingThrowBonuses: { dexterity: 20 }
  });
  assert.equal(result.outcomes[0].saved, true);
  assert.equal(result.outcomes[0].condition, null);
  assert.equal(result.diceSpent, 1);
});

test("a missed attack cannot apply or spend Cunning Strike", () => {
  const result = resolveCunningStrike({ ...base, attackHit: false });
  assert.equal(result.applied, false);
  assert.equal(result.diceSpent, 0);
});

test("Retirada requires no saving throw and grants half movement without a save DC", () => {
  const result = resolveCunningStrike({
    level: 5, sneakAttackDice: 3, effects: ["retirada"],
    attackHit: true, movementSpeed: 35
  });
  assert.equal(result.saveDc, null);
  assert.equal(result.outcomes[0].movementDistance, 17);
  assert.equal(result.diceSpent, 1);
});

test("Tropiezo cannot target a creature larger than Large", () => {
  const result = resolveCunningStrike({
    ...base, targetSize: "huge"
  });
  assert.equal(result.applied, false);
  assert.equal(result.reason, "target-too-large");
  assert.equal(result.diceSpent, 0);
});

test("Veneno requires the target Constitution save modifier", () => {
  assert.throws(() => resolveCunningStrike({
    ...base, effects: ["veneno"], targetSavingThrowBonuses: {}
  }), TypeError);
});

test("Confundir cannot be used before Rogue level 14", () => {
  const result = resolveCunningStrike({
    ...base, effects: ["confundir"]
  });
  assert.equal(result.applied, false);
  assert.equal(result.reason, "level-too-low");
});

test("level 11 can resolve two effects and combine their costs", () => {
  const result = resolveCunningStrike({
    level: 11, sneakAttackDice: 6, dexterityScore: 18,
    effects: ["tropiezo", "ofuscar"], attackHit: true,
    targetSavingThrowBonuses: { dexterity: 2 },
    randomD20: () => 5
  });
  assert.equal(result.diceSpent, 4);
  assert.equal(result.remainingSneakAttackDice, 2);
  assert.equal(result.outcomes.length, 2);
});
