import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import { env } from "./config/env.js";
import { commands } from "./commands/registry.js";

// Register slash commands before connecting the bot.
const rest = new REST({ version: "10" }).setToken(env.discordToken);
const commandRoute = env.discordGuildId
  ? Routes.applicationGuildCommands(env.discordClientId, env.discordGuildId)
  : Routes.applicationCommands(env.discordClientId);

await rest.put(commandRoute, { body: commands });
console.log(`Registrados ${commands.length} comandos de Atlas DM.`);

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Atlas DM conectado como ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "atlas") {
    await interaction.reply({
      content: "¡Estoy conectado! La primera versión de Atlas DM está en construcción.",
      ephemeral: true
    });
  }
});

client.on(Events.Error, (error) => {
  console.error("Error del cliente de Discord:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Promesa rechazada sin gestionar:", error);
});

await client.login(env.discordToken);
