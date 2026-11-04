import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createCampaignState, appendCampaignEvent } from "../src/campaign/campaign-schema.js";
import { createCampaignStore } from "../src/campaign/campaign-store.js";

function fixture(overrides = {}) {
  return {
    campaignId: "edrava-test",
    name: "Las cenizas del camino",
    worldId: "edrava",
    canonVersion: "1",
    canonRefs: ["region:norte"],
    characters: [{ id: "pc-jiedem", name: "Jiedem", level: 1 }],
    ...overrides
  };
}

test("campaign state separates canon references from mutable campaign events", () => {
  const state = createCampaignState(fixture());
  const changed = appendCampaignEvent(state, {
    type: "npc-met",
    summary: "El grupo conoció a una mercader en el camino.",
    canonRefs: ["npc:merchant-01"]
  });
  assert.deepEqual(changed.canonRefs, ["region:norte"]);
  assert.equal(changed.events[0].source, "campaign");
  assert.deepEqual(changed.events[0].canonRefs, ["npc:merchant-01"]);
  assert.equal(state.events.length, 0);
});

test("campaign schema rejects duplicate record IDs and invalid statuses", () => {
  assert.throws(() => createCampaignState(fixture({ npcs: [{id:"n1"},{id:"n1"}] })), /duplicado/);
  assert.throws(() => createCampaignState(fixture({ status: "unknown" })), /Estado/);
});

test("store persists and reloads a campaign", async () => {
  const dir = await mkdtemp(join(tmpdir(), "atlas-campaign-"));
  try {
    const store = createCampaignStore({ directory: dir });
    const created = await store.create(fixture());
    const loaded = await store.get("edrava-test");
    assert.equal(created.campaignId, loaded.campaignId);
    assert.equal(loaded.characters[0].name, "Jiedem");
    assert.deepEqual(loaded.canonRefs, ["region:norte"]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("store rejects path traversal and reports missing campaigns", async () => {
  const dir = await mkdtemp(join(tmpdir(), "atlas-campaign-"));
  try {
    const store = createCampaignStore({ directory: dir });
    await assert.rejects(store.get("../secrets"), /ID de campaña/);
    assert.equal(await store.get("missing-campaign"), null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("conserva ubicación actual y canal tras reiniciar el almacenamiento", async () => {
  const dir = await mkdtemp(join(tmpdir(), "atlas-restart-"));
  try {
    const firstStore = createCampaignStore({ directory: dir });
    const state = createCampaignState(fixture({
      locations: [{
        id: "tavern",
        name: "La Corona Rota",
        description: "Una taberna.",
        channelId: "123456789"
      }],
      currentLocationId: "tavern"
    }));
    await firstStore.create(state);

    const restartedStore = createCampaignStore({ directory: dir });
    const loaded = await restartedStore.get("edrava-test");
    assert.equal(loaded.currentLocationId, "tavern");
    assert.equal(loaded.locations[0].channelId, "123456789");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
