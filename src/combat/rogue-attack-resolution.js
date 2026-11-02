import { randomInt } from "node:crypto";
import { resolveCharacterWeaponAttack } from "./character-attacks.js";
import { canApplySneakAttack } from "../characters/rogue-combat.js";
import { markSneakAttackUsed } from "./turn-state.js";
import { resolveCunningStrike } from "./cunning-strike-resolution.js";

/**
 * Resolves a rogue weapon attack, Sneak Attack damage, and optional Cunning Strike.
 * Caller supplies all positioning, proficiency, target saves and equipment facts.
 */
export function resolveRogueWeaponAttack({
  character, weapon, proficient, targetArmorClass, turnState,
  hasAdvantage = false, hasDisadvantage = false,
  allyWithin5FeetOfTarget = false, allyIsIncapacitated = false,
  cunningStrike = null,
  randomD20, randomDamageDie = sides => randomInt(1, sides + 1)
}) {
  if (!turnState || typeof turnState !== "object" ||
      turnState.combatTurnId === undefined ||
      typeof turnState.sneakAttackUsed !== "boolean") {
    throw new TypeError("Estado de turno inválido.");
  }
  if (typeof weapon?.hasFinesse !== "boolean" ||
      typeof weapon?.isRanged !== "boolean") {
    throw new TypeError("Propiedades del arma incompletas.");
  }
  if (cunningStrike !== null && (!cunningStrike || typeof cunningStrike !== "object" || Array.isArray(cunningStrike))) {
    throw new TypeError("cunningStrike debe ser un objeto de opciones o null.");
  }

  const eligibility = canApplySneakAttack({
    rogueLevel: character?.level,
    weaponHasFinesse: weapon.hasFinesse,
    weaponIsRanged: weapon.isRanged,
    hasAdvantage, hasDisadvantage,
    allyWithin5FeetOfTarget, allyIsIncapacitated,
    alreadyUsedThisTurn: turnState.sneakAttackUsed
  });
  const attack = resolveCharacterWeaponAttack({
    character, weapon, proficient, targetArmorClass,
    advantage: hasAdvantage, disadvantage: hasDisadvantage,
    ...(randomD20 ? { randomD20 } : {}),
    randomDamageDie
  });

  if (!attack.hit || !eligibility.eligible) {
    return Object.freeze({
      ...attack,
      sneakAttack: Object.freeze({ applied: false, dice: 0, diceSpent: 0 }),
      cunningStrike: Object.freeze({ applied: false, reason: !attack.hit ? "attack-missed" : "sneak-attack-ineligible", diceSpent: 0, outcomes: Object.freeze([]) }),
      turnState
    });
  }

  let cunning = null;
  if (cunningStrike) {
    cunning = resolveCunningStrike({
      ...cunningStrike,
      level: character.level,
      sneakAttackDice: eligibility.sneakAttackDice,
      dexterityScore: character.abilities.DEX,
      attackHit: true,
      ...(randomD20 ? { randomD20 } : {})
    });
  }

  const diceSpent = cunning?.applied ? cunning.diceSpent : 0;
  const diceRemaining = eligibility.sneakAttackDice - diceSpent;
  const diceCount = diceRemaining * (attack.critical ? 2 : 1);
  const rolls = Array.from({ length: diceCount }, () => {
    const value = randomDamageDie(6);
    if (!Number.isInteger(value) || value < 1 || value > 6) {
      throw new RangeError("Fuente de daño inválida para Ataque furtivo.");
    }
    return value;
  });
  const marked = markSneakAttackUsed(turnState);
  if (!marked.marked) {
    return Object.freeze({
      ...attack,
      sneakAttack: Object.freeze({ applied: false, dice: 0, diceSpent: 0 }),
      cunningStrike: Object.freeze({ applied: false, reason: "already-used-this-turn", diceSpent: 0, outcomes: Object.freeze([]) }),
      turnState
    });
  }

  const sneakTotal = rolls.reduce((sum, value) => sum + value, 0);
  const damage = Object.freeze({
    ...attack.damage,
    rolls: Object.freeze([...attack.damage.rolls, ...rolls]),
    total: attack.damage.total + sneakTotal,
    bonusDamage: sneakTotal
  });
  return Object.freeze({
    ...attack, damage,
    sneakAttack: Object.freeze({
      applied: true, dice: eligibility.sneakAttackDice,
      diceRolled: diceRemaining, diceSpent,
      rolls: Object.freeze(rolls), total: sneakTotal
    }),
    cunningStrike: cunning ?? Object.freeze({ applied: false, reason: "not-selected", diceSpent: 0, outcomes: Object.freeze([]) }),
    turnState: marked.state
  });
}
