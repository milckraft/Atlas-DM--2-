/**
 * Immutable per-combatant turn state.
 * Owns action economy and turn-scoped Rogue resources; no narration or dice.
 */
const ACTION_TYPES = new Set(["action", "bonusAction", "reaction"]);

function assertState(state) {
  if (!state || typeof state !== "object" ||
      !Number.isInteger(state.turnNumber) || state.turnNumber < 0 ||
      !Number.isInteger(state.movementRemaining) || state.movementRemaining < 0 ||
      !Number.isInteger(state.movementSpeed) || state.movementSpeed < 0 ||
      typeof state.actionAvailable !== "boolean" ||
      typeof state.bonusActionAvailable !== "boolean" ||
      typeof state.reactionAvailable !== "boolean" ||
      typeof state.hasMovedThisTurn !== "boolean" ||
      typeof state.sneakAttackUsed !== "boolean" ||
      typeof state.steadyAimActive !== "boolean" ||
      typeof state.strokeOfLuckAvailable !== "boolean") {
    throw new TypeError("Estado de turno inválido.");
  }
}

function next(state, changes) {
  const result = { ...state, ...changes };
  assertState(result);
  return Object.freeze(result);
}

export function createCombatTurnState({ movementSpeed = 30, strokeOfLuckAvailable = true } = {}) {
  if (!Number.isInteger(movementSpeed) || movementSpeed < 0 ||
      typeof strokeOfLuckAvailable !== "boolean") {
    throw new TypeError("Velocidad o recurso inicial inválido.");
  }
  return Object.freeze({
    turnNumber: 0,
    movementSpeed,
    movementRemaining: movementSpeed,
    actionAvailable: true,
    bonusActionAvailable: true,
    reactionAvailable: true,
    hasMovedThisTurn: false,
    sneakAttackUsed: false,
    steadyAimActive: false,
    strokeOfLuckAvailable
  });
}

export function startCombatTurn(state) {
  assertState(state);
  return next(state, {
    turnNumber: state.turnNumber + 1,
    movementRemaining: state.movementSpeed,
    actionAvailable: true,
    bonusActionAvailable: true,
    reactionAvailable: true,
    hasMovedThisTurn: false,
    sneakAttackUsed: false,
    steadyAimActive: false
  });
}

export function spendTurnResource(state, resource) {
  assertState(state);
  if (!ACTION_TYPES.has(resource)) throw new RangeError("Recurso de turno desconocido.");
  const key = resource === "action" ? "actionAvailable"
    : resource === "bonusAction" ? "bonusActionAvailable" : "reactionAvailable";
  if (!state[key]) return { state, spent: false, reason: "already-spent" };
  return { state: next(state, { [key]: false }), spent: true };
}

export function moveDuringTurn(state, distance) {
  assertState(state);
  if (!Number.isInteger(distance) || distance < 0) throw new RangeError("La distancia debe ser un entero no negativo.");
  if (distance > state.movementRemaining) {
    return { state, moved: false, reason: "insufficient-movement" };
  }
  return {
    state: next(state, {
      movementRemaining: state.movementRemaining - distance,
      hasMovedThisTurn: state.hasMovedThisTurn || distance > 0
    }),
    moved: true
  };
}

export function activateSteadyAimInTurn(state, rogueLevel) {
  assertState(state);
  if (!Number.isInteger(rogueLevel) || rogueLevel < 3 || rogueLevel > 20) {
    throw new RangeError("Puntería certera requiere nivel 3-20 de pícaro.");
  }
  if (!state.bonusActionAvailable) return { state, activated: false, reason: "bonus-action-spent" };
  if (state.hasMovedThisTurn) return { state, activated: false, reason: "already-moved" };
  if (state.steadyAimActive) return { state, activated: false, reason: "already-active" };
  return {
    state: next(state, { bonusActionAvailable: false, movementRemaining: 0, steadyAimActive: true }),
    activated: true
  };
}

export function consumeSteadyAimAttack(state) {
  assertState(state);
  if (!state.steadyAimActive) return { state, grantsAdvantage: false };
  return { state: next(state, { steadyAimActive: false }), grantsAdvantage: true };
}

export function markSneakAttackUsed(state) {
  assertState(state);
  if (state.sneakAttackUsed) return { state, marked: false, reason: "already-used-this-turn" };
  return { state: next(state, { sneakAttackUsed: true }), marked: true };
}

export function rechargeStrokeOfLuck(state, restType) {
  assertState(state);
  if (!["short", "long"].includes(restType)) throw new RangeError("El descanso debe ser short o long.");
  return next(state, { strokeOfLuckAvailable: true });
}

export function consumeStrokeOfLuck(state, rogueLevel, d20TestFailed) {
  assertState(state);
  if (!Number.isInteger(rogueLevel) || rogueLevel < 20 || rogueLevel > 20) {
    throw new RangeError("Golpe de suerte requiere nivel 20 de pícaro.");
  }
  if (typeof d20TestFailed !== "boolean") throw new TypeError("d20TestFailed debe ser booleano.");
  if (!d20TestFailed || !state.strokeOfLuckAvailable) {
    return { state, applied: false, d20Result: null };
  }
  return {
    state: next(state, { strokeOfLuckAvailable: false }),
    applied: true,
    d20Result: 20
  };
}
