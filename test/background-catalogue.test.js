import test from "node:test";
import assert from "node:assert/strict";

import {
  BACKGROUND_IDS,
  getBackgroundEntry,
  listBackgroundEntries,
  validateBackgroundChoices
} from "../src/characters/background-catalogue.js";

test("catalogue contains all sixteen 2024 backgrounds", () => {
  assert.equal(BACKGROUND_IDS.length, 16);
  assert.equal(listBackgroundEntries().length, 16);
  assert.equal(new Set(BACKGROUND_IDS).size, 16);
});

test("each background has three ability options, two skills, a feat, tool and equipment", () => {
  for (const entry of listBackgroundEntries()) {
    assert.equal(entry.abilityChoices.length, 3, entry.id);
    assert.equal(entry.skills.length, 2, entry.id);
    assert.ok(entry.originFeat, entry.id);
    assert.ok(entry.tool.name, entry.id);
    assert.ok(entry.equipment.A && entry.equipment.B, entry.id);
    assert.equal(entry.status, "verified_from_supplied_source");
  }
});

test("criminal background validates legal background increases", () => {
  assert.deepEqual(
    validateBackgroundChoices("criminal", [
      {ability:"DEX",amount:2},
      {ability:"INT",amount:1}
    ]),
    {valid:true,errors:[]}
  );
});

test("background rejects ability increases outside its three options", () => {
  const result = validateBackgroundChoices("criminal", [
    {ability:"WIS",amount:2},
    {ability:"INT",amount:1}
  ]);
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /no permite/);
});

test("choice-based tool proficiencies require a choice", () => {
  assert.equal(validateBackgroundChoices("artisan", [
    {ability:"STR",amount:2},{ability:"INT",amount:1}
  ]).valid, false);

  assert.equal(validateBackgroundChoices("artisan", [
    {ability:"STR",amount:2},{ability:"INT",amount:1}
  ], "smith-tools").valid, true);
});

test("fixed tool proficiency does not accept a replacement choice", () => {
  const result = validateBackgroundChoices("criminal", [
    {ability:"DEX",amount:2},{ability:"INT",amount:1}
  ], "gaming-set");
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /herramienta fija/);
});

test("unknown backgrounds are rejected", () => {
  assert.equal(getBackgroundEntry("dragon-knight"), null);
  assert.equal(validateBackgroundChoices("unknown", []).valid, false);
});
