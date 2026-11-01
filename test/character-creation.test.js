import test from "node:test";
import assert from "node:assert/strict";
import { createCharacterFromChoices } from "../src/characters/character-creation.js";

const base = {
  name: "Lira",
  playerId: "player-1",
  class: "rogue",
  background: "wayfarer",
  species: "elf",
  baseAbilityScores: { STR: 8, DEX: 15, CON: 13, INT: 12, WIS: 14, CHA: 10 },
  abilityIncreases: [{ ability: "DEX", amount: 2 }, { ability: "WIS", amount: 1 }],
  languages: ["Común", "Élfico", "Enano"],
  speciesChoices: { lineage: "wood-elf", keenSense: "perception" },
  backgroundToolChoice: null,
  backgroundFeatOptions: {}
};

test("integra trasfondo, especie, matriz estándar y aumentos", () => {
  const result = createCharacterFromChoices(base);
  assert.equal(result.valid, true);
  assert.equal(result.character.abilities.DEX, 17);
  assert.equal(result.character.abilities.WIS, 15);
  assert.deepEqual(result.character.proficiencies.skills, ["insight", "stealth", "perception"]);
  assert.equal(result.character.speed, 9);
  assert.equal(result.character.creationStatus, "draft_pending_class_rules");
});

test("rechaza una matriz que no sea la matriz estándar exacta", () => {
  const result = createCharacterFromChoices({
    ...base,
    baseAbilityScores: { STR: 8, DEX: 15, CON: 13, INT: 12, WIS: 14, CHA: 11 }
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes("matriz estándar")));
});

test("valida las opciones de herramienta de un trasfondo", () => {
  const result = createCharacterFromChoices({
    ...base,
    background: "entertainer",
    abilityIncreases: [{ ability: "DEX", amount: 2 }, { ability: "CHA", amount: 1 }],
    backgroundToolChoice: null
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes("herramienta")));
});

test("requiere una dote adicional para humano", () => {
  const result = createCharacterFromChoices({
    ...base,
    species: "human",
    speciesChoices: { size: "medium", skill: "arcana", originFeat: "lucky" },
    humanOriginFeat: null,
    background: "wayfarer"
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes("dote de origen adicional")));
});

test("un humano puede completar sus elecciones de origen", () => {
  const result = createCharacterFromChoices({
    ...base,
    species: "human",
    speciesChoices: { size: "medium", skill: "arcana", originFeat: "lucky" },
    humanOriginFeat: "alert"
  });
  assert.equal(result.valid, true);
  assert.equal(result.character.originFeat.species.id, "alert");
  assert.ok(result.character.proficiencies.skills.includes("arcana"));
});

test("rechaza elecciones de especie inválidas y menos de tres idiomas", () => {
  const result = createCharacterFromChoices({
    ...base,
    speciesChoices: { lineage: "dragon", keenSense: "perception" },
    languages: ["Común"]
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes("linaje")));
  assert.ok(result.errors.some(error => error.includes("idiomas")));
});
