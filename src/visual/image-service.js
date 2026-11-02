import { validateImageRequest } from "../ai/contracts.js";
let imageProvider = null;
export function configureImageProvider(provider) {
  if (provider !== null && typeof provider?.generate !== "function") throw new TypeError("El proveedor de imágenes debe implementar generate().");
  imageProvider = provider;
}
export async function generateReferenceImage(request) {
  if (!validateImageRequest(request)) return { status:"invalid_request" };
  if (!imageProvider) return { status:"unavailable", reason:"La generación de imágenes aún no tiene un proveedor gratuito compatible configurado." };
  try { const result = await imageProvider.generate({ prompt:request.prompt, style:"realistic_fantasy" }); return result ? { status:"ok", image:result } : { status:"empty_result" }; }
  catch { return { status:"error", reason:"No se pudo generar la imagen." }; }
}
