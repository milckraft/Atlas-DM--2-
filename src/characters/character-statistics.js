import { abilityModifier, proficiencyBonus } from "../rules/checks.js";

export const SKILL_ABILITIES = Object.freeze({
  acrobatics: "DEX",
  animal_handling: "WIS",
  arcana: "INT",
  athletics: "STR",
  deception: "CHA",
  history: "INT",
  insight: "WIS",
  intimidation: "CHA",
  investigation: "INT",
  medicine: "WIS",
  nature: "INT",
  perception: "WIS",
  performance: "CHA",
  persuasion: "CHA",
  religion: "INT",
  sleight_of_hand: "DEX",
  stealth: "DEX",
  survival: "WIS"
});

const ABILITIES = Object.freeze(["STR", "DEX", "CON", "INT", "WIS", "CHA"]);

function validateAbilityScores(scores) {
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    throw new TypeError("Las puntuaciones deben ser un objeto.");
  }
  for (const ability of ABILITIES) {
    if (!Number.isInteger(scores[ability]) || scores[ability] < 1 || scores[ability] > 30) {
      throw new RangeError(`Puntuación inválida para ${ability}.`);
    }
  }
}

function validateLevel(level) {
  if (!Number.isInteger(level) || level < 1 || level > 20) {
    throw new RangeError("El nivel debe estar entre 1 y 20.");
  }
}

function proficiencyContribution({ level, proficient, expertise }) {
  validateLevel(level);
  if (typeof proficient !== "boolean" || typeof expertise !== "boolean") {
    throw new TypeError("Las competencias deben indicarse con true o false.");
  }
  if (expertise && !proficient) {
    throw new RangeError("No se puede tener pericia sin competencia.");
  }
  const bonus = proficient ? proficiencyBonus(level) : 0;
  return expertise ? bonus * 2 : bonus;
}

export function calculateSavingThrow({ ability, scores, level, proficient = false }) {
  validateAbilityScores(scores);
  if (!ABILITIES.includes(ability)) throw new RangeError("Característica no válida.");
  return abilityModifier(scores[ability]) +
    proficiencyContribution({ level, proficient, expertise: false });
}

export function calculateSkillBonus({
  skill, scores, level, proficient = false, expertise = false
}) {
  validateAbilityScores(scores);
  const ability = SKILL_ABILITIES[skill];
  if (!ability) throw new RangeError("Habilidad no válida.");
  return abilityModifier(scores[ability]) +
    proficiencyContribution({ level, proficient, expertise });
}

export function calculateInitiative({ dexterityScore, bonus = 0 }) {
  if (!Number.isInteger(dexterityScore) || dexterityScore < 1 || dexterityScore > 30) {
    throw new RangeError("Destreza debe estar entre 1 y 30.");
  }
  if (!Number.isInteger(bonus)) throw new TypeError("El bonificador de iniciativa debe ser entero.");
  return abilityModifier(dexterityScore) + bonus;
}

export function calculatePassivePerception({ scores, level, proficient = false, expertise = false }) {
  return 10 + calculateSkillBonus({
    skill: "perception", scores, level, proficient, expertise
  });
}
