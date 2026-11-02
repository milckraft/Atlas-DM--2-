import { SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("atlas")
    .setDescription("Comprueba que Atlas DM está conectado.")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("tirar")
    .setDescription("Tira un d20 con reglas de ventaja o desventaja.")
    .addStringOption(option => option.setName("modo").setDescription("Elige cómo realizar la tirada.").setRequired(false)
      .addChoices(
        { name: "Normal", value: "normal" },
        { name: "Ventaja", value: "advantage" },
        { name: "Desventaja", value: "disadvantage" }
      ))
    .toJSON(),
  new SlashCommandBuilder()
    .setName("recomendar_trasfondo")
    .setDescription("Analiza la biografía y recomienda trasfondos compatibles.")
    .addStringOption(option => option.setName("historia").setDescription("Cuenta el pasado, experiencias y vida de tu personaje.").setRequired(true))
    .toJSON(),
  new SlashCommandBuilder()
    .setName("crear_personaje")
    .setDescription("Comienza la creación guiada de tu personaje.")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("campana")
    .setDescription("Crea y consulta la memoria persistente de esta campaña.")
    .addSubcommand(sub => sub.setName("crear").setDescription("Crea la campaña de este servidor.")
      .addStringOption(option => option.setName("nombre").setDescription("Nombre de la campaña.").setRequired(true).setMaxLength(120)))
    .addSubcommand(sub => sub.setName("ver").setDescription("Consulta el estado resumido de la campaña."))
    .addSubcommand(sub => sub.setName("registrar").setDescription("Añade una nota al registro de acontecimientos.")
      .addStringOption(option => option.setName("acontecimiento").setDescription("Describe lo ocurrido. Quedará como aporte no verificado.").setRequired(true).setMaxLength(1000)))
    .toJSON()
];
