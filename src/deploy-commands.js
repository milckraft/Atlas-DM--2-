import { REST, Routes } from "discord.js";
import { env } from "./config/env.js";
import { commands } from "./commands/registry.js";

const rest = new REST({ version: "10" }).setToken(env.discordToken);
const route = env.discordGuildId
  ? Routes.applicationGuildCommands(env.discordClientId, env.discordGuildId)
  : Routes.applicationCommands(env.discordClientId);

await rest.put(route, { body: commands });
console.log(`Registrados ${commands.length} comandos de Atlas DM.`);
