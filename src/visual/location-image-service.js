import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function requiredText(value, field, max = 1000) {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    throw new TypeError(`${field} debe ser texto no vacío de hasta ${max} caracteres.`);
  }
  return value.trim();
}

export function createLocationImageService({ provider, directory = process.env.ATLAS_DATA_DIR || "./data/campaigns" } = {}) {
  if (!provider || typeof provider.generateImage !== "function") throw new TypeError("El proveedor debe implementar generateImage().");
  const cacheDirectory = resolve(directory, "image-cache");

  return {
    async getOrCreate({ campaignId, locationId, locationName, description, style = "fantasía medieval ilustrada, composición panorámica, sin texto" }) {
      const safeCampaignId = requiredText(campaignId, "campaignId", 100);
      const safeLocationId = requiredText(locationId, "locationId", 120);
      const name = requiredText(locationName, "locationName", 160);
      const detail = requiredText(description, "description", 1800);
      const prompt = `Arte de referencia para un escenario de fantasía de D&D. Lugar: ${name}. Descripción: ${detail}. Estilo: ${style}. No incluir letras, rótulos ni marcas de agua.`;
      const cacheKey = createHash("sha256").update([safeCampaignId, safeLocationId, prompt].join("\\n")).digest("hex");
      const filePath = join(cacheDirectory, `${cacheKey}.img`);

      await mkdir(cacheDirectory, { recursive: true });
      try {
        const cached = await readFile(filePath);
        if (cached.length > 0 && cached.length <= MAX_IMAGE_BYTES) {
          const mimeType = cached.subarray(0, 8).toString("hex").startsWith("89504e47") ? "image/png" :
            cached.subarray(0, 3).toString("hex") === "ffd8ff" ? "image/jpeg" :
            cached.subarray(0, 4).toString() === "RIFF" ? "image/webp" : null;
          if (mimeType) return { status: "cached", mimeType, buffer: cached, cacheKey };
        }
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }

      const generated = await provider.generateImage({ prompt });
      if (!generated || !ALLOWED_MIME.has(generated.mimeType) || typeof generated.imageBase64 !== "string") {
        return { status: "invalid_image" };
      }
      const buffer = Buffer.from(generated.imageBase64, "base64");
      if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) return { status: "image_too_large" };
      await writeFile(filePath, buffer, { flag: "wx" }).catch(async error => {
        if (error.code !== "EEXIST") throw error;
      });
      return { status: "generated", mimeType: generated.mimeType, buffer, cacheKey };
    }
  };
}
