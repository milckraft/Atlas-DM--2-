import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createCampaignState } from "./campaign-schema.js";

const DEFAULT_DIR = process.env.ATLAS_DATA_DIR || "./data/campaigns";

function safeId(id) {
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) {
    throw new TypeError("El ID de campaña solo puede contener letras, números, guiones y guiones bajos.");
  }
  return id;
}

export function createCampaignStore({ directory = DEFAULT_DIR } = {}) {
  const root = resolve(directory);

  function filePath(id) {
    return join(root, `${safeId(id)}.json`);
  }

  return {
    async create(input) {
      const state = createCampaignState(input);
      const path = filePath(state.campaignId);
      await mkdir(dirname(path), { recursive: true });
      const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
      try {
        // "wx" prevents accidentally overwriting an existing campaign.
        await writeFile(temporary, JSON.stringify(state, null, 2), { encoding: "utf8", flag: "wx" });
        await rename(temporary, path).catch(async error => {
          if (error.code === "EEXIST" || error.code === "ENOTEMPTY") {
            const conflict = new Error("Ya existe una campaña con ese ID.");
            conflict.code = "CAMPAIGN_EXISTS";
            throw conflict;
          }
          throw error;
        });
      } catch (error) {
        await import("node:fs/promises").then(fs => fs.rm(temporary, { force: true })).catch(() => {});
        if (error.code === "EEXIST") {
          const conflict = new Error("Ya existe una campaña con ese ID.");
          conflict.code = "CAMPAIGN_EXISTS";
          throw conflict;
        }
        throw error;
      }
      return state;
    },

    async get(id) {
      const path = filePath(id);
      try {
        const parsed = JSON.parse(await readFile(path, "utf8"));
        return createCampaignState(parsed);
      } catch (error) {
        if (error.code === "ENOENT") return null;
        if (error instanceof SyntaxError) throw new Error("El archivo de campaña está dañado y no se cargó.");
        throw error;
      }
    },

    async save(input) {
      const state = createCampaignState(input);
      const path = filePath(state.campaignId);
      await mkdir(dirname(path), { recursive: true });
      const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
      await writeFile(temporary, JSON.stringify(state, null, 2), { encoding: "utf8", flag: "wx" });
      await rename(temporary, path).catch(async error => {
        await import("node:fs/promises").then(fs => fs.rm(temporary, { force: true })).catch(() => {});
        throw error;
      });
      return state;
    }
  };
}
