import { randomUUID } from "node:crypto";
import { link, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createCampaignState } from "./campaign-schema.js";

const DEFAULT_DIR = process.env.ATLAS_DATA_DIR || "./data/campaigns";
function safeId(id) {
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) throw new TypeError("El ID de campaña solo puede contener letras, números, guiones y guiones bajos.");
  return id;
}
export function createCampaignStore({ directory = DEFAULT_DIR } = {}) {
  const root = resolve(directory);
  const queues = new Map();
  const filePath = id => join(root, `${safeId(id)}.json`);
  async function serialized(id, operation) {
    const previous = queues.get(id) ?? Promise.resolve();
    const current = previous.catch(() => {}).then(operation);
    queues.set(id, current);
    try { return await current; }
    finally { if (queues.get(id) === current) queues.delete(id); }
  }
  async function atomicReplace(path, data) {
    const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, data, { encoding: "utf8", flag: "wx" });
      await rename(temporary, path);
    } finally { await rm(temporary, { force: true }).catch(() => {}); }
  }
  return {
    async create(input) {
      const state = createCampaignState(input), path = filePath(state.campaignId);
      await mkdir(dirname(path), { recursive: true });
      const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
      try {
        await writeFile(temporary, JSON.stringify(state, null, 2), { encoding: "utf8", flag: "wx" });
        await link(temporary, path);
      } catch (error) {
        if (error.code === "EEXIST") { const conflict = new Error("Ya existe una campaña con ese ID."); conflict.code = "CAMPAIGN_EXISTS"; throw conflict; }
        throw error;
      } finally { await rm(temporary, { force: true }).catch(() => {}); }
      return state;
    },
    async get(id) {
      const path = filePath(id);
      try { return createCampaignState(JSON.parse(await readFile(path, "utf8"))); }
      catch (error) {
        if (error.code === "ENOENT") return null;
        if (error instanceof SyntaxError) throw new Error("El archivo de campaña está dañado y no se cargó.");
        throw error;
      }
    },
    async save(input) {
      const state = createCampaignState(input);
      return serialized(state.campaignId, async () => {
        const path = filePath(state.campaignId);
        await mkdir(dirname(path), { recursive: true });
        await atomicReplace(path, JSON.stringify(state, null, 2));
        return state;
      });
    }
  };
}
