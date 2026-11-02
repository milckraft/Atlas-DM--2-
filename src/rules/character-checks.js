import { resolveAbilityCheck } from "./checks.js";

export const SKILL_ABILITIES = Object.freeze({
  acrobatics: "DEX", animal_handling: "WIS", arcana: "INT",
  athletics: "STR", deception: "CHA", history: "INT", insight: "WIS",
  intimidation: "CHA", investigation: "INT", medicine: "WIS",
  nature: "INT", perception: "WIS", performance: "CHA",
  persuasion: "CHA", religion: "INT", sleight_of_hand: "DEX",
  stealth: "DEX", survival: "WIS"
});

function normalizeSkill(value) {
  return typeof value === "string" ? value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/-/g, "_").toLowerCase() : "";
}

/** Resolves a skill check using only proficiencies recorded on the character sheet. */
export function resolveCharacterSkillCheck({ character, skill, dc, mode = "normal", randomD20 }) {
  if (!character || typeof character !== "object" || !character.abilities) {
    throw new TypeError("No hay una ficha de personaje válida.");
  }
  const skillId = normalizeSkill(skill);
  const ability = SKILL_ABILITIES[skillId];
  if (!ability) throw new RangeError("Habilidad no válida.");
  const proficient = (character.proficiencies?.skills ?? []).some(item => normalizeSkill(item) === skillId);
  const result = resolveAbilityCheck({
    ability, score: character.abilities[ability], level: character.level,
    proficient, dc, mode, randomD20
  });
  return { ...result, skill: skillId, proficient };
}
