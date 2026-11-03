import { createCampaignState, appendCampaignEvent } from "./campaign-schema.js";

function clean(value, field, max) {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new TypeError(`${field} debe contener entre 1 y ${max} caracteres.`);
  return value.trim();
}

export function registerCampaignLocation(state, { id, name, description, channelId = null }) {
  const campaign = createCampaignState(state);
  const safeId = clean(id, "id", 120);
  const safeName = clean(name, "name", 160);
  const safeDescription = clean(description, "description", 1800);
  if (campaign.locations.some(location => location.id === safeId)) throw new Error("Ya existe una ubicación con ese ID.");
  const location = { id: safeId, name: safeName, description: safeDescription, channelId: channelId == null ? null : clean(channelId, "channelId", 120) };
  campaign.locations.push(location);
  campaign.updatedAt = new Date().toISOString();
  return { state: createCampaignState(campaign), location };
}

export function enterCampaignLocation(state, { locationId, actorId }) {
  const campaign = createCampaignState(state);
  const safeId = clean(locationId, "locationId", 120);
  const location = campaign.locations.find(item => item.id === safeId);
  if (!location) return { status: "unknown_location", state: campaign };
  if (campaign.currentLocationId === safeId) return { status: "already_there", state: campaign, location };
  campaign.currentLocationId = safeId;
  campaign.updatedAt = new Date().toISOString();
  const next = appendCampaignEvent(campaign, {
    type: "location-entered",
    source: "campaign",
    actorId: actorId ?? null,
    summary: `El grupo llegó a ${location.name}.`
  });
  return { status: "entered", state: createCampaignState(next), location };
}
