import {
  ActionRowBuilder, Client, Events, GatewayIntentBits, PermissionFlagsBits, REST, Routes, StringSelectMenuBuilder
} from "discord.js";
import { env } from "./config/env.js";
import { commands } from "./commands/registry.js";
import { rollD20 } from "./rules/dice.js";
import { listClassEntries } from "./characters/class-catalogue.js";
import { getAIProvider } from "./ai/provider-registry.js";
import { buildConversationPayload, decideCampaignConversation } from "./ai/conversation-orchestrator.js";
import { classifyDiscordMessage, createConversationContextStore } from "./ai/conversation-context.js";
import { analyzeCharacterBackground } from "./characters/background-ai.js";
import { registerAIProvider } from "./ai/provider-registry.js";
import { createCloudflareWorkersAIProvider } from "./ai/cloudflare-workers-ai.js";
import { createCampaignStore } from "./campaign/campaign-store.js";
import { createCampaignState, appendCampaignEvent, appendDiceRollEvent, confirmLatestPlayerReport } from "./campaign/campaign-schema.js";
import { registerCampaignLocation, enterCampaignLocation } from "./campaign/location-transitions.js";
import { createLocationImageWorkflow } from "./visual/location-image-workflow.js";

const campaignStore = createCampaignStore();
let cloudflareProvider = null;
if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN) {
  cloudflareProvider = createCloudflareWorkersAIProvider({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    textModel: process.env.CLOUDFLARE_TEXT_MODEL,
    imageModel: process.env.CLOUDFLARE_IMAGE_MODEL
  });
  registerAIProvider("cloudflare", cloudflareProvider);
  console.log("Proveedor Cloudflare Workers AI registrado.");
}
const conversationContext = createConversationContextStore({ maxMessagesPerChannel: 30, maxChannels: 100 });
const rest = new REST({ version: "10" }).setToken(env.discordToken);
const commandRoute = env.discordGuildId
  ? Routes.applicationGuildCommands(env.discordClientId, env.discordGuildId)
  : Routes.applicationCommands(env.discordClientId);
await rest.put(commandRoute, { body: commands });
console.log(`Registrados ${commands.length} comandos de Atlas DM.`);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const locationImageWorkflow = cloudflareProvider ? createLocationImageWorkflow({
  provider: cloudflareProvider,
  directory: process.env.ATLAS_DATA_DIR || "./data/campaigns",
  resolveChannel: channelId => client.channels.fetch(channelId)
}) : null;

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
      if (interaction.commandName === "ubicacion") {
        if (!interaction.guildId) {
          await interaction.reply({ content: "Las ubicaciones solo pueden gestionarse dentro de un servidor.", ephemeral: true });
          return;
        }
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
          await interaction.reply({ content: "Solo alguien con el permiso Gestionar servidor puede registrar ubicaciones o confirmar llegadas.", ephemeral: true });
          return;
        }
        await interaction.deferReply({ ephemeral: true });
        const campaign = await campaignStore.get(interaction.guildId);
        if (!campaign) {
          await interaction.editReply("Todavía no existe una campaña en este servidor. Crea una con /campana crear.");
          return;
        }
        const action = interaction.options.getSubcommand();
        if (action === "registrar") {
          const result = registerCampaignLocation(campaign, {
            id: interaction.options.getString("id", true),
            name: interaction.options.getString("nombre", true),
            description: interaction.options.getString("descripcion", true),
            channelId: interaction.options.getChannel("canal")?.id ?? null
          });
          await campaignStore.save(result.state);
          await interaction.editReply(`Ubicación **${result.location.name}** registrada con el ID \`${result.location.id}\`. Todavía no se ha generado ninguna imagen.`);
          return;
        }
        if (action === "entrar") {
          const result = enterCampaignLocation(campaign, {
            locationId: interaction.options.getString("id", true),
            actorId: interaction.user.id
          });
          if (result.status === "unknown_location") {
            await interaction.editReply("No existe una ubicación con ese ID. Regístrala primero con /ubicacion registrar.");
            return;
          }
          if (result.status === "already_there") {
            await interaction.editReply(`La campaña ya está registrada en **${result.location.name}**. No generaré otra imagen por una llegada repetida.`);
            return;
          }
          await campaignStore.save(result.state);
          const channelId = interaction.options.getChannel("canal")?.id ?? result.location.channelId ?? interaction.channelId;
          if (!locationImageWorkflow) {
            await interaction.editReply(`Llegada a **${result.location.name}** registrada. La generación visual no está disponible porque Cloudflare Workers AI no está configurado.`);
            return;
          }
          try {
            const imageResult = await locationImageWorkflow.onLocationEntered({
              campaignId: interaction.guildId,
              locationId: result.location.id,
              locationName: result.location.name,
              description: result.location.description,
              channelId
            });
            const statusText = imageResult.status === "generated" ? "Imagen generada y publicada." :
              imageResult.status === "cached" ? "Imagen recuperada de la caché y publicada." :
              "La llegada quedó guardada, pero no se pudo publicar una imagen esta vez.";
            await interaction.editReply(`Llegada a **${result.location.name}** registrada. ${statusText}`);
          } catch (imageError) {
            console.error("Error al publicar referencia visual de ubicación:", imageError);
            await interaction.editReply(`Llegada a **${result.location.name}** guardada. La imagen no pudo publicarse; el estado de campaña no se ha perdido.`);
          }
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
  try {
    const routing = classifyDiscordMessage(message, { botUserId: client.user?.id ?? null });
    if (routing.kind === "ignore") return;
    const campaign = await campaignStore.get(message.guildId);
    if (!campaign || campaign.status !== "active") return;
    conversationContext.append(message.channelId, {
      messageId: message.id, authorId: message.author.id,
      authorName: message.member?.displayName ?? message.author.username,
      content: message.content, timestamp: message.createdAt?.toISOString(),
      replyToMessageId: message.reference?.messageId ?? null,
      replyToAuthorName: message.referencedMessage?.member?.displayName ?? message.referencedMessage?.author?.username ?? null,
      mentions: [...message.mentions.users.values()].map(user => user.globalName ?? user.username)
    });
    const providerName = process.env.AI_PROVIDER || "cloudflare";
    const provider = getAIProvider(providerName);
    if (!provider || typeof provider.interpretConversation !== "function") return;

    const recentMessages = conversationContext.getRecent(message.channelId, 30);
    const payload = buildConversationPayload({
      campaign,
      messages: recentMessages,
      addressedToDM: routing.kind === "addressed_to_dm"
    });
    const result = await decideCampaignConversation(provider, payload);
    if (result.status !== "ok") return;

    const decision = result.decision;
    if (decision.decision === "respond" && decision.reply.trim()) {
      await message.reply({ content: decision.reply.slice(0, 1800), allowedMentions: { repliedUser: false } });
    } else if (decision.decision === "clarify") {
      const clarification = decision.reply.trim() || decision.clarification || "¿Puedes aclarar qué intentas hacer?";
      await message.reply({ content: clarification.slice(0, 1800), allowedMentions: { repliedUser: false } });
    } else if (decision.decision === "propose_action") {
      const description = decision.action?.description ?? "la acción que has descrito";
      const response = decision.reply.trim() || `Entiendo que intentas: ${description}. Todavía necesito resolverlo mediante las reglas de la campaña.`;
      await message.reply({ content: response.slice(0, 1800), allowedMentions: { repliedUser: false } });
    }
    // "observe" intentionally produces no Discord reply, so player-to-player
    // conversations remain uninterrupted. No action is mechanically resolved here.
  } catch (error) {
    console.error("Error al procesar mensaje de campaña:", error);
  }
});
client.on(Events.Error, error => console.error("Error del cliente de Discord:", error));
process.on("unhandledRejection", error => console.error("Promesa rechazada sin gestionar:", error));
await client.login(env.discordToken);
