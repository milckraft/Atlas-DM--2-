import test from "node:test";
import assert from "node:assert/strict";

import {
  CLASS_CATALOGUE_VERSION,
  CLASS_IDS,
  getClassEntry,
  isClassPlayable,
  listClassEntries
} from "../src/characters/class-catalogue.js";

test("the 2024 catalogue exposes the twelve core classes", () => {
  assert.equal(CLASS_CATALOGUE_VERSION, "2024-phb-es");
  assert.equal(CLASS_IDS.length, 12);
  assert.equal(listClassEntries().length, 12);
  assert.equal(new Set(CLASS_IDS).size, 12);
});

test("every class has a Spanish display name and source marker", () => {
  for (const entry of listClassEntries()) {
    assert.ok(entry.name);
    assert.equal(entry.source, "Player's Handbook 2024, capítulo 3");
    assert.equal(entry.status, "pending_verification");
  }
});

test("unknown class identifiers return null", () => {
  assert.equal(getClassEntry("dragon-knight"), null);
  assert.equal(getClassEntry(""), null);
});

test("unverified entries cannot be treated as playable", () => {
  for (const id of CLASS_IDS) {
    assert.equal(isClassPlayable(id), false);
  }
});
