/**
 * Catálogo de especies del Player's Handbook 2024 (edición española).
 * Resúmenes mecánicos originales; no reproduce el texto del manual.
 * Los rasgos están descritos para consulta y aún no todos ejecutan efectos.
 */
export const SPECIES_CATALOGUE_VERSION = "2024-phb-es";
export const SPECIES_SOURCE = {
  title: "Manual del Jugador 2024",
  chapter: 4,
  printedPages: "186-197",
  status: "verified_from_supplied_source",
};

const humanoid = "humanoid";

export const SPECIES = [
  {
    id: "aasimar", name: "Aasimar", creatureType: humanoid,
    size: ["medium", "small"], speedMeters: 9,
    traits: [
      { id: "healing-hands", summary: "Como acción mágica, sana a una criatura tocada en una cantidad de puntos de golpe determinada por tantos d4 como tu bonificador por competencia; se recupera con descanso largo." },
      { id: "light-bearer", summary: "Conoces el truco luz y usas Carisma como aptitud mágica." },
      { id: "celestial-resistance", summary: "Resistencia al daño necrótico y radiante." },
      { id: "darkvision", summary: "Visión en la oscuridad a 18 m." },
      { id: "celestial-revelation", summary: "Desde nivel 3, como acción adicional te transformas durante 1 minuto. Una vez por turno añades daño necrótico o radiante igual a tu bonificador por competencia al dañar con un ataque o conjuro. Elige en cada transformación: Alas celestiales (vuelo), Fulgor interior (luz y daño radiante cercano al final de tus turnos) o Mortaja necrótica (puede asustar a criaturas no aliadas cercanas). Se recupera con descanso largo." },
    ],
    choices: { size: ["medium", "small"], revelation: ["celestial-wings", "inner-radiance", "necrotic-shroud"] },
    status: "verified_from_supplied_source",
  },
  {
    id: "dragonborn", name: "Dracónido", creatureType: humanoid,
    size: ["medium"], speedMeters: 9,
    traits: [
      { id: "draconic-ancestry", summary: "Elige un ancestro dracónico; determina el tipo de daño del aliento y la resistencia." },
      { id: "breath-weapon", summary: "Al realizar la acción de Atacar, sustituyes un ataque por un aliento en cono de 4,5 m o línea de 9 m por 1,5 m. Salvación de Destreza; daño inicial 1d10, aumenta a niveles 5, 11 y 17. Usos iguales al bonificador por competencia por descanso largo." },
      { id: "damage-resistance", summary: "Resistencia al tipo de daño de tu ancestro." },
      { id: "darkvision", summary: "Visión en la oscuridad a 18 m." },
      { id: "draconic-flight", summary: "Desde nivel 5, acción adicional para obtener velocidad de vuelo igual a tu velocidad durante 10 minutos; se recupera con descanso largo." },
    ],
    choices: { ancestry: ["black", "blue", "brass", "bronze", "copper", "gold", "green", "red", "silver", "white"], breathShape: ["cone", "line"] },
    status: "verified_from_supplied_source",
  },
  {
    id: "dwarf", name: "Enano", creatureType: humanoid,
    size: ["medium"], speedMeters: 9,
    traits: [
      { id: "stonecunning", summary: "Como acción adicional, percibes vibraciones en piedra a 18 m durante 10 minutos; usos iguales al bonificador por competencia por descanso largo." },
      { id: "dwarven-toughness", summary: "Tus puntos de golpe máximos aumentan en 1 y vuelven a aumentar en 1 por cada nivel que obtengas." },
      { id: "dwarven-resilience", summary: "Resistencia al daño de veneno y ventaja para evitar o terminar el estado envenenado." },
      { id: "darkvision", summary: "Visión en la oscuridad a 36 m." },
    ],
    choices: {},
    status: "verified_from_supplied_source",
  },
  {
    id: "elf", name: "Elfo", creatureType: humanoid,
    size: ["medium"], speedMeters: 9,
    traits: [
      { id: "elven-lineage", summary: "Elige Alto elfo, Drow o Elfo de los bosques. Recibes el beneficio de nivel 1 y aprendes los conjuros indicados al alcanzar los niveles 3 y 5; puedes lanzar cada conjuro de nivel superior una vez gratis por descanso largo y también con espacios apropiados." },
      { id: "fey-ancestry", summary: "Ventaja en salvaciones para evitar o terminar el estado hechizado." },
      { id: "keen-senses", summary: "Competencia en Percepción, Perspicacia o Supervivencia." },
      { id: "trance", summary: "No necesitas dormir ni puedes ser dormido mágicamente; completas un descanso largo en 4 horas de trance consciente." },
      { id: "darkvision", summary: "Visión en la oscuridad a 18 m; Drow amplía el alcance a 36 m." },
    ],
    choices: { lineage: ["high-elf", "drow", "wood-elf"], keenSense: ["perception", "insight", "survival"] },
    status: "verified_from_supplied_source",
  },
  {
    id: "gnome", name: "Gnomo", creatureType: humanoid,
    size: ["small"], speedMeters: 9,
    traits: [
      { id: "gnomish-cunning", summary: "Ventaja en salvaciones de Inteligencia, Sabiduría y Carisma." },
      { id: "gnomish-lineage", summary: "Elige Gnomo de los bosques o Gnomo de las rocas; la aptitud mágica para los conjuros de linaje puede ser Inteligencia, Sabiduría o Carisma." },
      { id: "darkvision", summary: "Visión en la oscuridad a 18 m." },
    ],
    choices: { lineage: ["forest-gnome", "rock-gnome"], spellcastingAbility: ["intelligence", "wisdom", "charisma"] },
    status: "verified_from_supplied_source",
  },
  {
    id: "goliath", name: "Goliat", creatureType: humanoid,
    size: ["medium"], speedMeters: 10.5,
    traits: [
      { id: "powerful-build", summary: "Ventaja para escapar del estado agarrado y capacidad de carga calculada como si fueras una categoría de tamaño mayor." },
      { id: "large-form", summary: "Desde nivel 5, acción adicional para crecer a Grande durante un máximo de 10 minutos; mientras dure, tienes ventaja en pruebas de Fuerza y tu velocidad aumenta 3 m. Se recupera con descanso largo." },
      { id: "giant-ancestry", summary: "Elige un linaje gigante. Puedes usar su beneficio un número de veces igual a tu bonificador por competencia por descanso largo: fuego (daño adicional 1d10), colinas (derribar), nubes (teletransportarte 9 m como acción adicional), escarcha (daño frío 1d6 y reducir velocidad), piedra (reducir daño con reacción y 1d12 + Constitución) o tormenta (daño de trueno 1d8 como reacción)." },
    ],
    choices: { giantAncestry: ["fire", "hill", "cloud", "frost", "stone", "storm"] },
    status: "verified_from_supplied_source",
  },
  {
    id: "human", name: "Humano", creatureType: humanoid,
    size: ["medium", "small"], speedMeters: 9,
    traits: [
      { id: "skillful", summary: "Obtienes competencia en una habilidad a tu elección." },
      { id: "resourceful", summary: "Obtienes Inspiración heroica al finalizar un descanso largo." },
      { id: "versatile", summary: "Obtienes una dote de origen a tu elección." },
    ],
    choices: { size: ["medium", "small"], skill: "skill", originFeat: "origin-feat" },
    status: "verified_from_supplied_source",
  },
  {
    id: "halfling", name: "Mediano", creatureType: humanoid,
    size: ["small"], speedMeters: 9,
    traits: [
      { id: "halfling-nimbleness", summary: "Puedes atravesar el espacio de criaturas de tamaño superior al tuyo, pero no terminar allí tu movimiento." },
      { id: "luck", summary: "Cuando obtienes un 1 en una prueba con d20, puedes repetirla y debes usar el nuevo resultado." },
      { id: "naturally-stealthy", summary: "Puedes esconderte tras una criatura al menos una categoría de tamaño mayor que tú." },
      { id: "brave", summary: "Ventaja en salvaciones para evitar o terminar el estado asustado." },
    ],
    choices: {},
    status: "verified_from_supplied_source",
  },
  {
    id: "orc", name: "Orco", creatureType: humanoid,
    size: ["medium"], speedMeters: 9,
    traits: [
      { id: "relentless-endurance", summary: "Cuando tus puntos de golpe llegan a 0 sin morir inmediatamente, puedes quedar con 1 punto de golpe; se recupera con descanso largo." },
      { id: "adrenaline-rush", summary: "Como acción adicional, corres y obtienes puntos de golpe temporales iguales a tu bonificador por competencia. Usos iguales al bonificador por competencia por descanso corto o largo." },
      { id: "darkvision", summary: "Visión en la oscuridad a 36 m." },
    ],
    choices: {},
    status: "verified_from_supplied_source",
  },
  {
    id: "tiefling", name: "Tiefling", creatureType: humanoid,
    size: ["medium", "small"], speedMeters: 9,
    traits: [
      { id: "fiendish-legacy", summary: "Elige legado Abisal, Ctónico o Infernal. Obtienes resistencia y un truco en nivel 1, un conjuro adicional en nivel 3 y otro en nivel 5. Cada conjuro de nivel superior puede lanzarse una vez gratis por descanso largo y también con espacios apropiados." },
      { id: "otherworldly-presence", summary: "Conoces el truco taumaturgia; usa la aptitud mágica elegida para tu legado." },
      { id: "darkvision", summary: "Visión en la oscuridad a 18 m." },
    ],
    choices: { size: ["medium", "small"], legacy: ["abyssal", "chthonic", "infernal"], spellcastingAbility: ["intelligence", "wisdom", "charisma"] },
    status: "verified_from_supplied_source",
  },
];

const byId = new Map(SPECIES.map((entry) => [entry.id, entry]));

export function getSpeciesEntry(id) {
  return byId.get(id) ?? null;
}

export function listSpecies() {
  return SPECIES.map(({ id, name, size, speedMeters, status }) => ({
    id, name, size: [...size], speedMeters, status,
  }));
}

export function isSpeciesPlayable(id) {
  const entry = getSpeciesEntry(id);
  return Boolean(entry && entry.status === "verified_from_supplied_source");
}

export function validateSpeciesSelection(id, selection = {}) {
  const species = getSpeciesEntry(id);
  if (!species) return { valid: false, errors: ["Especie desconocida."] };
  const errors = [];
  for (const [choice, allowed] of Object.entries(species.choices)) {
    const value = selection[choice];
    if (Array.isArray(allowed) && !allowed.includes(value)) {
      errors.push(`La elección "${choice}" no es válida para ${species.name}.`);
    }
    if (allowed === "skill" && (typeof value !== "string" || !value.trim())) {
      errors.push("Debes elegir una habilidad para el rasgo Diestro.");
    }
    if (allowed === "origin-feat" && (typeof value !== "string" || !value.trim())) {
      errors.push("Debes elegir una dote de origen para el rasgo Versátil.");
    }
  }
  if (selection.size && !species.size.includes(selection.size)) {
    errors.push(`El tamaño "${selection.size}" no está permitido para ${species.name}.`);
  }
  return { valid: errors.length === 0, errors };
}
