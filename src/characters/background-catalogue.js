/**
 * Structured 2024 Player's Handbook background catalogue (Spanish edition).
 * Mechanical fields are transcribed from chapter 4, pages 180-187 of the
 * user-supplied handbook. Equipment is kept as readable choice text for now;
 * item-level inventory parsing is a later task.
 *
 * This is original structured game data, not reproduced descriptive prose.
 */

export const BACKGROUND_CATALOGUE_VERSION = "2024-phb-es";
export const BACKGROUND_IDS = Object.freeze([
  "acolyte", "entertainer", "artisan", "farmer", "charlatan",
  "merchant", "criminal", "hermit", "sage", "scribe", "guard",
  "guide", "sailor", "noble", "soldier", "wayfarer"
]);

const entries = [
  {
    id:"acolyte", name:"Acólito",
    abilityChoices:["INT","WIS","CHA"], originFeat:"Magic Initiate (Cleric)",
    skills:["insight","religion"], tool:{type:"fixed",id:"calligrapher-supplies",name:"Suministros de calígrafo"},
    equipment:{A:"Suministros de calígrafo, libro (de oraciones), pergamino (10 hojas), símbolo sagrado, túnica y 8 po",B:"50 po"}
  },
  {
    id:"entertainer", name:"Animador",
    abilityChoices:["STR","DEX","CHA"], originFeat:"Musician",
    skills:["acrobatics","performance"], tool:{type:"choice",category:"musical-instrument",name:"Un instrumento musical a elección"},
    equipment:{A:"Instrumento musical elegido, 2 disfraces, espejo, perfume, ropas de viaje y 11 po",B:"50 po"}
  },
  {
    id:"artisan", name:"Artesano",
    abilityChoices:["STR","DEX","INT"], originFeat:"Crafter",
    skills:["investigation","persuasion"], tool:{type:"choice",category:"artisan-tools",name:"Un tipo de herramientas de artesano a elección"},
    equipment:{A:"Herramientas de artesano elegidas, 2 bolsas, ropas de viaje y 32 po",B:"50 po"}
  },
  {
    id:"farmer", name:"Campesino",
    abilityChoices:["STR","CON","WIS"], originFeat:"Tough",
    skills:["nature","animal-handling"], tool:{type:"fixed",id:"carpenter-tools",name:"Herramientas de carpintero"},
    equipment:{A:"Hoz, herramientas de carpintero, útiles de sanador, olla de hierro, pala, ropas de viaje y 30 po",B:"50 po"}
  },
  {
    id:"charlatan", name:"Charlatán",
    abilityChoices:["DEX","CON","CHA"], originFeat:"Skilled",
    skills:["deception","sleight-of-hand"], tool:{type:"fixed",id:"forgery-kit",name:"Útiles para falsificar"},
    equipment:{A:"Útiles para falsificar, disfraz, ropas de calidad y 15 po",B:"50 po"}
  },
  {
    id:"merchant", name:"Comerciante",
    abilityChoices:["CON","INT","CHA"], originFeat:"Lucky",
    skills:["persuasion","animal-handling"], tool:{type:"fixed",id:"navigator-tools",name:"Herramientas de navegante"},
    equipment:{A:"Herramientas de navegante, 2 bolsas, ropas de viaje y 22 po",B:"50 po"}
  },
  {
    id:"criminal", name:"Criminal",
    abilityChoices:["DEX","CON","INT"], originFeat:"Alert",
    skills:["sleight-of-hand","stealth"], tool:{type:"fixed",id:"thieves-tools",name:"Herramientas de ladrón"},
    equipment:{A:"2 dagas, herramientas de ladrón, 2 bolsas, palanqueta, ropas de viaje y 16 po",B:"50 po"}
  },
  {
    id:"hermit", name:"Ermitaño",
    abilityChoices:["CON","WIS","CHA"], originFeat:"Healer",
    skills:["medicine","religion"], tool:{type:"fixed",id:"herbalism-kit",name:"Útiles de herborista"},
    equipment:{A:"Bastón, útiles de herborista, aceite (3 frascos), lámpara, libro (de filosofía), petate, ropas de viaje y 16 po",B:"50 po"}
  },
  {
    id:"sage", name:"Erudito",
    abilityChoices:["CON","INT","WIS"], originFeat:"Magic Initiate (Wizard)",
    skills:["arcana","history"], tool:{type:"fixed",id:"calligrapher-supplies",name:"Suministros de calígrafo"},
    equipment:{A:"Bastón, suministros de calígrafo, libro (de historia), pergamino (3 hojas), túnica y 8 po",B:"50 po"}
  },
  {
    id:"scribe", name:"Escriba",
    abilityChoices:["DEX","INT","WIS"], originFeat:"Skilled",
    skills:["investigation","perception"], tool:{type:"fixed",id:"calligrapher-supplies",name:"Suministros de calígrafo"},
    equipment:{A:"Suministros de calígrafo, aceite (3 frascos), lámpara, pergamino (12 hojas), ropas de calidad y 23 po",B:"50 po"}
  },
  {
    id:"guard", name:"Guardia",
    abilityChoices:["STR","INT","WIS"], originFeat:"Alert",
    skills:["athletics","perception"], tool:{type:"choice",category:"gaming-set",name:"Un tipo de juego a elección"},
    equipment:{A:"Lanza, ballesta ligera, 20 virotes, juego elegido, aljaba, esposas, linterna sorda, ropas de viaje y 12 po",B:"50 po"}
  },
  {
    id:"guide", name:"Guía",
    abilityChoices:["DEX","CON","WIS"], originFeat:"Magic Initiate (Druid)",
    skills:["stealth","survival"], tool:{type:"fixed",id:"cartographers-tools",name:"Herramientas de cartógrafo"},
    equipment:{A:"Arco corto, 20 flechas, herramientas de cartógrafo, aljaba, petate, tienda, ropas de viaje y 3 po",B:"50 po"}
  },
  {
    id:"sailor", name:"Marinero",
    abilityChoices:["STR","DEX","WIS"], originFeat:"Tavern Brawler",
    skills:["acrobatics","perception"], tool:{type:"fixed",id:"navigator-tools",name:"Herramientas de navegante"},
    equipment:{A:"Daga, herramientas de navegante, cuerda, ropas de viaje y 20 po",B:"50 po"}
  },
  {
    id:"noble", name:"Noble",
    abilityChoices:["STR","INT","CHA"], originFeat:"Skilled",
    skills:["history","persuasion"], tool:{type:"choice",category:"gaming-set",name:"Un tipo de juego a elección"},
    equipment:{A:"Juego elegido, perfume, ropas de calidad y 29 po",B:"50 po"}
  },
  {
    id:"soldier", name:"Soldado",
    abilityChoices:["STR","DEX","CON"], originFeat:"Savage Attacker",
    skills:["athletics","intimidation"], tool:{type:"choice",category:"gaming-set",name:"Un tipo de juego a elección"},
    equipment:{A:"Lanza, arco corto, 20 flechas, aljaba, juego elegido, útiles de sanador, ropas de viaje y 14 po",B:"50 po"}
  },
  {
    id:"wayfarer", name:"Vagabundo",
    abilityChoices:["DEX","WIS","CHA"], originFeat:"Lucky",
    skills:["insight","stealth"], tool:{type:"fixed",id:"thieves-tools",name:"Herramientas de ladrón"},
    equipment:{A:"2 dagas, herramientas de ladrón, juego (cualquiera), 2 bolsas, petate, ropas de viaje y 16 po",B:"50 po"}
  }
];

export const backgroundCatalogue = Object.freeze(Object.fromEntries(
  entries.map(entry => [entry.id, Object.freeze({
    ...entry,
    abilityChoices:Object.freeze([...entry.abilityChoices]),
    skills:Object.freeze([...entry.skills]),
    tool:Object.freeze({...entry.tool}),
    equipment:Object.freeze({...entry.equipment}),
    source:"Player's Handbook 2024, capítulo 4, pp. 180-187",
    status:"verified_from_supplied_source"
  })])
));

export function getBackgroundEntry(id) {
  return backgroundCatalogue[id] ?? null;
}

export function listBackgroundEntries() {
  return BACKGROUND_IDS.map(id => backgroundCatalogue[id]);
}

export function validateBackgroundChoices(backgroundId, abilityIncreases, toolChoice = null) {
  const background = getBackgroundEntry(backgroundId);
  if (!background) return { valid:false, errors:["Trasfondo desconocido."] };

  const errors = [];
  if (!Array.isArray(abilityIncreases)) {
    errors.push("Debes indicar los aumentos de características.");
  } else {
    const abilities = abilityIncreases.map(item => item?.ability);
    if (abilities.some(ability => !background.abilityChoices.includes(ability))) {
      errors.push("El trasfondo no permite uno o más de esos aumentos.");
    }
    const amounts = abilityIncreases.map(item => item?.amount).sort((a,b) => b-a);
    const validPattern =
      (amounts.length === 2 && amounts[0] === 2 && amounts[1] === 1) ||
      (amounts.length === 3 && amounts.every(amount => amount === 1));
    if (!validPattern || new Set(abilities).size !== abilities.length) {
      errors.push("Usa +2 y +1 a características distintas, o +1 a tres distintas.");
    }
  }

  if (background.tool.type === "choice" &&
      (typeof toolChoice !== "string" || !toolChoice.trim())) {
    errors.push("Debes elegir la herramienta indicada por este trasfondo.");
  }
  if (background.tool.type === "fixed" && toolChoice !== null) {
    errors.push("Este trasfondo concede una herramienta fija; no requiere elección.");
  }

  return { valid:errors.length === 0, errors };
}
