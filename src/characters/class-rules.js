import { abilityModifier, proficiencyBonus } from "../rules/checks.js";
import { getClassEntry } from "./class-catalogue.js";

const SKILL_IDS = new Set([
  "acrobatics", "animalHandling", "arcana", "athletics", "deception",
  "history", "insight", "intimidation", "investigation", "medicine",
  "nature", "perception", "performance", "persuasion", "religion",
  "sleightOfHand", "stealth", "survival"
]);

/**
 * Deterministic level-1 class calculations.
 * This module intentionally implements only rules whose formulas are
 * straightforward and whose required inputs are explicit.
 */
export function calculateLevelOneHitPoints(classId, constitutionScore) {
  const entry = getClassEntry(classId);
  if (!entry) throw new RangeError("Clase no válida.");
  return entry.hitDie + abilityModifier(constitutionScore);
}

export function getClassSavingThrowProficiencies(classId) {
  const entry = getClassEntry(classId);
  if (!entry) throw new RangeError("Clase no válida.");
  return [...entry.savingThrowProficiencies];
}

export function validateClassSkillChoices(classId, choices) {
  const entry = getClassEntry(classId);
  if (!entry) return { valid: false, errors: ["Clase no válida."] };
  if (!Array.isArray(choices)) {
    return { valid: false, errors: ["Las habilidades de clase deben ser una lista."] };
  }

  const errors = [];
  if (choices.length !== entry.skillChoices.count) {
    errors.push(`Debes elegir exactamente ${entry.skillChoices.count} habilidades de clase.`);
  }
  if (new Set(choices).size !== choices.length) {
    errors.push("No puedes elegir la misma habilidad más de una vez.");
  }
  if (choices.some(skill => !SKILL_IDS.has(skill))) {
    errors.push("Hay una habilidad que no pertenece al catálogo.");
  }
  if (entry.skillChoices.options !== "any" &&
      choices.some(skill => !entry.skillChoices.options.includes(skill))) {
    errors.push("Has elegido una habilidad que no está disponible para esta clase.");
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Calculates the class's Unarmored Defense AC when applicable.
 * Equipment restrictions are explicit inputs; this function never guesses
 * whether armor or a shield is equipped.
 */
export function calculateUnarmoredDefense({
  classId,
  dexterityScore,
  constitutionScore,
  wisdomScore,
  wearingArmor = false,
  usingShield = false
}) {
  const entry = getClassEntry(classId);
  if (!entry) throw new RangeError("Clase no válida.");
  if (!["barbarian", "monk"].includes(classId)) {
    throw new RangeError("Esta clase no tiene Defensa sin armadura en nivel 1.");
  }
  if (wearingArmor) {
    throw new RangeError("Defensa sin armadura no se aplica mientras llevas armadura.");
  }
  if (classId === "monk" && usingShield) {
    throw new RangeError("Defensa sin armadura del monje no se aplica mientras usa escudo.");
  }

  const dexterity = abilityModifier(dexterityScore);
  const secondary = classId === "barbarian"
    ? abilityModifier(constitutionScore)
    : abilityModifier(wisdomScore);

  return 10 + dexterity + secondary;
}

export function getLevelOneProficiencyBonus() {
  return proficiencyBonus(1);
}
