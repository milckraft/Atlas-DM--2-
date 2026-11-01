import { randomInt } from "node:crypto";

/**
 * Roll a d20. The random source can be injected for deterministic tests.
 * randomD20 must return an integer from 1 through 20.
 */
export function rollD20({ mode = "normal", randomD20 = () => randomInt(1, 21) } = {}) {
  if (!["normal", "advantage", "disadvantage"].includes(mode)) {
    throw new RangeError("El modo debe ser normal, advantage o disadvantage.");
  }

  const first = randomD20();
  validateDie(first);

  if (mode === "normal") {
    return { rolls: [first], kept: first, mode };
  }

  const second = randomD20();
  validateDie(second);
  const kept = mode === "advantage"
    ? Math.max(first, second)
    : Math.min(first, second);

  return { rolls: [first, second], kept, mode };
}

function validateDie(value) {
  if (!Number.isInteger(value) || value < 1 || value > 20) {
    throw new RangeError("La fuente aleatoria debe devolver un entero entre 1 y 20.");
  }
}
