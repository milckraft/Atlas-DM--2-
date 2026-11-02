import { SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("atlas")
    .setDescription("Comprueba que Atlas DM está conectado.")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("tirar")
    .setDescription("Tira un d20 con reglas de ventaja o desventaja.")
    .addStringOption((option) =>
      option
        .setName("modo")
        .setDescription("Elige cómo realizar la tirada.")
        .setRequired(false)
        .addChoices(
          { name: "Normal", value: "normal" },
          { name: "Ventaja", value: "advantage" },
          { name: "Desventaja", value: "disadvantage" }
        )
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("crear_personaje")
    .setDescription("Comienza la creación guiada de tu personaje.")
    .toJSON()
];
