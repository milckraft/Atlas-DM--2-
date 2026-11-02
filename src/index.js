import {
  ActionRowBuilder,
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  StringSelectMenuBuilder
} from "discord.js";
import { env } from "./config/env.js";
import { commands } from "./commands/registry.js";
import { rollD20 } from "./rules/dice.js";
import { listClassEntries } from "./characters/class-catalogue.js";

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
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "atlas") {
      await interaction.reply({
        content: "¡Estoy conectado! La primera versión de Atlas DM está en construcción.",
        ephemeral: true
      });
      return;
    }

    if (interaction.commandName === "tirar") {
      const mode = interaction.options.getString("modo") ?? "normal";
      const result = rollD20({ mode });
      const modeText = {
        normal: "Tirada normal",
        advantage: "Ventaja",
        disadvantage: "Desventaja"
      }[mode];

      await interaction.reply(
        `🎲 **${modeText}**\nResultado: **${result.kept}**` +
        (result.rolls.length > 1 ? ` (dados: ${result.rolls.join(" y ")})` : "")
      );
      return;
    }

    if (interaction.commandName === "crear_personaje") {
      const classes = listClassEntries();
      const menu = new StringSelectMenuBuilder()
        .setCustomId("character_creation_class")
        .setPlaceholder("Selecciona una clase")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(classes.map((entry) => ({
          label: entry.name,
          value: entry.id,
          description: `Dado de golpe d${entry.hitDie}`
        })));

      await interaction.reply({
        content: "**Creación de personaje — Paso 1 de 6**\n\nElige la clase de tu aventurero. Esta elección determinará sus competencias, dado de golpe y opciones de habilidades.",
        components: [new ActionRowBuilder().addComponents(menu)],
        ephemeral: true
      });
      return;
    }
  }

  if (interaction.isStringSelectMenu() &&
      interaction.customId === "character_creation_class") {
    const selectedId = interaction.values[0];
    const entry = listClassEntries().find((item) => item.id === selectedId);
    if (!entry) {
      await interaction.reply({ content: "No pude encontrar esa clase. Vuelve a iniciar /crear_personaje.", ephemeral: true });
      return;
    }

    const abilities = entry.primaryAbilities.join(" y ");
    const saves = entry.savingThrowProficiencies.join(" y ");
    const skillOptions = entry.skillChoices.options === "any"
      ? "Cualquier habilidad"
      : entry.skillChoices.options.join(", ");

    await interaction.update({
      content:
        `**Clase elegida: ${entry.name}**\n\n` +
        `• Dado de golpe: d${entry.hitDie}\n` +
        `• Características principales: ${abilities}\n` +
        `• Salvaciones competentes: ${saves}\n` +
        `• Habilidades de clase: elige ${entry.skillChoices.count} entre ${skillOptions}\n\n` +
        "La clase queda seleccionada para este paso. Aún no se ha guardado una ficha; el siguiente paso será elegir las habilidades y el trasfondo.",
      components: []
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
