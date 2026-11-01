/**
 * Immutable per-combatant turn state.
 * Tracks personal action economy and the global turn context separately.
 */
const ACTION_TYPES = new Set(["action", "bonusAction", "reaction"]);

function assertTurnId(turnId) {
  if (!(typeof turnId === "string" && turnId.trim()) &&
      !(Number.isInteger(turnId) && turnId >= 0)) {
    throw new TypeError("combatTurnId debe ser un texto no vacío o entero no negativo.");
  }
}

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
  assertTurnId(state.combatTurnId);
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
    turnNumber: 0, combatTurnId: 0, lastSneakAttackTurnId: null,
    movementSpeed, movementRemaining: movementSpeed,
    actionAvailable: true, bonusActionAvailable: true, reactionAvailable: true,
    hasMovedThisTurn: false, sneakAttackUsed: false, steadyAimActive: false,
    strokeOfLuckAvailable
  });
}

/** Updates the initiative actor's global turn ID without refreshing this rogue's resources. */
export function setCombatTurnContext(state, combatTurnId) {
  assertState(state);
  assertTurnId(combatTurnId);
  return next(state, {
    combatTurnId,
    sneakAttackUsed: state.lastSneakAttackTurnId === combatTurnId
  });
}

/** Starts this combatant's own turn and refreshes its turn resources. */
export function startCombatTurn(state, combatTurnId = state.turnNumber + 1) {
  assertState(state);
  assertTurnId(combatTurnId);
  return next(state, {
    turnNumber: state.turnNumber + 1, combatTurnId,
    movementRemaining: state.movementSpeed,
    actionAvailable: true, bonusActionAvailable: true, reactionAvailable: true,
    hasMovedThisTurn: false,
    sneakAttackUsed: state.lastSneakAttackTurnId === combatTurnId,
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
  if (distance > state.movementRemaining) return { state, moved: false, reason: "insufficient-movement" };
  return { state: next(state, {
    movementRemaining: state.movementRemaining - distance,
    hasMovedThisTurn: state.hasMovedThisTurn || distance > 0
  }), moved: true };
}

export function activateSteadyAimInTurn(state, rogueLevel) {
  assertState(state);
  if (!Number.isInteger(rogueLevel) || rogueLevel < 3 || rogueLevel > 20) throw new RangeError("Puntería certera requiere nivel 3-20 de pícaro.");
  if (!state.bonusActionAvailable) return { state, activated: false, reason: "bonus-action-spent" };
  if (state.hasMovedThisTurn) return { state, activated: false, reason: "already-moved" };
  if (state.steadyAimActive) return { state, activated: false, reason: "already-active" };
  return { state: next(state, { bonusActionAvailable: false, movementRemaining: 0, steadyAimActive: true }), activated: true };
}

export function consumeSteadyAimAttack(state) {
  assertState(state);
  if (!state.steadyAimActive) return { state, grantsAdvantage: false };
  return { state: next(state, { steadyAimActive: false }), grantsAdvantage: true };
}

/** Marks Sneak Attack against the current global combat turn, including reaction attacks. */
export function markSneakAttackUsed(state) {
  assertState(state);
  if (state.lastSneakAttackTurnId === state.combatTurnId) {
    return { state, marked: false, reason: "already-used-this-turn" };
  }
  return { state: next(state, {
    lastSneakAttackTurnId: state.combatTurnId, sneakAttackUsed: true
  }), marked: true };
}

export function rechargeStrokeOfLuck(state, restType) {
  assertState(state);
  if (!["short", "long"].includes(restType)) throw new RangeError("El descanso debe ser short o long.");
  return next(state, { strokeOfLuckAvailable: true });
}

export function consumeStrokeOfLuck(state, rogueLevel, d20TestFailed) {
  assertState(state);
  if (!Number.isInteger(rogueLevel) || rogueLevel !== 20) throw new RangeError("Golpe de suerte requiere nivel 20 de pícaro.");
  if (typeof d20TestFailed !== "boolean") throw new TypeError("d20TestFailed debe ser booleano.");
  if (!d20TestFailed || !state.strokeOfLuckAvailable) return { state, applied: false, d20Result: null };
  return { state: next(state, { strokeOfLuckAvailable: false }), applied: true, d20Result: 20 };
}
