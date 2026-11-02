import { randomUUID } from "node:crypto";
import { createCampaignState } from "./campaign-schema.js";
import { validateCharacterDraft } from "../characters/character-schema.js";

const activeKey = playerId => `activeCharacter:${playerId}`;

/** Registers a validated character under the Discord account that created it. */
export function registerCampaignCharacter(state, character, actorId, { id = randomUUID() } = {}) {
  const campaign = createCampaignState(state);
  validateCharacterDraft(character);
  if (typeof actorId !== "string" || !actorId.trim() || character.playerId !== actorId) {
    throw new Error("Solo puedes registrar una ficha vinculada a tu propia cuenta.");
  }
  if (campaign.characters.some(item => item.id === id)) {
    throw new Error("Ya existe un personaje con ese identificador.");
  }
  const registered = {
    ...character,
    id,
    ownerId: actorId,
    createdAt: character.createdAt ?? new Date().toISOString()
  };
  campaign.characters.push(registered);
  if (!campaign.flags[activeKey(actorId)]) campaign.flags[activeKey(actorId)] = id;
  campaign.updatedAt = new Date().toISOString();
  return { state: createCampaignState(campaign), character: registered };
}

/** Selects one of the requesting player's registered characters as active. */
export function selectActiveCampaignCharacter(state, characterId, actorId) {
  const campaign = createCampaignState(state);
  const character = campaign.characters.find(item => item.id === characterId);
  if (!character || character.ownerId !== actorId || character.playerId !== actorId) {
    throw new Error("No se encontró ese personaje entre tus fichas de campaña.");
  }
  campaign.flags[activeKey(actorId)] = characterId;
  campaign.updatedAt = new Date().toISOString();
  return createCampaignState(campaign);
}

/** Returns the active character only when it belongs to the requesting player. */
export function getActiveCampaignCharacter(state, actorId) {
  const campaign = createCampaignState(state);
  const characterId = campaign.flags[activeKey(actorId)];
  if (typeof characterId !== "string") return null;
  const character = campaign.characters.find(item => item.id === characterId);
  if (!character || character.ownerId !== actorId || character.playerId !== actorId) return null;
  return character;
}
