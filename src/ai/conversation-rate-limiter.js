const DEFAULT_AMBIENT_COOLDOWN_MS = 4000;
const DEFAULT_DIRECTED_COOLDOWN_MS = 1500;
const DEFAULT_MAX_ENTRIES = 400;

export function createConversationRateLimiter({
  cooldownMs = DEFAULT_AMBIENT_COOLDOWN_MS,
  addressedCooldownMs = DEFAULT_DIRECTED_COOLDOWN_MS,
  maxChannels = DEFAULT_MAX_ENTRIES,
  now = Date.now
} = {}) {
  if (!Number.isInteger(cooldownMs) || cooldownMs < 0) throw new TypeError("cooldownMs debe ser un entero no negativo.");
  if (!Number.isInteger(addressedCooldownMs) || addressedCooldownMs < 0) throw new TypeError("addressedCooldownMs debe ser un entero no negativo.");
  if (!Number.isInteger(maxChannels) || maxChannels < 1) throw new TypeError("maxChannels debe ser un entero positivo.");
  if (typeof now !== "function") throw new TypeError("now debe ser una función.");
  const requests = new Map();

  return {
    allow(channelId, { addressedToDM = false, userId = null } = {}) {
      if (typeof channelId !== "string" || !channelId.trim()) throw new TypeError("channelId debe ser texto no vacío.");
      if (addressedToDM && (typeof userId !== "string" || !userId.trim())) throw new TypeError("userId es obligatorio para mensajes dirigidos a Atlas.");
      const key = addressedToDM ? `directed:${channelId}:${userId}` : `ambient:${channelId}`;
      const cooldown = addressedToDM ? addressedCooldownMs : cooldownMs;
      const current = now();
      const previous = requests.get(key);
      if (previous !== undefined && current - previous < cooldown) return false;
      if (requests.has(key)) requests.delete(key);
      if (requests.size >= maxChannels) requests.delete(requests.keys().next().value);
      requests.set(key, current);
      return true;
    },
    clear(channelId) {
      if (channelId == null) requests.clear();
      else for (const key of requests.keys()) if (key.includes(`:${channelId}:`) || key === `ambient:${channelId}`) requests.delete(key);
    },
    get size() { return requests.size; }
  };
}
