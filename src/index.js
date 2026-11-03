import {
  ActionRowBuilder, Client, Events, GatewayIntentBits, PermissionFlagsBits, REST, Routes, StringSelectMenuBuilder
} from "discord.js";
import { env } from "./config/env.js";
import { commands } from "./commands/registry.js";
import { rollD20 } from "./rules/dice.js";
import { listClassEntries } from "./characters/class-catalogue.js";
import { detectActionIntent, describeDetectedAction } from "./ai/action-intent.js";
import { analyzeCharacterBackground } from "./characters/background-ai.js";
import { createCampaignStore } from "./campaign/campaign-store.js";
import { createCampaignState, appendCampaignEvent, appendDiceRollEvent, appendAbilityCheckEvent, confirmLatestPlayerReport } from "./campaign/campaign-schema.js";
import { getActiveCampaignCharacter, listCampaignCharacters, selectActiveCampaignCharacter } from "./campaign/character-roster.js";
import { resolveCharacterSkillCheck } from "./rules/character-checks.js";

const campaignStore = createCampaignStore();
const rest = new REST({ version: "10" }).setToken(env.discordToken);
const commandRoute = env.discordGuildId
  ? Routes.applicationGuildCommands(env.discordClientId, env.discordGuildId)
  : Routes.applicationCommands(env.discordClientId);
await rest.put(commandRoute, { body: commands });
console.log(`Registrados ${commands.length} comandos de Atlas DM.`);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once(Events.ClientReady, readyClient => console.log(`Atlas DM conectado como ${readyClient.user.tag}`));

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "atlas") {
        await interaction.reply({ content: "¡Estoy conectado! La primera versión de Atlas DM está en construcción.", ephemeral: true });
        return;
      }
      if (interaction.commandName === "tirar") {
        const mode = interaction.options.getString("modo") ?? "normal";
        const result = rollD20({ mode });
        const modeText = { normal: "Tirada normal", advantage: "Ventaja", disadvantage: "Desventaja" }[mode];
        let recorded = false;
        if (interaction.guildId) {
          const campaign = await campaignStore.get(interaction.guildId);
          if (campaign) {
            const updated = appendDiceRollEvent(campaign, { rollResult: result, actorId: interaction.user.id });
            await campaignStore.save(updated);
            recorded = true;
          }
        }
        await interaction.reply(`🎲 **${modeText}**\\nResultado: **${result.kept}**` +
          (result.rolls.length > 1 ? ` (dados: ${result.rolls.join(" y ")})` : "") +
          (recorded ? "\\n📝 Tirada guardada en la memoria de campaña." : ""));
        return;
      }
      if (interaction.commandName === "campana") {
        if (!interaction.guildId) {
          await interaction.reply({ content: "La memoria de campaña solo está disponible dentro de un servidor.", ephemeral: true });
          return;
        }
        await interaction.deferReply({ ephemeral: true });
        const campaignId = interaction.guildId;
        const action = interaction.options.getSubcommand();
        if (action === "crear") {
          const existing = await campaignStore.get(campaignId);
          if (existing) {
            await interaction.editReply(`Este servidor ya tiene la campaña **${existing.name}**. Usa /campana ver para consultar su estado.`);
            return;
          }
          const state = createCampaignState({
            campaignId,
            name: interaction.options.getString("nombre", true),
            worldId: "edrava",
            players: [{ id: interaction.user.id, username: interaction.user.username }]
          });
          await campaignStore.create(state);
          await interaction.editReply(`Campaña **${state.name}** creada. La memoria está vinculada a este servidor.`);
          return;
        }
        const state = await campaignStore.get(campaignId);
        if (!state) {
          await interaction.editReply("Todavía no existe una campaña en este servidor. Crea una con /campana crear.");
          return;
        }
        if (action === "ver") {
          const latest = state.events.slice(-5).reverse();
          const events = latest.length
            ? latest.map(event => `• [${event.source === "player_reported" ? "Aporte de jugador" : "Registro"}] ${event.summary}`).join("\n")
            : "Todavía no hay acontecimientos registrados.";
          await interaction.editReply(
            `**${state.name}**\nEstado: ${state.status}\nPersonajes: ${state.characters.length}\nNPCs: ${state.npcs.length}\nMisiones: ${state.quests.length}\nObjetos registrados: ${state.inventory.length}\n\n**Últimos acontecimientos**\n${events}`
          );
          return;
        }
        if (action === "confirmar") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            await interaction.editReply("Solo alguien con el permiso Gestionar servidor puede confirmar acontecimientos.");
            return;
          }
          const result = confirmLatestPlayerReport(state, interaction.user.id);
          if (!result.confirmed) {
            await interaction.editReply("No hay aportes de jugadores pendientes de confirmación.");
            return;
          }
          await campaignStore.save(result.state);
          await interaction.editReply("Acontecimiento confirmado y añadido al registro oficial de esta campaña. Esto no modifica automáticamente el canon original de Edrava.");
          return;
        }
        if (action === "registrar") {
          const updated = appendCampaignEvent(state, {
            type: "player-note",
            source: "player_reported",
            actorId: interaction.user.id,
            summary: interaction.options.getString("acontecimiento", true)
          });
          await campaignStore.save(updated);
          await interaction.editReply("Aporte añadido al registro de la campaña. **Está marcado como no verificado** y no modifica por sí solo el canon, las fichas ni el inventario.");
          return;
        }
      }
      if (interaction.commandName === "recomendar_trasfondo") {
        await interaction.deferReply({ ephemeral: true });
        const result = await analyzeCharacterBackground(interaction.options.getString("historia", true));
        if (result.status === "insufficient_story") {
          await interaction.editReply(result.message);
          return;
        }
        if (result.status === "unavailable") {
          await interaction.editReply("El análisis narrativo todavía no está disponible: no hay un proveedor de IA configurado. No voy a sustituirlo por una puntuación de palabras clave. Puedes elegir cualquier trasfondo del catálogo mientras tanto.");
          return;
        }
        if (result.status !== "ok") {
          await interaction.editReply("No pude validar una recomendación fiable esta vez. Tu historia y tu personaje no se han modificado; inténtalo más tarde.");
          return;
        }
        const analysis = result.analysis;
        const lines = analysis.recommendations.map((item, index) => {
          const evidence = item.storyEvidence.map(point => `• ${point}`).join("\n");
          return `**${index + 1}. ${item.backgroundId}**\n${item.reason}${evidence ? `\n${evidence}` : ""}`;
        });
        const clarification = analysis.needsClarification && analysis.questions.length
          ? `\n\n**Para afinar el análisis:**\n${analysis.questions.map(question => `• ${question}`).join("\n")}` : "";
        await interaction.editReply(`**Análisis narrativo del trasfondo**\n${analysis.summary}\n\n${lines.join("\n\n")}${clarification}\n\nLa recomendación es orientativa: tú decides qué trasfondo encaja mejor.`);
        return;
      }
      if (interaction.commandName === "personaje") {
        if (!interaction.guildId) {
          await interaction.reply({ content: "Los personajes se guardan dentro de una campaña de servidor.", ephemeral: true });
          return;
        }
        await interaction.deferReply({ ephemeral: true });
        const campaign = await campaignStore.get(interaction.guildId);
        if (!campaign) {
          await interaction.editReply("Este servidor todavía no tiene campaña. Crea una con /campana crear.");
          return;
        }
        const action = interaction.options.getSubcommand();
        if (action === "listar") {
          const characters = listCampaignCharacters(campaign, interaction.user.id);
          if (!characters.length) {
            await interaction.editReply("Todavía no tienes personajes registrados en esta campaña. La creación guiada aún no guarda fichas completas.");
            return;
          }
          const active = getActiveCampaignCharacter(campaign, interaction.user.id);
          await interaction.editReply(characters.map(character =>
            `• **${character.name}** — ${character.class}, nivel ${character.level}${active?.id === character.id ? " (activo)" : ""} — ID: ${character.id}`
          ).join("\\n"));
          return;
        }
        if (action === "seleccionar") {
          const characterId = interaction.options.getString("id", true);
          try {
            const updated = selectActiveCampaignCharacter(campaign, characterId, interaction.user.id);
            await campaignStore.save(updated);
            const selected = getActiveCampaignCharacter(updated, interaction.user.id);
            await interaction.editReply(`Personaje activo: **${selected.name}** (nivel ${selected.level}, ${selected.class}).`);
          } catch (error) {
            await interaction.editReply(error.message);
          }
          return;
        }
      }
      if (interaction.commandName === "prueba") {
        if (!interaction.guildId) {
          await interaction.reply({ content: "Las pruebas de habilidad requieren una campaña de servidor.", ephemeral: true });
          return;
        }
        await interaction.deferReply();
        const campaign = await campaignStore.get(interaction.guildId);
        if (!campaign) {
          await interaction.editReply("Este servidor todavía no tiene campaña. Crea una con /campana crear.");
          return;
        }
        const character = getActiveCampaignCharacter(campaign, interaction.user.id);
        if (!character) {
          await interaction.editReply("No tienes un personaje activo. Usa /personaje listar y /personaje seleccionar después de registrar una ficha.");
          return;
        }
        const skill = interaction.options.getString("habilidad", true);
        const dc = interaction.options.getInteger("cd", true);
        const mode = interaction.options.getString("modo") ?? "normal";
        const result = resolveCharacterSkillCheck({ character, skill, dc, mode });
        const updated = appendAbilityCheckEvent(campaign, {
          result, actorId: interaction.user.id, characterId: character.id
        });
        await campaignStore.save(updated);
        const rolls = result.rolls.length > 1 ? ` (dados: ${result.rolls.join(" y ")})` : "";
        await interaction.editReply(
          `🎲 **Prueba de ${skill.replaceAll("_", " ")} — ${character.name}**\\n` +
          `d20: **${result.kept}**${rolls} | Modificador: ${result.abilityModifier >= 0 ? "+" : ""}${result.abilityModifier} | Competencia: ${result.proficiencyBonus >= 0 ? "+" : ""}${result.proficiencyBonus}\\n` +
          `**Total: ${result.total}** contra CD ${dc} — **${result.success ? "Éxito" : "Fallo"}**\\n📝 Resultado guardado en la memoria de campaña.`
        );
        return;
      }
      if (interaction.commandName === "crear_personaje") {
        const classes = listClassEntries();
        const menu = new StringSelectMenuBuilder().setCustomId("character_creation_class")
          .setPlaceholder("Selecciona una clase").setMinValues(1).setMaxValues(1)
          .addOptions(classes.map(entry => ({ label: entry.name, value: entry.id, description: `Dado de golpe d${entry.hitDie}` })));
        await interaction.reply({
          content: "**Creación de personaje — Paso 1 de 6**\n\nElige la clase de tu aventurero.",
          components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true
        });
        return;
      }
    }
    if (interaction.isStringSelectMenu() && interaction.customId === "character_creation_class") {
      const entry = listClassEntries().find(item => item.id === interaction.values[0]);
      if (!entry) {
        await interaction.reply({ content: "No pude encontrar esa clase. Vuelve a iniciar /crear_personaje.", ephemeral: true });
        return;
      }
      await interaction.update({
        content: `**Clase elegida: ${entry.name}**\n\nDado de golpe: d${entry.hitDie}\nCaracterísticas principales: ${entry.primaryAbilities.join(" y ")}\nSalvaciones competentes: ${entry.savingThrowProficiencies.join(" y ")}\n\nLa ficha todavía no se ha guardado.`,
        components: []
      });
    }
  } catch (error) {
    console.error("Error al procesar interacción:", error);
    const message = "No pude completar esa operación. La campaña no debe considerarse actualizada.";
    if (interaction.deferred || interaction.replied) await interaction.editReply(message).catch(() => {});
    else await interaction.reply({ content: message, ephemeral: true }).catch(() => {});
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild || !message.content.trim()) return;
  const result = detectActionIntent(message.content);
  if (result.detected) await message.reply(describeDetectedAction(result));
  else if (result.ambiguous) await message.reply("Detecté varias acciones posibles: " + result.candidates.map(item => item.label).join(", ") + ". ¿Cuál intentas primero?");
});
client.on(Events.Error, error => console.error("Error del cliente de Discord:", error));
process.on("unhandledRejection", error => console.error("Promesa rechazada sin gestionar:", error));
await client.login(env.discordToken);
