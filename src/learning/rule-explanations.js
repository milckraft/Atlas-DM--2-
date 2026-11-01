import { getRuleById, searchRules } from "./rule-catalogue.js";

export function explainRule(query, { detail = "brief" } = {}) {
  if (!["brief", "detailed"].includes(detail)) throw new RangeError("detail debe ser brief o detailed.");
  const rule = getRuleById(query) ?? searchRules(query)[0] ?? null;
  if (!rule) return null;

  return Object.freeze({
    id: rule.id,
    title: rule.title,
    status: rule.status,
    source: rule.source,
    explanation: detail === "brief" ? rule.summary : rule.detail,
    canBePresentedAsOfficialCompleteRule: rule.status === "engine_verified"
  });
}
