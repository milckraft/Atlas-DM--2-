import { getBackgroundEntry } from "../characters/background-catalogue.js";
import { getClassEntry } from "../characters/class-catalogue.js";
import { getSpeciesEntry } from "../characters/species-catalogue.js";

function optionalText(value, max = 1200) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function listText(value, maxItems = 12) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => typeof item === "string" && item.trim()).slice(0, maxItems).map(item => item.trim().slice(0, 160));
}

/**
 * Build a compact, explicit character context from campaign records.
 * Only descriptive character fields are forwarded; mechanics remain owned by
 * the rules engine. No hidden canon or private DM notes are read here.
 */
export function buildCampaignCharacterContext(campaign) {
  const characters = Array.isArray(campaign?.characters) ? campaign.characters : [];
  return characters.slice(0, 8).map(character => {
    const background = getBackgroundEntry(character.background);
    const classEntry = getClassEntry(character.class);
    const species = getSpeciesEntry(character.species);
    const profile = {
      characterId: optionalText(character.id, 100),
      playerId: optionalText(character.playerId, 100),
      name: optionalText(character.name, 100) ?? "Personaje sin nombre",
      level: Number.isInteger(character.level) ? character.level : 1,
      class: classEntry?.name ?? optionalText(character.class, 80),
      species: species?.name ?? optionalText(character.species, 80),
      background: background?.name ?? optionalText(character.background, 80),
      backstory: optionalText(character.backstory ?? character.backstoryText ?? character.biography ?? character.story, 1800),
      personality: optionalText(character.personality, 500),
      ideals: optionalText(character.ideals, 500),
      bonds: optionalText(character.bonds, 500),
      flaws: optionalText(character.flaws, 500),
      goals: listText(character.goals),
      relationships: listText(character.relationships),
      notes: optionalText(character.roleplayNotes ?? character.characterNotes, 600)
    };
    return Object.fromEntries(Object.entries(profile).filter(([, value]) => value !== null && value !== undefined && (!Array.isArray(value) || value.length)));
  });
}

export function buildConversationPayload({ campaign, messages, addressedToDM = false, currentAuthorId = null }) {
  const recent = Array.isArray(messages) ? messages.slice(-30) : [];
  return {
    campaignContext: [
      `Campaña: ${String(campaign?.name ?? "Sin nombre").slice(0, 120)}`,
      `Mundo: ${String(campaign?.worldId ?? "fantasía").slice(0, 80)}`,
      "La IA no recibe canon secreto ni notas privadas del DM en esta fase."
    ].join("\n"),
    characterProfiles: buildCampaignCharacterContext(campaign),
    messages: recent,
    addressedToDM: Boolean(addressedToDM),
    currentAuthorId
  };
}

/**
 * Ask the configured provider to decide whether Atlas should speak.
 * Only validated natural-language replies are returned; this function never
 * executes actions or changes campaign state.
 */
export async function decideCampaignConversation(provider, payload) {
  if (!provider || typeof provider.interpretConversation !== "function") return { status: "unavailable" };
  const decision = await provider.interpretConversation(payload);
  if (!decision || !["respond", "observe", "clarify", "propose_action"].includes(decision.decision)) {
    return { status: "invalid_response" };
  }
  if (typeof decision.reply !== "string" || decision.reply.length > 1800) return { status: "invalid_response" };
  return { status: "ok", decision };
}
