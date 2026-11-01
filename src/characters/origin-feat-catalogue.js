/**
 * Structured catalogue of the 2024 Player's Handbook origin feats.
 * Effects are concise original summaries, not reproduced rulebook prose.
 * Source: supplied Spanish Player's Handbook, chapter 5, pp. 200-204.
 */

export const ORIGIN_FEAT_CATALOGUE_VERSION = "2024-phb-es";
export const ORIGIN_FEAT_IDS = Object.freeze([
  "lucky","alert","savage-attacker","tough","crafter",
  "skilled","magic-initiate","tavern-brawler","musician","healer"
]);

const entries = [
  {
    id:"lucky", name:"Afortunado", repeatable:false, prerequisites:[],
    mechanics:{
      luckPoints:"proficiency-bonus",
      refresh:"long-rest",
      benefits:["Spend 1 luck point to gain advantage on a d20 test you make.",
        "Spend 1 luck point to impose disadvantage on an attack roll made against you."]
    }
  },
  {
    id:"alert", name:"Alerta", repeatable:false, prerequisites:[],
    mechanics:{
      benefits:["Add your proficiency bonus to initiative rolls.",
        "Immediately after initiative is rolled, you may swap your initiative with a willing ally in the same combat; neither of you can be incapacitated."]
    }
  },
  {
    id:"savage-attacker", name:"Atacante salvaje", repeatable:false, prerequisites:[],
    mechanics:{
      benefits:["Once per turn when you hit with a weapon, roll the weapon's damage dice twice and use either result."]
    }
  },
  {
    id:"tough", name:"Duro", repeatable:false, prerequisites:[],
    mechanics:{
      benefits:["Increase maximum hit points by twice your character level when you take this feat.",
        "Whenever you gain a character level afterward, increase maximum hit points by 2."]
    }
  },
  {
    id:"crafter", name:"Fabricante", repeatable:false, prerequisites:[],
    mechanics:{
      benefits:["Gain proficiency with three artisan's tools of your choice.",
        "Nonmagical purchases receive a 20% discount.",
        "After a long rest, craft one eligible temporary item if you have and are proficient with its associated artisan's tools; it lasts until your next long rest."]
    }
  },
  {
    id:"skilled", name:"Habilidoso", repeatable:true, prerequisites:[],
    mechanics:{
      choices:3,
      choiceTypes:["skill-proficiency","tool-proficiency"],
      benefits:["Gain proficiency in any combination of three skills or tools."]
    }
  },
  {
    id:"magic-initiate", name:"Iniciado en la magia", repeatable:true, prerequisites:[],
    mechanics:{
      spellLists:["cleric","druid","wizard"],
      cantrips:2,
      level1Spells:1,
      freeCast:"once-per-long-rest",
      spellcastingAbilityChoices:["INT","WIS","CHA"],
      benefits:["Choose one listed spell list and learn two cantrips from it.",
        "Choose one level 1 spell from the same list; it is always prepared and can be cast once without a spell slot per long rest.",
        "You may also cast the level 1 spell using spell slots you have.",
        "When you gain a level, you may replace one spell chosen for this feat with another spell of the same level from the selected list."]
    },
    repeatRule:"Each selection must use a different spell list."
  },
  {
    id:"tavern-brawler", name:"Matón de taberna", repeatable:false, prerequisites:[],
    mechanics:{
      benefits:["Unarmed strikes can deal 1d4 + Strength modifier bludgeoning damage.",
        "When rolling damage for an unarmed strike, reroll a 1 and use the new result.",
        "Gain proficiency with improvised weapons.",
        "Once per turn when you hit with an unarmed strike as part of the Attack action, you may push the target 5 feet."]
    }
  },
  {
    id:"musician", name:"Músico", repeatable:false, prerequisites:[],
    mechanics:{
      instrumentChoices:3,
      benefits:["Gain proficiency with three musical instruments of your choice.",
        "After a short or long rest, perform with an instrument you are proficient with to grant Heroic Inspiration to listening allies, up to a number of allies equal to your proficiency bonus."]
    }
  },
  {
    id:"healer", name:"Sanador", repeatable:false, prerequisites:[],
    mechanics:{
      benefits:["With a healer's kit, use an action and expend one use to let a creature within 5 feet spend one Hit Point Die; it regains the die roll plus your proficiency bonus.",
        "When rolling healing from a spell or this feat's battlefield treatment, reroll a 1 and use the new result."]
    }
  }
];

export const originFeatCatalogue = Object.freeze(Object.fromEntries(
  entries.map(entry => [entry.id, Object.freeze({
    ...entry,
    prerequisites:Object.freeze([...entry.prerequisites]),
    mechanics:Object.freeze({...entry.mechanics,
      benefits:Object.freeze([...entry.mechanics.benefits])
    }),
    source:"Player's Handbook 2024, capítulo 5, pp. 200-204",
    status:"verified_from_supplied_source"
  })])
));

export function getOriginFeat(id) {
  return originFeatCatalogue[id] ?? null;
}

export function listOriginFeats() {
  return ORIGIN_FEAT_IDS.map(id => originFeatCatalogue[id]);
}

export function validateOriginFeatSelection(id, options = {}) {
  const feat = getOriginFeat(id);
  if (!feat) return {valid:false,errors:["Dote de origen desconocida."]};

  const errors = [];
  if (id === "magic-initiate") {
    if (!feat.mechanics.spellLists.includes(options.spellList)) {
      errors.push("Elige una lista de conjuros válida para Iniciado en la magia.");
    }
    if (!feat.mechanics.spellcastingAbilityChoices.includes(options.spellcastingAbility)) {
      errors.push("Elige Inteligencia, Sabiduría o Carisma como aptitud mágica.");
    }
  }
  if (id === "skilled") {
    const choices = options.choices;
    if (!Array.isArray(choices) || choices.length !== 3 ||
        choices.some(choice => !["skill-proficiency","tool-proficiency"].includes(choice?.type) ||
          typeof choice?.id !== "string" || !choice.id.trim())) {
      errors.push("Habilidoso requiere tres competencias de habilidad o herramienta.");
    }
  }
  if (id === "crafter" && (!Array.isArray(options.tools) || options.tools.length !== 3 ||
      options.tools.some(tool => typeof tool !== "string" || !tool.trim()) ||
      new Set(options.tools).size !== 3)) {
    errors.push("Fabricante requiere tres herramientas de artesano distintas.");
  }
  if (id === "musician" && (!Array.isArray(options.instruments) ||
      options.instruments.length !== 3 ||
      options.instruments.some(item => typeof item !== "string" || !item.trim()) ||
      new Set(options.instruments).size !== 3)) {
    errors.push("Músico requiere tres instrumentos musicales distintos.");
  }
  return {valid:errors.length === 0,errors};
}
