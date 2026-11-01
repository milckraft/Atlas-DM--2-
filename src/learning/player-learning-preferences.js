const EXPERIENCE_LEVELS = new Set(["beginner", "intermediate", "experienced"]);
const DETAIL_LEVELS = new Set(["brief", "detailed"]);

export function createLearningPreferences(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Las preferencias deben ser un objeto.");
  }
  const experience = input.experience ?? "beginner";
  const detail = input.detail ?? "brief";
  const contextualHints = input.contextualHints ?? true;
  const explainedRuleIds = input.explainedRuleIds ?? [];

  if (!EXPERIENCE_LEVELS.has(experience)) throw new RangeError("Nivel de experiencia no válido.");
  if (!DETAIL_LEVELS.has(detail)) throw new RangeError("Nivel de detalle no válido.");
  if (typeof contextualHints !== "boolean") throw new TypeError("contextualHints debe ser booleano.");
  if (!Array.isArray(explainedRuleIds) || explainedRuleIds.some(id => typeof id !== "string" || !id.trim())) {
    throw new TypeError("explainedRuleIds debe ser una lista de identificadores de regla.");
  }

  return Object.freeze({
    experience,
    detail,
    contextualHints,
    explainedRuleIds: Object.freeze([...new Set(explainedRuleIds)])
  });
}

export function markRuleExplained(preferences, ruleId) {
  if (typeof ruleId !== "string" || !ruleId.trim()) throw new TypeError("ruleId debe ser texto no vacío.");
  return createLearningPreferences({
    ...preferences,
    explainedRuleIds: [...preferences.explainedRuleIds, ruleId]
  });
}

export function shouldOfferContextualHint(preferences, ruleId) {
  return preferences.contextualHints && !preferences.explainedRuleIds.includes(ruleId);
}
