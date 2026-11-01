import test from "node:test";
import assert from "node:assert/strict";
import {
  CUNNING_STRIKE_OPTIONS,
  getCunningStrikeOption,
  validateCunningStrike
} from "../src/characters/rogue-cunning-strike.js";

test("expone las opciones base y sus costes", () => {
  assert.equal(CUNNING_STRIKE_OPTIONS.retirada.cost, 1);
  assert.equal(CUNNING_STRIKE_OPTIONS.tropiezo.save, "dexterity");
  assert.equal(CUNNING_STRIKE_OPTIONS.veneno.cost, 1);
  assert.deepEqual(CUNNING_STRIKE_OPTIONS.veneno.requiredTools, ["poisoners-kit"]);
  assert.equal(CUNNING_STRIKE_OPTIONS.noquear.cost, 6);
  assert.equal(CUNNING_STRIKE_OPTIONS.ofuscar.cost, 3);
});

test("Confundir se desbloquea en nivel 14", () => {
  assert.equal(getCunningStrikeOption("confundir").minimumLevel, 14);
  assert.equal(validateCunningStrike({
    level: 13, sneakAttackDice: 7, effects: ["confundir"]
  }).reason, "level-too-low");
  assert.equal(validateCunningStrike({
    level: 14, sneakAttackDice: 7, effects: ["confundir"]
  }).valid, true);
});

test("nivel 5 permite un efecto y conserva al menos un dado", () => {
  assert.equal(validateCunningStrike({
    level: 5, sneakAttackDice: 3, effects: ["retirada"]
  }).remainingSneakAttackDice, 2);
  assert.equal(validateCunningStrike({
    level: 5, sneakAttackDice: 3, effects: ["retirada", "tropiezo"]
  }).reason, "too-many-effects");
  assert.equal(validateCunningStrike({
    level: 5, sneakAttackDice: 3, effects: ["noquear"]
  }).reason, "must-retain-sneak-attack-die");
});

test("nivel 11 permite combinar dos efectos si alcanza el coste", () => {
  const result = validateCunningStrike({
    level: 11, sneakAttackDice: 6, effects: ["retirada", "ofuscar"]
  });
  assert.equal(result.valid, true);
  assert.equal(result.diceCost, 4);
  assert.equal(result.remainingSneakAttackDice, 2);
});

test("veneno requiere útiles de envenenador", () => {
  const input = { level: 5, sneakAttackDice: 3, effects: ["veneno"] };
  assert.equal(validateCunningStrike(input).reason, "missing-tool-proficiency-or-kit");
  assert.equal(validateCunningStrike({
    ...input, availableTools: ["poisoners-kit"]
  }).valid, true);
});

test("rechaza efectos desconocidos, duplicados y entradas inválidas", () => {
  assert.equal(validateCunningStrike({
    level: 5, sneakAttackDice: 3, effects: ["desconocido"]
  }).reason, "unknown-effect");
  assert.equal(validateCunningStrike({
    level: 11, sneakAttackDice: 6, effects: ["retirada", "retirada"]
  }).reason, "duplicate-effect");
  assert.throws(() => validateCunningStrike({
    level: 4, sneakAttackDice: 1, effects: ["retirada"]
  }), RangeError);
});

test("no modifica los datos compartidos", () => {
  assert.equal(Object.isFrozen(CUNNING_STRIKE_OPTIONS), true);
  assert.equal(Object.isFrozen(CUNNING_STRIKE_OPTIONS.veneno.requiredTools), true);
});
