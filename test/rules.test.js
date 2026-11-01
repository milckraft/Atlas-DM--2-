import test from "node:test";
import assert from "node:assert/strict";
import { rollD20 } from "../src/rules/dice.js";
import { abilityModifier, proficiencyBonus, resolveAbilityCheck } from "../src/rules/checks.js";

test("ability modifiers use floor((score - 10) / 2)", () => {
  assert.equal(abilityModifier(8), -1);
  assert.equal(abilityModifier(10), 0);
  assert.equal(abilityModifier(15), 2);
});

test("proficiency bonus follows character level", () => {
  assert.equal(proficiencyBonus(1), 2);
  assert.equal(proficiencyBonus(5), 3);
  assert.equal(proficiencyBonus(9), 4);
  assert.equal(proficiencyBonus(17), 6);
});

test("advantage keeps the higher die", () => {
  const values = [4, 17];
  const result = rollD20({ mode: "advantage", randomD20: () => values.shift() });
  assert.deepEqual(result.rolls, [4, 17]);
  assert.equal(result.kept, 17);
});

test("disadvantage keeps the lower die", () => {
  const values = [18, 6];
  const result = rollD20({ mode: "disadvantage", randomD20: () => values.shift() });
  assert.equal(result.kept, 6);
});

test("ability check adds modifier and proficiency when proficient", () => {
  const result = resolveAbilityCheck({
    ability: "DEX",
    score: 16,
    level: 5,
    proficient: true,
    dc: 15,
    randomD20: () => 10
  });
  assert.equal(result.total, 16);
  assert.equal(result.success, true);
  assert.equal(result.proficiencyBonus, 3);
});

test("invalid die values are rejected", () => {
  assert.throws(() => rollD20({ randomD20: () => 0 }), RangeError);
});
