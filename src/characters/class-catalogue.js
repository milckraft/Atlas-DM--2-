/**
 * Class catalogue registry for the 2024 Player's Handbook.
 *
 * Only identifiers and names are populated in this first pass. Mechanical
 * fields remain intentionally unfilled until each class table is transcribed
 * and independently checked against the user's supplied Spanish handbook.
 * Do not treat an entry with status "pending_verification" as playable data.
 */

export const CLASS_CATALOGUE_VERSION = "2024-phb-es";

export const CLASS_IDS = Object.freeze([
  "barbarian",
  "bard",
  "cleric",
  "druid",
  "fighter",
  "monk",
  "paladin",
  "ranger",
  "rogue",
  "sorcerer",
  "warlock",
  "wizard"
]);

const DISPLAY_NAMES = Object.freeze({
  barbarian: "Bárbaro",
  bard: "Bardo",
  cleric: "Clérigo",
  druid: "Druida",
  fighter: "Guerrero",
  monk: "Monje",
  paladin: "Paladín",
  ranger: "Explorador",
  rogue: "Pícaro",
  sorcerer: "Hechicero",
  warlock: "Brujo",
  wizard: "Mago"
});

export const classCatalogue = Object.freeze(
  Object.fromEntries(CLASS_IDS.map(id => [id, Object.freeze({
    id,
    name: DISPLAY_NAMES[id],
    source: "Player's Handbook 2024, capítulo 3",
    status: "pending_verification",
    hitDie: null,
    primaryAbilities: [],
    savingThrowProficiencies: [],
    skillChoices: null,
    armorProficiencies: [],
    weaponProficiencies: [],
    toolProficiencies: [],
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
