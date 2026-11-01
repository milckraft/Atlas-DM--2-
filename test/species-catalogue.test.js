import test from "node:test";
import assert from "node:assert/strict";
import {
  SPECIES, SPECIES_CATALOGUE_VERSION, getSpeciesEntry, isSpeciesPlayable,
  listSpecies, validateSpeciesSelection,
} from "../src/characters/species-catalogue.js";

test("incluye las diez especies del Manual del Jugador 2024", () => {
  assert.equal(SPECIES.length, 10);
  assert.equal(listSpecies().length, 10);
  assert.equal(SPECIES_CATALOGUE_VERSION, "2024-phb-es");
});

test("todas las especies son humanoides y están marcadas como verificadas", () => {
  for (const species of SPECIES) {
    assert.equal(species.creatureType, "humanoid");
    assert.equal(isSpeciesPlayable(species.id), true);
    assert.equal(species.status, "verified_from_supplied_source");
  }
});

test("las especies no definen aumentos de característica", () => {
  for (const species of SPECIES) {
    assert.equal("abilityScoreIncreases" in species, false);
  }
});

test("permite elecciones válidas y rechaza elecciones de linaje inválidas", () => {
  assert.equal(validateSpeciesSelection("elf", { lineage: "drow", keenSense: "perception" }).valid, true);
  assert.equal(validateSpeciesSelection("elf", { lineage: "dragon", keenSense: "perception" }).valid, false);
  assert.equal(validateSpeciesSelection("dragonborn", { ancestry: "red", breathShape: "cone" }).valid, true);
});

test("valida tamaño y elecciones obligatorias de humano", () => {
  assert.equal(validateSpeciesSelection("human", { size: "small", skill: "stealth", originFeat: "lucky" }).valid, true);
  assert.equal(validateSpeciesSelection("human", { size: "large", skill: "stealth", originFeat: "lucky" }).valid, false);
  assert.equal(validateSpeciesSelection("human", { size: "medium" }).valid, false);
});

test("devuelve null para especies desconocidas", () => {
  assert.equal(getSpeciesEntry("half-elf"), null);
  assert.equal(isSpeciesPlayable("half-elf"), false);
});
