/**
 * Atlas DM character data contract.
 *
 * This module defines the shape and validates user-entered character data.
 * It intentionally does not embed copyrighted rulebook prose or pretend
 * that an incomplete catalogue is the complete 2024 Player's Handbook.
 */

export const ABILITIES = Object.freeze(["STR", "DEX", "CON", "INT", "WIS", "CHA"]);
export const SKILLS = Object.freeze([
  "acrobatics", "animal_handling", "arcana", "athletics", "deception",
  "history", "insight", "intimidation", "investigation", "medicine",
  "nature", "perception", "performance", "persuasion", "religion",
  "sleight_of_hand", "stealth", "survival"
]);

export const CHARACTER_ORIGIN_FIELDS = Object.freeze([
  "background",
  "species",
  "languages"
]);

export function createCharacterDraft(input) {
  const draft = {
    schemaVersion: 1,
    name: requiredText(input.name, "name"),
    playerId: requiredText(input.playerId, "playerId"),
    level: input.level ?? 1,
    class: requiredText(input.class, "class"),
    subclass: input.subclass ?? null,
    background: requiredText(input.background, "background"),
    species: requiredText(input.species, "species"),
    abilities: { ...input.abilities },
    abilityChoices: input.abilityChoices ?? null,
    languages: uniqueStrings(input.languages ?? []),
    proficiencies: {
      savingThrows: uniqueStrings(input.proficiencies?.savingThrows ?? []),
      skills: uniqueStrings(input.proficiencies?.skills ?? []),
      tools: uniqueStrings(input.proficiencies?.tools ?? []),
      weapons: uniqueStrings(input.proficiencies?.weapons ?? []),
      armor: uniqueStrings(input.proficiencies?.armor ?? [])
    },
    originFeat: input.originFeat ?? null,
    classFeatures: [...(input.classFeatures ?? [])],
    speciesTraits: [...(input.speciesTraits ?? [])],
    equipment: [...(input.equipment ?? [])],
    spells: [...(input.spells ?? [])],
    hitPoints: input.hitPoints ?? { maximum: null, current: null },
    armorClass: input.armorClass ?? null,
    speed: input.speed ?? null,
    proficiencyBonus: input.proficiencyBonus ?? 2,
    experiencePoints: input.experiencePoints ?? 0,
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: input.updatedAt ?? new Date().toISOString()
  };

  validateCharacterDraft(draft);
  return draft;
}

export function validateCharacterDraft(character) {
  if (!character || typeof character !== "object") {
    throw new TypeError("El personaje debe ser un objeto.");
  }
  if (!Number.isInteger(character.level) || character.level < 1 || character.level > 20) {
    throw new RangeError("El nivel debe estar entre 1 y 20.");
  }
  if (!character.abilities || typeof character.abilities !== "object") {
    throw new TypeError("Faltan las seis puntuaciones de característica.");
  }

  for (const ability of ABILITIES) {
    const score = character.abilities[ability];
    if (!Number.isInteger(score) || score < 1 || score > 30) {
      throw new RangeError(`Puntuación inválida para ${ability}; debe estar entre 1 y 30.`);
    }
  }

  if (!Array.isArray(character.languages)) {
    throw new TypeError("languages debe ser una lista.");
  }

  return true;
}

function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} es obligatorio.`);
  }
  return value.trim();
}

function uniqueStrings(values) {
  if (!Array.isArray(values) || values.some(value => typeof value !== "string" || !value.trim())) {
    throw new TypeError("Se esperaba una lista de textos no vacíos.");
  }
  return [...new Set(values.map(value => value.trim()))];
}
