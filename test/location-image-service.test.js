import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createLocationImageService } from "../src/visual/location-image-service.js";

const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,1,2,3]);

test("genera una imagen de lugar y reutiliza la caché sin llamar de nuevo al modelo", async () => {
  const directory = await mkdtemp(join(tmpdir(), "atlas-image-"));
  let calls = 0;
  try {
    const service = createLocationImageService({
      directory,
      provider: { async generateImage() { calls++; return { mimeType: "image/png", imageBase64: png.toString("base64") }; } }
    });
    const request = { campaignId: "campaign-1", locationId: "tavern-1", locationName: "La Corona Rota", description: "Una taberna cálida junto al camino." };
    const first = await service.getOrCreate(request);
    const second = await service.getOrCreate(request);
    assert.equal(first.status, "generated");
    assert.equal(second.status, "cached");
    assert.deepEqual(second.buffer, png);
    assert.equal(calls, 1);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("rechaza identificadores vacíos y descripciones demasiado largas", async () => {
  const service = createLocationImageService({ provider: { generateImage: async () => ({}) } });
  const valid = { campaignId: "campaign-1", locationId: "location-1", locationName: "Lugar", description: "Descripción" };
  await assert.rejects(() => service.getOrCreate({ ...valid, campaignId: " " }));
  await assert.rejects(() => service.getOrCreate({ ...valid, locationId: "" }));
  await assert.rejects(() => service.getOrCreate({ ...valid, description: "x".repeat(1801) }));
});

test("rechaza respuestas de imagen con formato no permitido", async () => {
  const directory = await mkdtemp(join(tmpdir(), "atlas-image-"));
  try {
    const service = createLocationImageService({ directory, provider: { async generateImage() { return { mimeType: "text/plain", imageBase64: "aGVsbG8=" }; } } });
    const result = await service.getOrCreate({ campaignId: "c1", locationId: "l1", locationName: "Lugar", description: "Descripción" });
    assert.equal(result.status, "invalid_image");
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("rechaza una imagen cuyo contenido no coincide con el MIME declarado", async () => {
  const directory = await mkdtemp(join(tmpdir(), "atlas-image-"));
  try {
    const service = createLocationImageService({
      directory,
      provider: { async generateImage() { return { mimeType: "image/webp", imageBase64: png.toString("base64") }; } }
    });
    const result = await service.getOrCreate({ campaignId: "c1", locationId: "l1", locationName: "Lugar", description: "Descripción" });
    assert.equal(result.status, "invalid_image");
  } finally { await rm(directory, { recursive: true, force: true }); }
});
