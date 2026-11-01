import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateLevelOneHitPoints,
  calculateUnarmoredDefense,
  getClassSavingThrowProficiencies,
  getLevelOneProficiencyBonus,
  validateClassSkillChoices
} from "../src/characters/class-rules.js";

test("level-one hit points use the class hit die maximum plus Constitution modifier", () => {
  assert.equal(calculateLevelOneHitPoints("barbarian", 14), 14);
  assert.equal(calculateLevelOneHitPoints("wizard", 8), 5);
  assert.equal(calculateLevelOneHitPoints("fighter", 10), 10);
  assert.throws(() => calculateLevelOneHitPoints("unknown", 10), /Clase no válida/);
});

test("class saving throw proficiencies come from the class catalogue", () => {
  assert.deepEqual(getClassSavingThrowProficiencies("rogue"), ["dexterity", "intelligence"]);
  assert.deepEqual(getClassSavingThrowProficiencies("wizard"), ["intelligence", "wisdom"]);
  assert.throws(() => getClassSavingThrowProficiencies("unknown"), /Clase no válida/);
});

test("class skill choices validate count, duplicates and allowed options", () => {
  assert.equal(validateClassSkillChoices("rogue", ["stealth", "perception", "acrobatics", "investigation"]).valid, true);
  assert.equal(validateClassSkillChoices("rogue", ["stealth", "stealth", "acrobatics", "investigation"]).valid, false);
  assert.equal(validateClassSkillChoices("wizard", ["stealth", "arcana"]).valid, false);
  assert.equal(validateClassSkillChoices("bard", ["stealth", "arcana", "history"]).valid, true);
  assert.equal(validateClassSkillChoices("rogue", ["stealth"]).valid, false);
});

test("level-one proficiency bonus is +2", () => {
  assert.equal(getLevelOneProficiencyBonus(), 2);
});

test("Barbarian and monk Unarmored Defense use their distinct formulas", () => {
  assert.equal(calculateUnarmoredDefense({
    classId: "barbarian", dexterityScore: 14, constitutionScore: 16
  }), 15);
  assert.equal(calculateUnarmoredDefense({
    classId: "monk", dexterityScore: 16, wisdomScore: 14
  }), 15);
});

test("Unarmored Defense enforces armor and monk shield restrictions", () => {
  assert.throws(() => calculateUnarmoredDefense({
    classId: "barbarian", dexterityScore: 14, constitutionScore: 14, wearingArmor: true
  }), /no se aplica/);
  assert.throws(() => calculateUnarmoredDefense({
    classId: "monk", dexterityScore: 14, wisdomScore: 14, usingShield: true
  }), /no se aplica/);
  assert.throws(() => calculateUnarmoredDefense({
    classId: "wizard", dexterityScore: 14, constitutionScore: 14
  }), /no tiene Defensa/);
});
