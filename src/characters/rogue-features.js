/**
 * Deterministic activation and resolution helpers for verified Rogue features.
 * Rule summaries are based on Player's Handbook 2024 (Spanish), pp. 170-171.
 * Turn economy, positions, reactions and conditions remain owned by combat state.
 */
import { abilityModifier, proficiencyBonus } from "../rules/checks.js";

const ACTIONS = new Set(["dash", "disengage", "hide"]);

function requireLevel(level, minimum, feature) {
  if (!Number.isInteger(level) || level < minimum || level > 20) {
    throw new RangeError(`${feature} requiere nivel ${minimum}-20 de pícaro.`);
  }
}

/** Acción astuta: one of the three listed bonus-action options. */
export function validateCunningAction({ level, option }) {
  requireLevel(level, 2, "Acción astuta");
  if (!ACTIONS.has(option)) {
    return { valid: false, reason: "invalid-option", options: [...ACTIONS] };
  }
  return { valid: true, action: option, actionCost: "bonus-action" };
}

/**
 * Puntería certera can be activated only before moving on this turn.
 * The caller must consume the advantage on the next attack and set speed to 0.
 */
export function activateSteadyAim({ level, hasMovedThisTurn }) {
  requireLevel(level, 3, "Puntería certera");
  if (typeof hasMovedThisTurn !== "boolean") throw new TypeError("hasMovedThisTurn debe ser booleano.");
  if (hasMovedThisTurn) return { valid: false, reason: "already-moved" };
  return { valid: true, grants: "advantage-on-next-attack-this-turn", speedAfterActivation: 0 };
}

/** Esquiva asombrosa: halve damage from a hit by an attacker the rogue can see. */
export function resolveUncannyDodge({ level, attackerVisible, attackHit, damage, reactionAvailable }) {
  requireLevel(level, 5, "Esquiva asombrosa");
  if (typeof attackerVisible !== "boolean" || typeof attackHit !== "boolean" ||
      typeof reactionAvailable !== "boolean" || !Number.isInteger(damage) || damage < 0) {
    throw new TypeError("Entradas inválidas para Esquiva asombrosa.");
  }
  const canUse = attackerVisible && attackHit && reactionAvailable;
  return {
    canUse,
    damageAfter: canUse ? Math.floor(damage / 2) : damage,
    consumesReaction: canUse
  };
}

/** Evasión: resolve an effect that normally deals half damage on a successful Dex save. */
export function resolveEvasion({ level, dexteritySaveSucceeded, damage, incapacitated }) {
  requireLevel(level, 7, "Evasión");
  if (typeof dexteritySaveSucceeded !== "boolean" || typeof incapacitated !== "boolean" ||
      !Number.isInteger(damage) || damage < 0) {
    throw new TypeError("Entradas inválidas para Evasión.");
  }
  if (incapacitated) return { damageAfter: dexteritySaveSucceeded ? Math.floor(damage / 2) : damage, applied: false };
  return {
    damageAfter: dexteritySaveSucceeded ? 0 : Math.floor(damage / 2),
    applied: true
  };
}

/** Talentos fiables: replace a d20 result of 9 or lower for proficient checks. */
export function applyReliableTalent({ level, d20Result, isProficient }) {
  requireLevel(level, 7, "Talentos fiables");
  if (!Number.isInteger(d20Result) || d20Result < 1 || d20Result > 20 ||
      typeof isProficient !== "boolean") {
    throw new TypeError("Tirada o competencia inválida para Talentos fiables.");
  }
  return {
    result: isProficient && d20Result <= 9 ? 10 : d20Result,
    applied: isProficient && d20Result <= 9
  };
}

/** Mente escurridiza grants proficiency in Wisdom and Charisma saving throws. */
export function getSlipperyMindSavingThrows(level) {
  requireLevel(level, 15, "Mente escurridiza");
  return ["wisdom", "charisma"];
}

/** Elusivo prevents attack-roll advantage against the rogue unless incapacitated. */
export function canAttackerHaveAdvantageAgainstElusive({ level, incapacitated }) {
  requireLevel(level, 18, "Elusivo");
  if (typeof incapacitated !== "boolean") throw new TypeError("incapacitated debe ser booleano.");
  return incapacitated;
}

/** Golpe de suerte: turn a failed d20 test into 20; once per short or long rest. */
export function resolveStrokeOfLuck({ level, d20TestFailed, available }) {
  requireLevel(level, 20, "Golpe de suerte");
  if (typeof d20TestFailed !== "boolean" || typeof available !== "boolean") {
    throw new TypeError("Entradas inválidas para Golpe de suerte.");
  }
  const applied = d20TestFailed && available;
  return { applied, d20Result: applied ? 20 : null, consumesUse: applied, recharge: "short-or-long-rest" };
}

/** Save DC used by Cunning Strike effects. */
export function calculateCunningStrikeSaveDc({ dexterityScore, rogueLevel }) {
  requireLevel(rogueLevel, 5, "Golpe astuto");
  return 8 + abilityModifier(dexterityScore) + proficiencyBonus(rogueLevel);
}
