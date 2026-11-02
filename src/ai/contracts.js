export const AI_CAPABILITIES = Object.freeze(["narrative", "image", "structured_map"]);

export function validateBackgroundAnalysis(value, allowedBackgroundIds) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) return { valid:false, errors:["La respuesta debe ser un objeto JSON."] };
  if (typeof value.summary !== "string" || !value.summary.trim()) errors.push("Falta el resumen narrativo.");
  if (!Array.isArray(value.recommendations) || value.recommendations.length < 1 || value.recommendations.length > 3) errors.push("Debe recomendar entre uno y tres trasfondos.");
  else for (const item of value.recommendations) {
    if (!allowedBackgroundIds.includes(item?.backgroundId)) errors.push("La recomendación contiene un trasfondo que no existe en el catálogo.");
    if (typeof item?.reason !== "string" || !item.reason.trim()) errors.push("Cada recomendación necesita una justificación.");
    if (!Array.isArray(item?.storyEvidence) || item.storyEvidence.some(x => typeof x !== "string")) errors.push("Cada recomendación necesita evidencias de la historia.");
  }
  if (typeof value.needsClarification !== "boolean") errors.push("Falta indicar si se necesita aclaración.");
  if (!Array.isArray(value.questions) || value.questions.some(x => typeof x !== "string")) errors.push("Las preguntas deben ser una lista de textos.");
  return { valid:errors.length === 0, errors };
}

export function validateImageRequest(value) {
  return Boolean(value && typeof value === "object" && typeof value.prompt === "string" && value.prompt.trim() && value.prompt.length <= 4000);
}
