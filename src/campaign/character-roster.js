import { randomUUID } from "node:crypto";
import { validateCharacterDraft } from "../characters/character-schema.js";

function ownerId(value) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError("actorId es obligatorio.");
  return value.trim();
}
function validateOwnedCharacter(character, actorId) {
  validateCharacterDraft(character);
  if (typeof character.id !== "string" || !character.id.trim()) throw new TypeError("El personaje necesita un ID.");
  if (character.playerId !== actorId) throw new Error("Solo puedes registrar personajes que te pertenecen.");
  return character;
}
export function createRosterCharacter(input) {
  const character = { ...input, id: input.id ?? randomUUID() };
  validateCharacterDraft(character);
  return character;
}
export function registerCampaignCharacter(state, character, actorId) {
  const owner = ownerId(actorId);
  validateOwnedCharacter(character, owner);
  const next = structuredClone(state);
  if (next.characters.some(item => item.id === character.id)) throw new Error("Ya existe un personaje con ese ID en esta campaña.");
  next.characters.push(structuredClone(character));
  next.updatedAt = new Date().toISOString();
  return next;
}
export function selectActiveCampaignCharacter(state, characterId, actorId) {
  const owner = ownerId(actorId);
  const next = structuredClone(state);
  const character = next.characters.find(item => item.id === characterId);
  if (!character) throw new Error("No existe ese personaje en esta campaña.");
  if (character.playerId !== owner) throw new Error("No puedes seleccionar un personaje de otro jugador.");
  next.flags["activeCharacter:" + owner] = character.id;
  next.updatedAt = new Date().toISOString();
  return next;
}
export function getActiveCampaignCharacter(state, actorId) {
  const owner = ownerId(actorId);
  const id = state.flags?.["activeCharacter:" + owner];
  return state.characters.find(item => item.id === id && item.playerId === owner) ?? null;
}
export function listCampaignCharacters(state, actorId) {
  const owner = ownerId(actorId);
  return state.characters.filter(item => item.playerId === owner);
}
