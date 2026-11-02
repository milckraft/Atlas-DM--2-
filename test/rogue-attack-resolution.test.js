import test from "node:test";
import assert from "node:assert/strict";
import { createCombatTurnState, setCombatTurnContext } from "../src/combat/turn-state.js";
import { resolveRogueWeaponAttack } from "../src/combat/rogue-attack-resolution.js";

const character = { level: 5, abilities: { STR: 12, DEX: 18, CON: 14, INT: 10, WIS: 10, CHA: 10 } };
const weapon = { damageDice: "1d6", isRanged: false, hasFinesse: true };

function makeState(id = "round-1-rogue") {
  return setCombatTurnContext(createCombatTurnState(), id);
}

test("eligible hit adds Sneak Attack and consumes it for the global turn", () => {
  const result = resolveRogueWeaponAttack({
    character, weapon, proficient: true, targetArmorClass: 15,
    turnState: makeState(),
    allyWithin5FeetOfTarget: true,
    randomD20: () => 10,
    randomDamageDie: () => 2
  });
  assert.equal(result.hit, true);
  assert.equal(result.sneakAttack.applied, true);
  assert.equal(result.sneakAttack.dice, 3);
  assert.equal(result.sneakAttack.total, 6);
  assert.equal(result.damage.total, 12);
  assert.equal(result.turnState.sneakAttackUsed, true);
});

test("critical hit doubles Sneak Attack dice, not a flat modifier", () => {
  const result = resolveRogueWeaponAttack({
    character, weapon, proficient: true, targetArmorClass: 30,
    turnState: makeState(),
    allyWithin5FeetOfTarget: true,
    randomD20: () => 20,
    randomDamageDie: () => 2
  });
  assert.equal(result.sneakAttack.rolls.length, 6);
  assert.equal(result.sneakAttack.total, 12);
  assert.equal(result.damage.total, 20);
});

test("miss does not consume Sneak Attack", () => {
  const result = resolveRogueWeaponAttack({
    character, weapon, proficient: true, targetArmorClass: 30,
    turnState: makeState(),
    allyWithin5FeetOfTarget: true,
    randomD20: () => 1,
    randomDamageDie: () => 2
  });
  assert.equal(result.hit, false);
  assert.equal(result.sneakAttack.applied, false);
  assert.equal(result.turnState.sneakAttackUsed, false);
});

test("disadvantage prevents Sneak Attack", () => {
  const result = resolveRogueWeaponAttack({
    character, weapon, proficient: true, targetArmorClass: 15,
    turnState: makeState(),
    allyWithin5FeetOfTarget: true, hasDisadvantage: true,
    randomD20: () => 10, randomDamageDie: () => 2
  });
  assert.equal(result.hit, true);
  assert.equal(result.sneakAttack.applied, false);
});

test("Sneak Attack cannot be applied twice in the same global turn", () => {
  const state = makeState();
  const first = resolveRogueWeaponAttack({
    character, weapon, proficient: true, targetArmorClass: 15,
    turnState: state, allyWithin5FeetOfTarget: true,
    randomD20: () => 10, randomDamageDie: () => 2
  });
  const second = resolveRogueWeaponAttack({
    character, weapon, proficient: true, targetArmorClass: 15,
    turnState: first.turnState, allyWithin5FeetOfTarget: true,
    randomD20: () => 10, randomDamageDie: () => 2
  });
  assert.equal(first.sneakAttack.applied, true);
  assert.equal(second.sneakAttack.applied, false);
});

test("Cunning Strike spends Sneak Attack dice and applies its save outcome on a hit", () => {
  const result = resolveRogueWeaponAttack({
    character, weapon, proficient: true, targetArmorClass: 15,
    turnState: makeState(), allyWithin5FeetOfTarget: true,
    cunningStrike: {
      effects: ["tropiezo"], targetSavingThrowBonuses: { dexterity: 0 },
      targetSize: "medium"
    },
    randomD20: () => 10,
    randomDamageDie: () => 2
  });
  assert.equal(result.hit, true);
  assert.equal(result.sneakAttack.diceSpent, 1);
  assert.equal(result.sneakAttack.diceRolled, 2);
  assert.equal(result.sneakAttack.total, 4);
  assert.equal(result.damage.total, 10);
  assert.equal(result.cunningStrike.applied, true);
  assert.equal(result.cunningStrike.outcomes[0].condition, "prone");
  assert.equal(result.turnState.sneakAttackUsed, true);
});

test("Cunning Strike is not spent when the attack misses", () => {
  const result = resolveRogueWeaponAttack({
    character, weapon, proficient: true, targetArmorClass: 30,
    turnState: makeState(), allyWithin5FeetOfTarget: true,
    cunningStrike: { effects: ["tropiezo"], targetSavingThrowBonuses: { dexterity: 0 } },
    randomD20: () => 1, randomDamageDie: () => 2
  });
  assert.equal(result.cunningStrike.reason, "attack-missed");
  assert.equal(result.sneakAttack.diceSpent, 0);
  assert.equal(result.turnState.sneakAttackUsed, false);
});
