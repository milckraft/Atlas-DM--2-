import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createLocationImageWorkflow } from "../src/visual/location-image-workflow.js";

const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,1,2,3]);

test("publica una referencia visual cuando el motor notifica entrada a un lugar", async () => {
  const directory = await mkdtemp(join(tmpdir(), "atlas-workflow-"));
  let generated = 0;
  const sent = [];
  const channel = { async send(payload) { sent.push(payload); } };
  try {
    const workflow = createLocationImageWorkflow({
      directory,
      provider: { async generateImage() { generated++; return { mimeType: "image/png", imageBase64: png.toString("base64") }; } },
      resolveChannel: async id => id === "channel-1" ? channel : null
    });
    const event = { campaignId: "campaign-1", locationId: "city-1", locationName: "Edrava", description: "Una ciudad amurallada.", channelId: "channel-1" };
    assert.equal((await workflow.onLocationEntered(event)).status, "generated");
    assert.equal((await workflow.onLocationEntered(event)).status, "cached");
    assert.equal(generated, 1);
    assert.equal(sent.length, 2);
    assert.equal(sent[0].files.length, 1);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("no genera imágenes si el canal no está disponible", async () => {
  let generated = 0;
  const workflow = createLocationImageWorkflow({
    provider: { async generateImage() { generated++; return { mimeType: "image/png", imageBase64: png.toString("base64") }; } },
    resolveChannel: async () => null
  });
  const result = await workflow.onLocationEntered({ campaignId: "c", locationId: "l", locationName: "Lugar", description: "Descripción", channelId: "missing" });
  assert.equal(result.status, "channel_unavailable");
  assert.equal(generated, 0);
});
