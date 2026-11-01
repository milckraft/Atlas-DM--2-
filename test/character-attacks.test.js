import test from "node:test";
import assert from "node:assert/strict";
import { buildWeaponAttackProfile } from "../src/combat/character-attacks.js";

const character = { level: 5, abilities: { STR: 12, DEX: 18, CON: 14, INT: 10, WIS: 10, CHA: 10 } };

test("finesse melee weapon uses the better Strength or Dexterity modifier", () => {
  const result = buildWeaponAttackProfile({ character, weapon: { damageDice: "1d6", isRanged: false, hasFinesse: true }, proficient: true });
  assert.equal(result.ability, "DEX");
  assert.equal(result.attackBonus, 7);
  assert.equal(result.damageModifier, 4);
});

test("non-finesse melee weapon uses Strength", () => {
  const result = buildWeaponAttackProfile({ character, weapon: { damageDice: "1d8", isRanged: false, hasFinesse: false }, proficient: false });
  assert.equal(result.ability, "STR");
  assert.equal(result.attackBonus, 1);
});

test("ranged weapon uses Dexterity and proficiency only when supplied", () => {
  const result = buildWeaponAttackProfile({ character, weapon: { damageDice: "1d8", isRanged: true, hasFinesse: false }, proficient: true });
  assert.equal(result.ability, "DEX");
  assert.equal(result.attackBonus, 7);
});

test("invalid character, weapon and proficiency are rejected", () => {
  assert.throws(() => buildWeaponAttackProfile({ character: {}, weapon: {}, proficient: true }), TypeError);
  assert.throws(() => buildWeaponAttackProfile({ character, weapon: { damageDice: "1d6", isRanged: false }, proficient: true }), TypeError);
  assert.throws(() => buildWeaponAttackProfile({ character, weapon: { damageDice: "1d6", isRanged: false, hasFinesse: false }, proficient: "yes" }), TypeError);
});

import { resolveCharacterWeaponAttack } from "../src/combat/character-attacks.js";

test("character weapon attack composes profile, d20 and damage resolution", () => {
  const result = resolveCharacterWeaponAttack({
    character,
    weapon: { damageDice: "1d6", isRanged: false, hasFinesse: true },
    proficient: true,
    targetArmorClass: 15,
    randomD20: () => 11,
    randomDamageDie: () => 4
  });
  assert.equal(result.profile.ability, "DEX");
  assert.equal(result.attackBonus, 7);
  assert.equal(result.hit, true);
  assert.equal(result.damage.total, 8);
});

test("critical weapon attack doubles dice but not ability modifier", () => {
  const result = resolveCharacterWeaponAttack({
    character,
    weapon: { damageDice: "1d6", isRanged: false, hasFinesse: true },
    proficient: true,
    targetArmorClass: 25,
    randomD20: () => 20,
    randomDamageDie: () => 4
  });
  assert.equal(result.critical, true);
  assert.equal(result.damage.total, 12);
});
