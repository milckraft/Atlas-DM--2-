import test from "node:test";
import assert from "node:assert/strict";
import { createCharacterDraft, validateCharacterDraft } from "../src/characters/character-schema.js";

const validInput = {
  name: "Ariadna",
  playerId: "player-1",
  class: "rogue",
  background: "criminal",
  species: "elf",
  abilities: { STR: 8, DEX: 15, CON: 13, INT: 12, WIS: 10, CHA: 14 },
  languages: ["Common", "Elvish"]
};

test("creates a level-one character draft with explicit structured fields", () => {
  const character = createCharacterDraft(validInput);
  assert.equal(character.level, 1);
  assert.equal(character.class, "rogue");
  assert.equal(character.proficiencies.skills.length, 0);
  assert.equal(validateCharacterDraft(character), true);
});

test("rejects missing ability scores", () => {
  assert.throws(() => createCharacterDraft({
    ...validInput,
    abilities: { STR: 8, DEX: 15 }
  }), /puntuación inválida/i);
});

test("rejects levels outside 1 through 20", () => {
  assert.throws(() => createCharacterDraft({ ...validInput, level: 21 }), /nivel/i);
});

test("removes duplicate languages", () => {
  const character = createCharacterDraft({
    ...validInput,
    languages: ["Common", "Common", "Elvish"]
  });
  assert.deepEqual(character.languages, ["Common", "Elvish"]);
});
