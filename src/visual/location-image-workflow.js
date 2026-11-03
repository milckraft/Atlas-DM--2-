import { createLocationImageService } from "./location-image-service.js";
import { postLocationReferenceImage } from "./discord-location-image.js";

export function createLocationImageWorkflow({ provider, directory, resolveChannel } = {}) {
  if (typeof resolveChannel !== "function") throw new TypeError("resolveChannel debe ser una función.");
  const images = createLocationImageService({ provider, directory });

  return Object.freeze({
    async onLocationEntered({ campaignId, locationId, locationName, description, channelId }) {
      if (typeof channelId !== "string" || !channelId.trim()) return { status: "invalid_channel" };
      const channel = await resolveChannel(channelId);
      if (!channel || typeof channel.send !== "function") return { status: "channel_unavailable" };
      const image = await images.getOrCreate({ campaignId, locationId, locationName, description });
      if (!["generated", "cached"].includes(image.status)) return image;
      await postLocationReferenceImage(channel, image, locationName);
      return { status: image.status, cacheKey: image.cacheKey };
    }
  });
}
