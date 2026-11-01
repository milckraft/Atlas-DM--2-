import { randomInt } from "node:crypto";
import { resolveCharacterWeaponAttack } from "./character-attacks.js";
import { canApplySneakAttack } from "../characters/rogue-combat.js";
import { markSneakAttackUsed } from "./turn-state.js";

/**
 * Resolves a rogue weapon attack and, when eligible, adds Sneak Attack.
 * The caller owns positioning, advantage, proficiency and the current turn state.
 */
export function resolveRogueWeaponAttack({
  character, weapon, proficient, targetArmorClass, turnState,
  hasAdvantage = false, hasDisadvantage = false,
  allyWithin5FeetOfTarget = false, allyIsIncapacitated = false,
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

  const eligibility = canApplySneakAttack({
    rogueLevel: character?.level,
    weaponHasFinesse: weapon.hasFinesse,
    weaponIsRanged: weapon.isRanged,
    hasAdvantage,
    hasDisadvantage,
    allyWithin5FeetOfTarget,
    allyIsIncapacitated,
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
      ...attack, sneakAttack: Object.freeze({ applied: false, dice: 0 }),
      turnState
    });
  }

  const diceCount = eligibility.sneakAttackDice * (attack.critical ? 2 : 1);
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
      ...attack, sneakAttack: Object.freeze({ applied: false, dice: 0 }),
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
      rolls: Object.freeze(rolls), total: sneakTotal
    }),
    turnState: marked.state
  });
}
