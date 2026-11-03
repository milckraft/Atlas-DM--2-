import test from "node:test";
import assert from "node:assert/strict";
import { createCampaignState } from "../src/campaign/campaign-schema.js";
import { enterCampaignLocation, registerCampaignLocation } from "../src/campaign/location-transitions.js";

function campaign() {
  return createCampaignState({ campaignId: "guild-1", name: "Edrava", locations: [] });
}

test("solo permite entrar a ubicaciones registradas y guarda transición persistente", () => {
  const registered = registerCampaignLocation(campaign(), { id: "tavern-1", name: "La Corona Rota", description: "Taberna del camino." });
  const result = enterCampaignLocation(registered.state, { locationId: "tavern-1", actorId: "gm-1" });
  assert.equal(result.status, "entered");
  assert.equal(result.state.currentLocationId, "tavern-1");
  assert.equal(result.state.events.at(-1).type, "location-entered");
  assert.equal(enterCampaignLocation(result.state, { locationId: "tavern-1" }).status, "already_there");
});

test("rechaza IDs desconocidos y ubicaciones duplicadas", () => {
  const state = campaign();
  assert.equal(enterCampaignLocation(state, { locationId: "unknown" }).status, "unknown_location");
  const registered = registerCampaignLocation(state, { id: "town", name: "Pueblo", description: "Un pueblo." });
  assert.throws(() => registerCampaignLocation(registered.state, { id: "town", name: "Otro", description: "Otro lugar." }), /Ya existe/);
});
