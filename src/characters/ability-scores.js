/**
 * Ability-score rules for 2024 character origins.
 *
 * The 2024 Player's Handbook assigns ability-score increases to the
 * background, not the species. A background permits either +2 to one
 * listed ability and +1 to another, or +1 to three listed abilities.
 * This module validates the allocation; it does not choose a background.
 */

export const STANDARD_ARRAY = Object.freeze([15, 14, 13, 12, 10, 8]);
export const ABILITY_IDS = Object.freeze([
  "STR", "DEX", "CON", "INT", "WIS", "CHA"
]);

const validAbility = ability => ABILITY_IDS.includes(ability);

export function applyBackgroundAbilityIncreases(baseScores, increases) {
  if (!baseScores || typeof baseScores !== "object" || Array.isArray(baseScores)) {
    throw new TypeError("Las puntuaciones base deben ser un objeto.");
  }

  for (const ability of ABILITY_IDS) {
    if (!Number.isInteger(baseScores[ability]) ||
        baseScores[ability] < 1 || baseScores[ability] > 20) {
      throw new RangeError(`Puntuación base no válida para ${ability}.`);
    }
  }

  if (!Array.isArray(increases) ||
      ![2, 3].includes(increases.length) ||
      increases.some(item => !item || !validAbility(item.ability) ||
        !Number.isInteger(item.amount))) {
    throw new TypeError("La asignación debe contener dos o tres aumentos válidos.");
  }

  const amounts = increases.map(item => item.amount).sort((a, b) => b - a);
  const validPattern =
    (increases.length === 2 && amounts[0] === 2 && amounts[1] === 1) ||
    (increases.length === 3 && amounts.every(amount => amount === 1));

  if (!validPattern) {
    throw new RangeError("Elige +2 y +1, o bien +1 a tres características.");
  }

  const chosen = increases.map(item => item.ability);
  if (new Set(chosen).size !== chosen.length) {
    throw new RangeError("Cada característica elegida debe ser distinta.");
  }

  const result = { ...baseScores };
  for (const { ability, amount } of increases) {
    result[ability] += amount;
    if (result[ability] > 20) {
      throw new RangeError(`La puntuación de ${ability} no puede superar 20.`);
    }
  }

  return result;
}

export function assignStandardArray(assignment) {
  if (!assignment || typeof assignment !== "object" || Array.isArray(assignment)) {
    throw new TypeError("La asignación debe ser un objeto de características.");
  }

  const values = ABILITY_IDS.map(ability => assignment[ability]);
  if (values.some(value => !Number.isInteger(value))) {
    throw new TypeError("Debes asignar una puntuación a cada característica.");
  }

  const expected = [...STANDARD_ARRAY].sort((a, b) => a - b);
  const actual = [...values].sort((a, b) => a - b);
  if (actual.some((value, index) => value !== expected[index])) {
    throw new RangeError("Debes usar cada valor de la matriz estándar una sola vez.");
  }

  return Object.fromEntries(ABILITY_IDS.map(ability => [ability, assignment[ability]]));
}
