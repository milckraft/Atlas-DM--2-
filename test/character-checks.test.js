import test from "node:test";
import assert from "node:assert/strict";
import { resolveCharacterSkillCheck } from "../src/rules/character-checks.js";

const character = {
  level: 5,
  abilities: { STR: 10, DEX: 16, CON: 12, INT: 14, WIS: 12, CHA: 8 },
  proficiencies: { skills: ["stealth", "sleight_of_hand"] }
};

test("uses the correct ability and adds proficiency from the character sheet", () => {
  const result = resolveCharacterSkillCheck({ character, skill: "stealth", dc: 15, randomD20: () => 10 });
  assert.equal(result.ability, "DEX");
  assert.equal(result.proficient, true);
  assert.equal(result.abilityModifier, 3);
  assert.equal(result.proficiencyBonus, 3);
  assert.equal(result.total, 16);
  assert.equal(result.success, true);
});

test("does not add proficiency when the character lacks it", () => {
  const result = resolveCharacterSkillCheck({ character, skill: "perception", dc: 12, randomD20: () => 10 });
  assert.equal(result.proficient, false);
  assert.equal(result.proficiencyBonus, 0);
  assert.equal(result.total, 11);
  assert.equal(result.success, false);
});

test("accepts camel-case skill IDs from existing class catalogues", () => {
  const result = resolveCharacterSkillCheck({ character, skill: "sleightOfHand", dc: 10, randomD20: () => 10 });
  assert.equal(result.skill, "sleight_of_hand");
  assert.equal(result.proficient, true);
});

test("rejects unknown skills", () => {
  assert.throws(() => resolveCharacterSkillCheck({ character, skill: "acrobatics-ish", dc: 10 }), /Habilidad no válida/);
});
