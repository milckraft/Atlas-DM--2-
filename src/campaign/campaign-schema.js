const STATUSES = new Set(["active", "paused", "completed", "abandoned"]);
const MAX_EVENTS = 2000;
const MAX_TEXT = 8000;

function text(value, field, { optional = false, max = MAX_TEXT } = {}) {
  if (optional && value == null) return null;
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new TypeError(`${field} debe ser texto no vacío de hasta ${max} caracteres.`);
  return value.trim();
}
function stringArray(value, field, maxItems = 100) {
  if (!Array.isArray(value) || value.length > maxItems || value.some(item => typeof item !== "string" || !item.trim() || item.length > 500)) throw new TypeError(`${field} debe ser una lista válida de textos.`);
  return [...new Set(value.map(item => item.trim()))];
}
function normalizeRecords(records, field) {
  if (!Array.isArray(records) || records.length > 1000) throw new TypeError(`${field} debe ser una lista de registros.`);
  const ids = new Set();
  return records.map(record => {
    if (!record || typeof record !== "object" || Array.isArray(record)) throw new TypeError(`Registro inválido en ${field}.`);
    const id = text(record.id, `${field}.id`, { max: 120 });
    if (ids.has(id)) throw new TypeError(`ID duplicado en ${field}: ${id}`);
    ids.add(id);
    return { ...record, id };
  });
}
function normalizeFlags(flags) {
  if (!flags || typeof flags !== "object" || Array.isArray(flags)) throw new TypeError("flags debe ser un objeto.");
  const entries = Object.entries(flags);
  if (entries.length > 500 || entries.some(([key, value]) => !key.trim() || key.length > 120 || !["string", "number", "boolean"].includes(typeof value))) throw new TypeError("flags contiene valores no admitidos.");
  return Object.fromEntries(entries);
}
function normalizeEvents(events) {
  if (!Array.isArray(events)) throw new TypeError("events debe ser una lista.");
  return events.map((event, index) => {
    if (!event || typeof event !== "object") throw new TypeError("Evento inválido.");
    const source = event.source ?? "campaign";
    if (!["campaign", "player_reported", "confirmed", "engine"].includes(source)) throw new TypeError("Origen de evento no válido.");
    const roll = event.roll == null ? null : (() => {
      const value = event.roll;
      if (!value || !["normal", "advantage", "disadvantage"].includes(value.mode) || !Array.isArray(value.rolls) || value.rolls.length !== (value.mode === "normal" ? 1 : 2) || value.rolls.some(n => !Number.isInteger(n) || n < 1 || n > 20) || !Number.isInteger(value.kept) || value.kept < 1 || value.kept > 20) throw new TypeError("Datos de tirada no válidos.");
      const expected = value.mode === "advantage" ? Math.max(...value.rolls) : value.mode === "disadvantage" ? Math.min(...value.rolls) : value.rolls[0];
      if (value.kept !== expected) throw new TypeError("El resultado conservado no coincide con los dados.");
      return { mode: value.mode, rolls: [...value.rolls], kept: value.kept };
    })();
    if (source === "engine" && (!roll || event.type !== "dice-roll")) throw new TypeError("Los eventos del motor deben contener una tirada válida.");
    return {
      id: text(event.id ?? `event-${index + 1}`, "event.id", { max: 120 }),
      type: text(event.type, "event.type", { max: 80 }),
      summary: text(event.summary, "event.summary", { max: 1000 }),
      occurredAt: event.occurredAt ?? new Date().toISOString(),
      actorId: event.actorId == null ? null : text(event.actorId, "event.actorId", { max: 120 }),
      source,
      confirmedBy: event.confirmedBy == null ? null : text(event.confirmedBy, "event.confirmedBy", { max: 120 }),
      canonRefs: stringArray(event.canonRefs ?? [], "event.canonRefs", 50),
      roll
    };
  });
}
export function createCampaignState(input = {}) {
  const now = new Date().toISOString();
  const state = {
    schemaVersion: 1,
    campaignId: text(input.campaignId, "campaignId", { max: 100 }),
    name: text(input.name, "name", { max: 120 }),
    worldId: text(input.worldId ?? "edrava", "worldId", { max: 100 }),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    canonVersion: input.canonVersion ?? "1",
    canonRefs: stringArray(input.canonRefs ?? [], "canonRefs"),
    players: normalizeRecords(input.players ?? [], "players"),
    characters: normalizeRecords(input.characters ?? [], "characters"),
    locations: normalizeRecords(input.locations ?? [], "locations"),
    npcs: normalizeRecords(input.npcs ?? [], "npcs"),
    quests: normalizeRecords(input.quests ?? [], "quests"),
    inventory: normalizeRecords(input.inventory ?? [], "inventory"),
    flags: normalizeFlags(input.flags ?? {}),
    events: normalizeEvents(input.events ?? [])
  };
  if (!STATUSES.has(state.status)) throw new TypeError("Estado de campaña no válido.");
  if (state.events.length > MAX_EVENTS) throw new RangeError("La campaña supera el máximo de eventos.");
  return state;
}
export function appendCampaignEvent(state, event) {
  const next = createCampaignState(state);
  next.events.push({
    id: event.id ?? `event-${Date.now()}-${next.events.length + 1}`,
    type: event.type,
    summary: event.summary,
    occurredAt: event.occurredAt ?? new Date().toISOString(),
    actorId: event.actorId ?? null,
    source: event.source ?? "campaign",
    confirmedBy: event.confirmedBy ?? null,
    canonRefs: event.canonRefs ?? []
  });
  if (next.events.length > MAX_EVENTS) next.events = next.events.slice(-MAX_EVENTS);
  next.updatedAt = new Date().toISOString();
  return createCampaignState(next);
}
export function appendDiceRollEvent(state, { rollResult, actorId, purpose = "Tirada de d20" }) {
  if (!rollResult || !["normal", "advantage", "disadvantage"].includes(rollResult.mode)) throw new TypeError("Resultado de tirada no válido.");
  return appendCampaignEvent(state, {
    type: "dice-roll", source: "engine", actorId,
    summary: `${purpose}: ${rollResult.kept} (${rollResult.rolls.join(" y ")})`,
    roll: rollResult
  });
}

export function confirmLatestPlayerReport(state, moderatorId) {
  const next = createCampaignState(state);
  const event = [...next.events].reverse().find(item => item.source === "player_reported");
  if (!event) return { state: next, confirmed: false };
  event.source = "confirmed";
  event.confirmedBy = text(moderatorId, "moderatorId", { max: 120 });
  next.updatedAt = new Date().toISOString();
  return { state: createCampaignState(next), confirmed: true, event };
}
