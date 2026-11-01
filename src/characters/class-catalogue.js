/**
 * Core class data transcribed from the user's Spanish Player's Handbook 2024.
 *
 * This is a verified foundation, not a complete class implementation:
 * starting equipment, level-by-level features, spellcasting, resources,
 * subclass options and progression still need structured implementation.
 * OCR output can confuse d8 with d3; hit dice were normalized only where
 * supported by the class's printed hit-die notation and the handbook's
 * level-1 hit-point summary.
 */

export const CLASS_CATALOGUE_VERSION = "2024-phb-es";

export const CLASS_IDS = Object.freeze([
  "barbarian", "bard", "cleric", "druid", "fighter", "monk",
  "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard"
]);

const entries = {
  barbarian: {
    name: "Bárbaro", hitDie: 12, primaryAbilities: ["strength"],
    savingThrowProficiencies: ["strength", "constitution"],
    skillChoices: { count: 2, options: ["athletics", "intimidation", "nature", "perception", "survival", "animalHandling"] },
    armorProficiencies: ["light", "medium", "shields"],
    weaponProficiencies: ["simple", "martial"], toolProficiencies: []
  },
  bard: {
    name: "Bardo", hitDie: 8, primaryAbilities: ["charisma"],
    savingThrowProficiencies: ["dexterity", "charisma"],
    skillChoices: { count: 3, options: "any" },
    armorProficiencies: ["light"], weaponProficiencies: ["simple"],
    toolProficiencies: [{ type: "choice", count: 3, from: "musicalInstruments" }]
  },
  cleric: {
    name: "Clérigo", hitDie: 8, primaryAbilities: ["wisdom"],
    savingThrowProficiencies: ["wisdom", "charisma"],
    skillChoices: { count: 2, options: ["history", "medicine", "insight", "persuasion", "religion"] },
    armorProficiencies: ["light", "medium", "shields"],
    weaponProficiencies: ["simple"], toolProficiencies: []
  },
  druid: {
    name: "Druida", hitDie: 8, primaryAbilities: ["wisdom"],
    savingThrowProficiencies: ["intelligence", "wisdom"],
    skillChoices: { count: 2, options: ["arcana", "medicine", "nature", "perception", "insight", "religion", "survival", "animalHandling"] },
    armorProficiencies: ["light", "shields"], weaponProficiencies: ["simple"],
    toolProficiencies: ["herbalismKit"]
  },
  fighter: {
    name: "Guerrero", hitDie: 10, primaryAbilities: ["strength", "dexterity"],
    savingThrowProficiencies: ["strength", "constitution"],
    skillChoices: { count: 2, options: ["acrobatics", "athletics", "history", "intimidation", "perception", "insight", "persuasion", "survival", "animalHandling"] },
    armorProficiencies: ["light", "medium", "heavy", "shields"],
    weaponProficiencies: ["simple", "martial"], toolProficiencies: []
  },
  monk: {
    name: "Monje", hitDie: 8, primaryAbilities: ["dexterity", "wisdom"],
    savingThrowProficiencies: ["strength", "dexterity"],
    skillChoices: { count: 2, options: ["acrobatics", "athletics", "history", "insight", "religion", "stealth"] },
    armorProficiencies: [], weaponProficiencies: ["simple", "martialLight"],
    toolProficiencies: [{ type: "choice", count: 1, from: ["artisanTools", "musicalInstruments"] }]
  },
  paladin: {
    name: "Paladín", hitDie: 10, primaryAbilities: ["strength", "charisma"],
    savingThrowProficiencies: ["wisdom", "charisma"],
    skillChoices: { count: 2, options: ["athletics", "intimidation", "medicine", "insight", "persuasion", "religion"] },
    armorProficiencies: ["light", "medium", "heavy", "shields"],
    weaponProficiencies: ["simple", "martial"], toolProficiencies: []
  },
  ranger: {
    name: "Explorador", hitDie: 10, primaryAbilities: ["dexterity", "wisdom"],
    savingThrowProficiencies: ["strength", "dexterity"],
    skillChoices: { count: 3, options: ["athletics", "investigation", "nature", "perception", "insight", "stealth", "survival", "animalHandling"] },
    armorProficiencies: ["light", "medium", "shields"],
    weaponProficiencies: ["simple", "martial"], toolProficiencies: []
  },
  rogue: {
    name: "Pícaro", hitDie: 8, primaryAbilities: ["dexterity"],
    savingThrowProficiencies: ["dexterity", "intelligence"],
    skillChoices: { count: 4, options: ["acrobatics", "athletics", "deception", "intimidation", "investigation", "sleightOfHand", "perception", "insight", "persuasion", "stealth"] },
    armorProficiencies: ["light"], weaponProficiencies: ["simple", "martialLightFinesse"],
    toolProficiencies: ["thievesTools"]
  },
  sorcerer: {
    name: "Hechicero", hitDie: 6, primaryAbilities: ["charisma"],
    savingThrowProficiencies: ["constitution", "charisma"],
    skillChoices: { count: 2, options: ["arcana", "deception", "intimidation", "insight", "persuasion", "religion"] },
    armorProficiencies: [], weaponProficiencies: ["simple"], toolProficiencies: []
  },
  warlock: {
    name: "Brujo", hitDie: 8, primaryAbilities: ["charisma"],
    savingThrowProficiencies: ["wisdom", "charisma"],
    skillChoices: { count: 2, options: ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"] },
    armorProficiencies: ["light"], weaponProficiencies: ["simple"], toolProficiencies: []
  },
  wizard: {
    name: "Mago", hitDie: 6, primaryAbilities: ["intelligence"],
    savingThrowProficiencies: ["intelligence", "wisdom"],
    skillChoices: { count: 2, options: ["arcana", "history", "investigation", "medicine", "nature", "insight", "religion"] },
    armorProficiencies: [], weaponProficiencies: ["simple"], toolProficiencies: []
  }
};

export const classCatalogue = Object.freeze(
  Object.fromEntries(CLASS_IDS.map(id => [id, Object.freeze({
    id,
    ...entries[id],
    source: "Player's Handbook 2024, capítulo 3",
    status: "core_verified_progression_pending",
    levelProgression: null,
    subclasses: []
  })]))
);

export function getClassEntry(classId) {
  return classCatalogue[classId] ?? null;
}

export function isClassPlayable(classId) {
  const entry = getClassEntry(classId);
  return Boolean(
    entry &&
    entry.status === "verified" &&
    Number.isInteger(entry.hitDie) &&
    entry.levelProgression &&
    entry.subclasses.length > 0
  );
}

export function listClassEntries() {
  return CLASS_IDS.map(id => classCatalogue[id]);
}
