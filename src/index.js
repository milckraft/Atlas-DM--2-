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
import { detectActionIntent, describeDetectedAction } from "./ai/action-intent.js";
import { analyzeCharacterBackground } from "./characters/background-ai.js";

const rest = new REST({ version: "10" }).setToken(env.discordToken);
const commandRoute = env.discordGuildId
  ? Routes.applicationGuildCommands(env.discordClientId, env.discordGuildId)
  : Routes.applicationCommands(env.discordClientId);

await rest.put(commandRoute, { body: commands });
console.log(`Registrados ${commands.length} comandos de Atlas DM.`);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
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

    if (interaction.commandName === "recomendar_trasfondo") {
      await interaction.deferReply({ ephemeral: true });
      const story = interaction.options.getString("historia", true);
      const result = await analyzeCharacterBackground(story);

      if (result.status === "insufficient_story") {
        await interaction.editReply(result.message);
        return;
      }
      if (result.status === "unavailable") {
        await interaction.editReply(
          "El análisis narrativo todavía no está disponible: no hay un proveedor de IA configurado. " +
          "No voy a sustituirlo por una puntuación de palabras clave. Puedes elegir cualquier trasfondo del catálogo mientras tanto."
        );
        return;
      }
      if (result.status !== "ok") {
        await interaction.editReply(
          "No pude validar una recomendación fiable esta vez. Tu historia y tu personaje no se han modificado; inténtalo más tarde."
        );
        return;
      }

      const analysis = result.analysis;
      const lines = analysis.recommendations.map((item, index) => {
        const evidence = item.storyEvidence.map(point => `• ${point}`).join("\n");
        return `**${index + 1}. ${item.backgroundId}**\n${item.reason}${evidence ? `\n${evidence}` : ""}`;
      });
      const clarification = analysis.needsClarification && analysis.questions.length
        ? `\n\n**Para afinar el análisis:**\n${analysis.questions.map(question => `• ${question}`).join("\n")}`
        : "";
      await interaction.editReply(
        `**Análisis narrativo del trasfondo**\n${analysis.summary}\n\n${lines.join("\n\n")}${clarification}\n\nLa recomendación es orientativa: tú decides qué trasfondo encaja mejor.`
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

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild || !message.content.trim()) return;
  const result = detectActionIntent(message.content);
  if (result.detected) await message.reply(describeDetectedAction(result));
  else if (result.ambiguous) {
    await message.reply("Detecté varias acciones posibles: " + result.candidates.map(item => item.label).join(", ") + ". ¿Cuál intentas primero?");
  }
});

client.on(Events.Error, (error) => {
  console.error("Error del cliente de Discord:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Promesa rechazada sin gestionar:", error);
});

await client.login(env.discordToken);
