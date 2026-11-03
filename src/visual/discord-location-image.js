import { AttachmentBuilder } from "discord.js";

const EXTENSIONS = Object.freeze({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" });

export async function postLocationReferenceImage(channel, image, locationName) {
  if (!channel || typeof channel.send !== "function") throw new TypeError("Canal de Discord no válido.");
  if (!image || !Buffer.isBuffer(image.buffer) || !EXTENSIONS[image.mimeType]) throw new TypeError("Imagen de referencia no válida.");
  const attachment = new AttachmentBuilder(image.buffer, {
    name: `atlas-${String(locationName).replace(/[^a-z0-9_-]/gi, "-").slice(0, 48)}.${EXTENSIONS[image.mimeType]}`
  });
  await channel.send({
    content: `🗺️ **Referencia visual: ${String(locationName).slice(0, 120)}**`,
    files: [attachment],
    allowedMentions: { parse: [] }
  });
}
