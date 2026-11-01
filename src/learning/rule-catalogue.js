/**
 * Concise learning references. These summaries are not a replacement for
 * the rulebook; verification describes the implementation/source status.
 */
const entries = [
  {
    id: "d20-roll-modes",
    title: "Tirada de d20",
    keywords: ["d20", "ventaja", "desventaja", "tirada"],
    category: "core",
    status: "engine_verified",
    source: "Atlas DM dice engine",
    summary: "Una tirada normal usa un d20. Con ventaja se tiran dos d20 y se conserva el mayor; con desventaja se conserva el menor.",
    detail: "Atlas DM implementa estos tres modos en su motor de dados. La tirada se genera de forma independiente de la narración."
  },
  {
    id: "ability-check",
    title: "Prueba de característica",
    keywords: ["prueba", "característica", "modificador", "competencia", "cd"],
    category: "core",
    status: "engine_verified",
    source: "Atlas DM ability-check engine",
    summary: "El motor suma el d20, el modificador de la característica y, si corresponde, el bonificador por competencia. El total se compara con la CD.",
    detail: "Quien solicita la prueba debe indicar la característica, puntuación, CD y si el personaje tiene competencia. El motor no adivina competencias."
  },
  {
    id: "rogue-sneak-attack",
    title: "Ataque furtivo",
    keywords: ["pícaro", "ataque furtivo", "furtivo", "finesse", "sutil"],
    category: "class-feature",
    status: "partial_engine",
    source: "Manual del jugador 2024, progresión de pícaro; implementación Atlas DM",
    summary: "La progresión del pícaro determina cuántos dados de daño adicionales corresponden. La elegibilidad depende del arma y de las condiciones de combate.",
    detail: "Atlas DM tiene la progresión de dados y una comprobación de elegibilidad. La resolución completa del ataque y la integración con todo el combate siguen pendientes; consulta el manual para la regla oficial completa."
  },
  {
    id: "rogue-cunning-strike",
    title: "Golpe astuto",
    keywords: ["golpe astuto", "cunning strike", "pícaro"],
    category: "class-feature",
    status: "partial_engine",
    source: "Manual del jugador 2024; datos Atlas DM pendientes de verificación visual en opciones",
    summary: "El pícaro puede intercambiar parte de sus dados de Ataque furtivo por efectos especiales.",
    detail: "Atlas DM contiene un validador parcial de opciones y costes. Algunas opciones todavía requieren verificación directa con la fuente; no debe tratarse este catálogo como una resolución oficial completa."
  }
];

export const RULE_CATALOGUE = Object.freeze(entries.map(entry =>
  Object.freeze({ ...entry, keywords: Object.freeze([...entry.keywords]) })
));

export function getRuleById(id) {
  return RULE_CATALOGUE.find(entry => entry.id === id) ?? null;
}

export function searchRules(query) {
  if (typeof query !== "string" || !query.trim()) return [];
  const terms = query.toLocaleLowerCase("es").trim().split(/\\s+/);
  return RULE_CATALOGUE
    .map(entry => {
      const haystack = [entry.title, entry.id, ...entry.keywords].join(" ").toLocaleLowerCase("es");
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      return { entry, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, "es"))
    .map(result => result.entry);
}
