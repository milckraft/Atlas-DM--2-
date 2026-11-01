/**
 * Rogue class progression for the 2024 Player's Handbook.
 * Names follow the supplied Spanish-language source.
 *
 * This table is data only. It does not make the class playable: feature
 * mechanics, subclass features, equipment, spellcasting and combat
 * integration must also be implemented and tested.
 */
export const ROGUE_PROGRESSION_SOURCE = "2024-phb-es";

const rows = [
  [1, ["Ataque furtivo", "Jerga de ladrones", "Maestría con armas", "Pericia"], 1],
  [2, ["Acción astuta"], 1],
  [3, ["Puntería certera", "Subclase de pícaro"], 2],
  [4, ["Mejora de característica"], 2],
  [5, ["Esquiva asombrosa", "Golpe astuto"], 3],
  [6, ["Pericia"], 3],
  [7, ["Evasión", "Talentos fiables"], 4],
  [8, ["Mejora de característica"], 4],
  [9, ["Rasgo de subclase"], 5],
  [10, ["Mejora de característica"], 5],
  [11, ["Golpe astuto mejorado"], 6],
  [12, ["Mejora de característica"], 6],
  [13, ["Rasgo de subclase"], 7],
  [14, ["Golpes taimados"], 7],
  [15, ["Mente escurridiza"], 8],
  [16, ["Mejora de característica"], 8],
  [17, ["Rasgo de subclase"], 9],
  [18, ["Elusivo"], 9],
  [19, ["Don épico"], 10],
  [20, ["Golpe de suerte"], 10]
];

export const ROGUE_PROGRESSION = Object.freeze(rows.map(([level, features, sneakAttackDice]) =>
  Object.freeze({ level, features: Object.freeze(features), sneakAttackDice })
));

export function getRogueProgression(level) {
  if (!Number.isInteger(level) || level < 1 || level > 20) {
    throw new RangeError("El nivel de pícaro debe estar entre 1 y 20.");
  }
  return ROGUE_PROGRESSION[level - 1];
}

export function getRogueSneakAttackDice(level) {
  return getRogueProgression(level).sneakAttackDice;
}

export function getRogueProficiencyBonus(level) {
  getRogueProgression(level);
  return Math.floor((level - 1) / 4) + 2;
}
