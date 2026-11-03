const providers = new Map();
export function registerAIProvider(name, provider) {
  if (typeof name !== "string" || !name.trim()) throw new TypeError("El proveedor necesita un nombre.");
  if (!provider || typeof provider !== "object") throw new TypeError("Proveedor inválido.");
  providers.set(name, provider);
}
export function getAIProvider(name) { return providers.get(name) ?? null; }
export function listAIProviders() { return [...providers.keys()]; }
export async function requestAI(capability, payload, { providerName = process.env.AI_PROVIDER || (providers.has("cloudflare") ? "cloudflare" : "disabled") } = {}) {
  const provider = getAIProvider(providerName);
  if (!provider) return { status:"unavailable", reason:"No hay un proveedor de IA configurado." };
  if (typeof provider[capability] !== "function") return { status:"unsupported", reason:`El proveedor no admite la capacidad: ${capability}.` };
  try { return { status:"ok", data:await provider[capability](payload) }; }
  catch (error) { return { status:"error", reason:"El proveedor de IA no pudo completar la solicitud.", error }; }
}
