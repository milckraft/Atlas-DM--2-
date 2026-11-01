import { abilityModifier, proficiencyBonus } from "../rules/checks.js";
import { resolveAttack } from "./attack-resolution.js";

/**
 * Builds a weapon attack modifier from explicit character and weapon facts.
 * The caller must supply weapon proficiency; this module never guesses it.
 */
export function buildWeaponAttackProfile({
  character,
  weapon,
  proficient
}) {
  if (!character || typeof character !== "object" ||
      !character.abilities || !Number.isInteger(character.level) ||
      character.level < 1 || character.level > 20) {
    throw new TypeError("Ficha de personaje inválida.");
  }
  if (!weapon || typeof weapon !== "object" ||
      typeof weapon.damageDice !== "string" ||
      typeof weapon.isRanged !== "boolean" ||
      typeof weapon.hasFinesse !== "boolean") {
    throw new TypeError("La descripción del arma está incompleta.");
  }
  if (typeof proficient !== "boolean") {
    throw new TypeError("La competencia con el arma debe indicarse explícitamente.");
  }

  const strength = abilityModifier(character.abilities.STR);
  const dexterity = abilityModifier(character.abilities.DEX);
  let ability;
  if (weapon.isRanged) ability = "DEX";
  else if (weapon.hasFinesse) ability = dexterity > strength ? "DEX" : "STR";
  else ability = "STR";

  const modifier = ability === "DEX" ? dexterity : strength;
  const proficiencyBonusValue = proficient ? proficiencyBonus(character.level) : 0;
  return Object.freeze({
    ability,
    abilityModifier: modifier,
    proficiencyBonus: proficiencyBonusValue,
    attackBonus: modifier + proficiencyBonusValue,
    damageDice: weapon.damageDice,
    damageModifier: modifier,
    proficient
  });
}

/**
 * Resolves a weapon attack using the character-derived profile.
 * This composes calculations only; action economy and class features remain external.
 */
export function resolveCharacterWeaponAttack({
  character,
  weapon,
  proficient,
  targetArmorClass,
  advantage = false,
  disadvantage = false,
  randomD20,
  randomDamageDie
}) {
  const profile = buildWeaponAttackProfile({ character, weapon, proficient });
  const result = resolveAttack({
    attackBonus: profile.attackBonus,
    targetArmorClass,
    damageDice: profile.damageModifier === 0
      ? profile.damageDice
      : `${profile.damageDice}${profile.damageModifier > 0 ? "+" : ""}${profile.damageModifier}`,
    advantage,
    disadvantage,
    ...(randomD20 ? { randomD20 } : {}),
    ...(randomDamageDie ? { randomDamageDie } : {})
  });
  return Object.freeze({ ...result, profile });
}
