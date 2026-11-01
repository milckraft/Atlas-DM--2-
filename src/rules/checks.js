import { rollD20 } from "./dice.js";

const ABILITIES = new Set(["STR", "DEX", "CON", "INT", "WIS", "CHA"]);

export function abilityModifier(score) {
  if (!Number.isInteger(score) || score < 1 || score > 30) {
    throw new RangeError("La puntuación de característica debe estar entre 1 y 30.");
  }
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(level) {
  if (!Number.isInteger(level) || level < 1 || level > 20) {
    throw new RangeError("El nivel debe estar entre 1 y 20.");
  }
  return Math.floor((level - 1) / 4) + 2;
}

/**
 * Resolves an ability check. This function does not infer proficiency:
 * the caller must explicitly pass proficient: true when the character sheet says so.
 */
export function resolveAbilityCheck({
  ability,
  score,
  level = 1,
  proficient = false,
  dc,
  mode = "normal",
  randomD20
}) {
  if (!ABILITIES.has(ability)) {
    throw new RangeError("Característica no válida: usa STR, DEX, CON, INT, WIS o CHA.");
  }
  if (!Number.isInteger(dc) || dc < 0) {
    throw new RangeError("La CD debe ser un entero igual o mayor que 0.");
  }
  if (typeof proficient !== "boolean") {
    throw new TypeError("proficient debe ser true o false.");
  }

  const die = rollD20({ mode, randomD20 });
  const modifier = abilityModifier(score);
  const proficiency = proficient ? proficiencyBonus(level) : 0;
  const total = die.kept + modifier + proficiency;

  return {
    type: "ability_check",
    ability,
    rolls: die.rolls,
    kept: die.kept,
    mode: die.mode,
    abilityModifier: modifier,
    proficiencyBonus: proficiency,
    total,
    dc,
    success: total >= dc
  };
}
