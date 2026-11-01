import { ABILITIES, SKILLS, createCharacterDraft } from "./character-schema.js";
import { assignStandardArray, applyBackgroundAbilityIncreases } from "./ability-scores.js";
import { getBackgroundEntry, validateBackgroundChoices } from "./background-catalogue.js";
import { getOriginFeat, validateOriginFeatSelection } from "./origin-feat-catalogue.js";
import { getSpeciesEntry, validateSpeciesSelection } from "./species-catalogue.js";
import { getClassEntry, isClassPlayable } from "./class-catalogue.js";

const BACKGROUND_FEAT_IDS = Object.freeze({
  "Magic Initiate (Cleric)": "magic-initiate",
  "Magic Initiate (Druid)": "magic-initiate",
  "Magic Initiate (Wizard)": "magic-initiate",
  "Lucky": "lucky",
  "Alert": "alert",
  "Savage Attacker": "savage-attacker",
  "Tough": "tough",
  "Crafter": "crafter",
  "Skilled": "skilled",
  "Tavern Brawler": "tavern-brawler",
  "Musician": "musician",
  "Healer": "healer"
});

const toSchemaSkill = id => id.replaceAll("-", "_");

function validateFeat(featId, options, label, errors) {
  if (!getOriginFeat(featId)) {
    errors.push(`${label}: la dote "${featId}" no está en el catálogo de dotes de origen.`);
    return;
  }
  const result = validateOriginFeatSelection(featId, options ?? {});
  for (const error of result.errors) errors.push(`${label}: ${error}`);
}

/**
 * Builds a validated level-1 character draft from the catalogues currently
 * present in the repository. Class mechanics are explicitly marked pending:
 * this function does not invent class hit points, proficiencies or features.
 */
export function createCharacterFromChoices(input) {
  const errors = [];
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Los datos del personaje deben ser un objeto."] };
  }

  const classEntry = getClassEntry(input.class);
  if (!classEntry) errors.push("Debes elegir una clase oficial del catálogo.");

  const background = getBackgroundEntry(input.background);
  if (!background) errors.push("Debes elegir uno de los 16 trasfondos del catálogo.");

  const species = getSpeciesEntry(input.species);
  if (!species) errors.push("Debes elegir una de las 10 especies del catálogo.");

  if (!classEntry || !background || !species) return { valid: false, errors };

  let baseScores;
  let finalScores;
  try {
    baseScores = assignStandardArray(input.baseAbilityScores);
    finalScores = applyBackgroundAbilityIncreases(baseScores, input.abilityIncreases);
  } catch (error) {
    errors.push(error.message);
  }

  const backgroundValidation = validateBackgroundChoices(
    input.background,
    input.abilityIncreases,
    input.backgroundToolChoice ?? null
  );
  errors.push(...backgroundValidation.errors);

  const speciesValidation = validateSpeciesSelection(input.species, input.speciesChoices ?? {});
  errors.push(...speciesValidation.errors);

  const backgroundFeatId = BACKGROUND_FEAT_IDS[background.originFeat];
  const backgroundFeatOptions = input.backgroundFeatOptions ?? {};
  if (!backgroundFeatId) {
    errors.push("La dote concedida por el trasfondo aún no tiene correspondencia en el catálogo.");
  } else {
    validateFeat(backgroundFeatId, backgroundFeatOptions, "Dote del trasfondo", errors);
  }

  const extraFeatId = input.species === "human" ? input.humanOriginFeat : null;
  if (input.species === "human") {
    if (typeof extraFeatId !== "string" || !extraFeatId.trim()) {
      errors.push("El rasgo Versátil del humano requiere elegir una dote de origen adicional.");
    } else {
      validateFeat(extraFeatId, input.humanOriginFeatOptions ?? {}, "Dote adicional humana", errors);
    }
  }

  const backgroundSkills = background.skills.map(toSchemaSkill);
  const speciesSkill = input.species === "human"
    ? input.speciesChoices?.skill
    : input.species === "elf"
      ? input.speciesChoices?.keenSense
      : null;
  const extraSkills = [];
  if (speciesSkill) extraSkills.push(toSchemaSkill(speciesSkill));

  if (backgroundSkills.some(skill => !SKILLS.includes(skill)) ||
      extraSkills.some(skill => !SKILLS.includes(skill))) {
    errors.push("Una competencia de habilidad no coincide con el identificador interno del catálogo.");
  }

  const selectedSkills = [...backgroundSkills, ...extraSkills];
  if (new Set(selectedSkills).size !== selectedSkills.length) {
    errors.push("Una habilidad no puede añadirse dos veces como competencia de origen.");
  }

  if (!Array.isArray(input.languages) || input.languages.length < 3 ||
      input.languages.some(language => typeof language !== "string" || !language.trim())) {
    errors.push("Indica al menos tres idiomas: común y dos idiomas estándar elegidos.");
  }

  if (errors.length) return { valid: false, errors };

  let character;
  try {
    character = createCharacterDraft({
      name: input.name,
      playerId: input.playerId,
      class: input.class,
      background: input.background,
      species: input.species,
      level: 1,
      abilities: finalScores,
      abilityChoices: {
        base: baseScores,
        increases: input.abilityIncreases.map(item => ({ ...item }))
      },
      languages: input.languages,
      proficiencies: {
        skills: selectedSkills,
        tools: [
          ...(background.tool.type === "fixed"
            ? [background.tool.id]
            : [input.backgroundToolChoice]),
          ...(input.humanOriginFeatOptions?.choices ?? [])
            .filter(choice => choice.type === "tool-proficiency")
            .map(choice => choice.id),
          ...(input.backgroundFeatOptions?.choices ?? [])
            .filter(choice => choice.type === "tool-proficiency")
            .map(choice => choice.id)
        ]
      },
      originFeat: {
        background: { id: backgroundFeatId, options: backgroundFeatOptions },
        ...(extraFeatId ? {
          species: { id: extraFeatId, options: input.humanOriginFeatOptions ?? {} }
        } : {})
      },
      speciesTraits: species.traits.map(trait => trait.id),
      speed: species.speedMeters,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt
    });
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }

  return {
    valid: true,
    character: {
      ...character,
      speciesChoices: { ...(input.speciesChoices ?? {}) },
      backgroundToolChoice: input.backgroundToolChoice ?? null,
      creationStatus: isClassPlayable(input.class)
        ? "ready_for_class_rules_validation"
        : "draft_pending_class_rules",
      rulesReadiness: {
        origin: true,
        abilityScores: true,
        species: true,
        background: true,
        originFeats: true,
        class: isClassPlayable(input.class)
      }
    },
    warnings: isClassPlayable(input.class)
      ? []
      : ["La clase está identificada, pero su tabla, competencias, puntos de golpe, rasgos y progresión aún no están verificados. La ficha es un borrador y no debe iniciar una partida con reglas completas."]
  };
}

export function listCharacterCreationRequirements() {
  return {
    required: [
      "name", "playerId", "class", "background", "species",
      "baseAbilityScores", "abilityIncreases", "languages"
    ],
    conditional: [
      "backgroundToolChoice para trasfondos con herramienta a elegir",
      "backgroundFeatOptions para dotes que requieren elecciones",
      "speciesChoices para linajes, tamaño y rasgos con elección",
      "humanOriginFeat y humanOriginFeatOptions para humanos"
    ],
    abilityIds: [...ABILITIES],
    minimumLanguages: 3
  };
}
