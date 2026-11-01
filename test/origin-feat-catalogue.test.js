import test from "node:test";
import assert from "node:assert/strict";
import {
  ORIGIN_FEAT_IDS,
  getOriginFeat,
  listOriginFeats,
  validateOriginFeatSelection
} from "../src/characters/origin-feat-catalogue.js";

test("catalogue contains the ten origin feats used by 2024 backgrounds", () => {
  assert.equal(ORIGIN_FEAT_IDS.length, 10);
  assert.equal(listOriginFeats().length, 10);
  assert.equal(new Set(ORIGIN_FEAT_IDS).size, 10);
});

test("each origin feat has a source, category and mechanics summary", () => {
  for (const feat of listOriginFeats()) {
    assert.ok(feat.name);
    assert.ok(feat.source);
    assert.equal(feat.status, "verified_from_supplied_source");
    assert.ok(feat.mechanics.benefits.length > 0);
  }
});

test("magic initiate requires a valid spell list and ability", () => {
  assert.equal(validateOriginFeatSelection("magic-initiate", {
    spellList:"cleric",spellcastingAbility:"WIS"
  }).valid, true);
  assert.equal(validateOriginFeatSelection("magic-initiate", {
    spellList:"bard",spellcastingAbility:"DEX"
  }).valid, false);
});

test("skilled requires three skill or tool choices", () => {
  assert.equal(validateOriginFeatSelection("skilled", {
    choices:[
      {type:"skill-proficiency",id:"stealth"},
      {type:"skill-proficiency",id:"perception"},
      {type:"tool-proficiency",id:"thieves-tools"}
    ]
  }).valid, true);
  assert.equal(validateOriginFeatSelection("skilled", {choices:[]}).valid, false);
});

test("crafter and musician require three distinct selections", () => {
  assert.equal(validateOriginFeatSelection("crafter", {
    tools:["smith-tools","carpenter-tools","leatherworker-tools"]
  }).valid, true);
  assert.equal(validateOriginFeatSelection("musician", {
    instruments:["lute","flute","drum"]
  }).valid, true);
  assert.equal(validateOriginFeatSelection("musician", {
    instruments:["lute","lute","drum"]
  }).valid, false);
});

test("unknown feats are rejected", () => {
  assert.equal(getOriginFeat("chosen-one"), null);
  assert.equal(validateOriginFeatSelection("chosen-one").valid, false);
});
