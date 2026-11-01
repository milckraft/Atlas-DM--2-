/**
 * Deterministic Rogue combat predicates from the 2024 Player's Handbook.
 * These helpers decide eligibility only; the combat engine owns turn state,
 * attack resolution, damage rolls and target positions.
 */
import { getRogueSneakAttackDice } from "./rogue-progression.js";

function requireBoolean(value, field) {
  if (typeof value !== "boolean") {
    throw new TypeError(`${field} debe ser booleano.`);
  }
}

export function canApplySneakAttack({
  rogueLevel,
  weaponHasFinesse,
  weaponIsRanged,
  hasAdvantage,
  hasDisadvantage,
  allyWithin5FeetOfTarget,
  allyIsIncapacitated = false,
  alreadyUsedThisTurn = false
}) {
  getRogueSneakAttackDice(rogueLevel);
  const flags = {
    weaponHasFinesse,
    weaponIsRanged,
    hasAdvantage,
    hasDisadvantage,
    allyWithin5FeetOfTarget,
    allyIsIncapacitated,
    alreadyUsedThisTurn
  };
  for (const [field, value] of Object.entries(flags)) requireBoolean(value, field);

  const validWeapon = weaponHasFinesse || weaponIsRanged;
  const qualifyingAlly = allyWithin5FeetOfTarget && !allyIsIncapacitated;
  const qualifyingPosition = hasAdvantage || qualifyingAlly;

  return {
    eligible: validWeapon &&
      qualifyingPosition &&
      !hasDisadvantage &&
      !alreadyUsedThisTurn,
    sneakAttackDice: getRogueSneakAttackDice(rogueLevel),
    reasons: [
      ...(!validWeapon ? ["El ataque requiere un arma sutil o a distancia."] : []),
      ...(!qualifyingPosition ? ["Necesitas ventaja o un aliado no incapacitado junto al objetivo."] : []),
      ...(hasDisadvantage ? ["La desventaja impide aplicar Ataque furtivo."] : []),
      ...(alreadyUsedThisTurn ? ["Ataque furtivo ya se aplicó durante este turno."] : [])
    ]
  };
}
