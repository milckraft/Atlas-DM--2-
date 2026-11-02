import { rollD20 } from "../rules/dice.js";
import { validateCunningStrike } from "../characters/rogue-cunning-strike.js";
import { calculateCunningStrikeSaveDc } from "../characters/rogue-features.js";

const SIZE_ORDER = ["tiny", "small", "medium", "large", "huge", "gargantuan"];

/**
 * Resolves selected Cunning Strike options after a confirmed weapon hit.
 * This returns condition applications for the encounter engine to persist;
 * it never mutates a target or invents its saving-throw bonuses.
 */
export function resolveCunningStrike({
  level, sneakAttackDice, effects, carriedTools = [],
  dexterityScore, targetSavingThrowBonuses = {},
  targetSize = "medium", movementSpeed = 30,
  attackHit, randomD20
}) {
  if (typeof attackHit !== "boolean") throw new TypeError("attackHit debe ser booleano.");
  if (!attackHit) {
    return Object.freeze({ applied: false, reason: "attack-missed", diceSpent: 0, outcomes: Object.freeze([]) });
  }
  if (!Number.isInteger(movementSpeed) || movementSpeed < 0) throw new RangeError("movementSpeed inválida.");
  if (!SIZE_ORDER.includes(targetSize)) throw new RangeError("Tamaño de objetivo desconocido.");
  if (!targetSavingThrowBonuses || typeof targetSavingThrowBonuses !== "object" || Array.isArray(targetSavingThrowBonuses)) {
    throw new TypeError("targetSavingThrowBonuses debe ser un objeto.");
  }

  const validation = validateCunningStrike({ level, sneakAttackDice, effects, carriedTools });
  if (!validation.valid) {
    return Object.freeze({ applied: false, reason: validation.reason, validation, diceSpent: 0, outcomes: Object.freeze([]) });
  }

  const invalidTarget = validation.effects.find(option =>
    option.targetSize === "large-or-smaller" &&
    SIZE_ORDER.indexOf(targetSize) > SIZE_ORDER.indexOf("large")
  );
  if (invalidTarget) {
    return Object.freeze({ applied: false, reason: "target-too-large", diceSpent: 0, outcomes: Object.freeze([]) });
  }
  const hasSavingThrow = validation.effects.some(option => option.save);
  const saveDc = hasSavingThrow
    ? calculateCunningStrikeSaveDc({ dexterityScore, rogueLevel: level })
    : null;
  const outcomes = [];
  for (const option of validation.effects) {
    if (!option.save) {
      outcomes.push(Object.freeze({
        id: option.id, applied: true,
        movementDistance: option.id === "retirada" ? Math.floor(movementSpeed / 2) : 0,
        condition: null
      }));
      continue;
    }
    const bonus = targetSavingThrowBonuses[option.save];
    if (!Number.isInteger(bonus) || bonus < -20 || bonus > 30) {
      throw new TypeError(`Falta un bonificador válido para la salvación de ${option.save} del objetivo.`);
    }
    const die = rollD20({ randomD20 });
    const total = die.kept + bonus;
    const saved = total >= saveDc;
    outcomes.push(Object.freeze({
      id: option.id, save: option.save,
      roll: die.kept, bonus, total, saveDc, saved,
      applied: !saved,
      condition: saved ? null : option.condition,
      duration: saved ? null : (option.duration ?? null),
      repeatSave: saved ? null : (option.repeatSave ?? null),
      targetSize
    }));
  }

  return Object.freeze({
    applied: true, diceSpent: validation.diceCost,
    remainingSneakAttackDice: validation.remainingSneakAttackDice,
    saveDc, outcomes: Object.freeze(outcomes)
  });
}
