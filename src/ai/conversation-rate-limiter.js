const DEFAULT_COOLDOWN_MS = 4000;
const DEFAULT_MAX_CHANNELS = 200;

export function createConversationRateLimiter({
  cooldownMs = DEFAULT_COOLDOWN_MS,
  maxChannels = DEFAULT_MAX_CHANNELS,
  now = Date.now
} = {}) {
  if (!Number.isInteger(cooldownMs) || cooldownMs < 0) throw new TypeError("cooldownMs debe ser un entero no negativo.");
  if (!Number.isInteger(maxChannels) || maxChannels < 1) throw new TypeError("maxChannels debe ser un entero positivo.");
  if (typeof now !== "function") throw new TypeError("now debe ser una función.");
  const lastAmbientRequest = new Map();

  return {
    allow(channelId, { addressedToDM = false } = {}) {
      if (typeof channelId !== "string" || !channelId.trim()) throw new TypeError("channelId debe ser texto no vacío.");
      // Explicitly addressed messages are prioritized; ambient chatter is sampled
      // at most once per cooldown window per channel.
      if (addressedToDM) return true;
      const current = now();
      const previous = lastAmbientRequest.get(channelId);
      if (previous !== undefined && current - previous < cooldownMs) return false;
      if (lastAmbientRequest.has(channelId)) lastAmbientRequest.delete(channelId);
      if (lastAmbientRequest.size >= maxChannels) {
        const oldest = lastAmbientRequest.keys().next().value;
        lastAmbientRequest.delete(oldest);
      }
      lastAmbientRequest.set(channelId, current);
      return true;
    },
    clear(channelId) {
      if (channelId == null) lastAmbientRequest.clear();
      else lastAmbientRequest.delete(channelId);
    },
    get size() { return lastAmbientRequest.size; }
  };
}
