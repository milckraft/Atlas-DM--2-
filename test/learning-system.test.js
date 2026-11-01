import test from "node:test";
import assert from "node:assert/strict";
import { RULE_CATALOGUE, getRuleById, searchRules } from "../src/learning/rule-catalogue.js";
import { createLearningPreferences, markRuleExplained, shouldOfferContextualHint } from "../src/learning/player-learning-preferences.js";
import { explainRule } from "../src/learning/rule-explanations.js";

test("catalogue has unique identifiers and explicit verification states", () => {
  const ids = RULE_CATALOGUE.map(rule => rule.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(RULE_CATALOGUE.every(rule => rule.source && rule.status));
  assert.equal(getRuleById("missing"), null);
});

test("rule search finds relevant entries", () => {
  assert.equal(searchRules("ventaja").at(0).id, "d20-roll-modes");
  assert.equal(searchRules("modificador de característica")[0].id, "ability-modifier");
  assert.equal(searchRules("").length, 0);
});

test("explanations preserve partial verification status", () => {
  assert.equal(explainRule("ataque furtivo").status, "partial_engine");
  assert.equal(explainRule("ataque furtivo", { detail: "detailed" }).isEngineImplemented, false);
  assert.equal(explainRule("unknown"), null);
  assert.throws(() => explainRule("d20", { detail: "long" }), RangeError);
});

test("preferences are validated, immutable and player-specific", () => {
  const first = createLearningPreferences();
  const second = createLearningPreferences({ experience: "experienced", contextualHints: false });
  assert.equal(first.experience, "beginner");
  assert.equal(second.experience, "experienced");
  assert.equal(shouldOfferContextualHint(first, "d20-roll-modes"), true);
  assert.equal(shouldOfferContextualHint(second, "d20-roll-modes"), false);
  assert.throws(() => createLearningPreferences({ experience: "expert" }), RangeError);
  assert.throws(() => createLearningPreferences({ contextualHints: "yes" }), TypeError);
});

test("explained topics are not repeatedly suggested", () => {
  const next = markRuleExplained(createLearningPreferences(), "d20-roll-modes");
  assert.equal(shouldOfferContextualHint(next, "d20-roll-modes"), false);
  assert.equal(shouldOfferContextualHint(next, "ability-check"), true);
  assert.equal(next.explainedRuleIds.length, 1);
});
