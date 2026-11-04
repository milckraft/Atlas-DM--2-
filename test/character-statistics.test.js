import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateInitiative,
  calculatePassivePerception,
  calculateSavingThrow,
  calculateSkillBonus
} from "../src/characters/character-statistics.js";

const scores = { STR: 10, DEX: 16, CON: 12, INT: 14, WIS: 15, CHA: 8 };

test("saving throws add the ability modifier and proficiency only when proficient", () => {
  assert.equal(calculateSavingThrow({ ability: "DEX", scores, level: 1 }), 3);
  assert.equal(calculateSavingThrow({ ability: "WIS", scores, level: 5, proficient: true }), 5);
});

test("skill bonuses use the correct ability and level proficiency bonus", () => {
  assert.equal(calculateSkillBonus({ skill: "stealth", scores, level: 1, proficient: true }), 5);
  assert.equal(calculateSkillBonus({ skill: "arcana", scores, level: 5 }), 2);
});

test("expertise doubles proficiency and requires proficiency", () => {
  assert.equal(calculateSkillBonus({
    skill: "perception", scores, level: 5, proficient: true, expertise: true
  }), 7);
  assert.throws(() => calculateSkillBonus({
    skill: "stealth", scores, level: 1, expertise: true
  }), /pericia/);
});

test("initiative uses Dexterity modifier and explicit bonuses", () => {
  assert.equal(calculateInitiative({ dexterityScore: 16 }), 3);
  assert.equal(calculateInitiative({ dexterityScore: 16, bonus: 2 }), 5);
});

test("passive Perception is 10 plus the Perception skill bonus", () => {
  assert.equal(calculatePassivePerception({
    scores, level: 1, proficient: true
  }), 14);
});

test("invalid abilities, skills, levels and scores are rejected", () => {
  assert.throws(() => calculateSavingThrow({ ability: "XYZ", scores, level: 1 }), /Característica/);
  assert.throws(() => calculateSkillBonus({ skill: "unknown", scores, level: 1 }), /Habilidad/);
  assert.throws(() => calculateInitiative({ dexterityScore: 0 }), /Destreza/);
  assert.throws(() => calculateSavingThrow({ ability: "STR", scores, level: 21 }), /nivel/);
});
