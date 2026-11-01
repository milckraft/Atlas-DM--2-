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

test("every class has a Spanish name, source marker and explicit incomplete status", () => {
  for (const entry of listClassEntries()) {
    assert.ok(entry.name);
    assert.equal(entry.source, "Player's Handbook 2024, capítulo 3");
    assert.equal(entry.status, "core_verified_progression_pending");
    assert.ok(Number.isInteger(entry.hitDie));
    assert.ok(entry.primaryAbilities.length > 0);
    assert.equal(entry.savingThrowProficiencies.length, 2);
    assert.ok(entry.skillChoices.count >= 2);
    assert.ok(Array.isArray(entry.armorProficiencies));
    assert.ok(Array.isArray(entry.weaponProficiencies));
    assert.ok(Array.isArray(entry.toolProficiencies));
  }
});

test("hit dice and key class foundations match the 2024 handbook tables", () => {
  const expected = {
    barbarian: 12, bard: 8, cleric: 8, druid: 8,
    fighter: 10, monk: 8, paladin: 10, ranger: 10,
    rogue: 8, sorcerer: 6, warlock: 8, wizard: 6
  };
  for (const [id, die] of Object.entries(expected)) {
    assert.equal(getClassEntry(id).hitDie, die);
  }
  assert.deepEqual(getClassEntry("bard").skillChoices, { count: 3, options: "any" });
  assert.deepEqual(getClassEntry("rogue").toolProficiencies, ["thievesTools"]);
  assert.deepEqual(getClassEntry("druid").toolProficiencies, ["herbalismKit"]);
});

test("unknown class identifiers return null", () => {
  assert.equal(getClassEntry("dragon-knight"), null);
  assert.equal(getClassEntry(""), null);
});

test("incomplete class entries cannot be treated as playable", () => {
  for (const id of CLASS_IDS) {
    assert.equal(isClassPlayable(id), false);
  }
});

test("level-one feature outlines are explicit and never treated as executable rules", () => {
  for (const entry of listClassEntries()) {
    assert.ok(Array.isArray(entry.levelOneFeatures));
    assert.equal(entry.levelOneRulesStatus, "summary_only_not_executable");
  }
  assert.deepEqual(getClassEntry("barbarian").levelOneFeatures, ["unarmoredDefense", "rage"]);
  assert.deepEqual(getClassEntry("bard").levelOneFeatures, ["bardicInspiration"]);
  assert.deepEqual(getClassEntry("monk").levelOneFeatures, ["martialArts", "unarmoredDefense"]);
  assert.deepEqual(getClassEntry("rogue").levelOneFeatures, ["sneakAttack", "thievesCant", "weaponMastery", "expertise"]);
});

test("starting equipment choices remain selectable and incomplete kits stay unavailable", () => {
  for (const entry of listClassEntries()) {
    if (entry.startingEquipment) {
      assert.deepEqual(entry.startingEquipment.options.map(option => option.id), ["A", "B"]);
      assert.equal(entry.startingEquipmentStatus, "transcribed_choice_kits");
    } else {
      assert.equal(entry.startingEquipmentStatus, "pending_source_verification");
    }
  }
  assert.equal(getClassEntry("rogue").startingEquipment.options[0].gold, 3);
  assert.equal(getClassEntry("wizard").startingEquipment.options[1].gold, 55);
});
