import { SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("atlas")
    .setDescription("Comprueba que Atlas DM está conectado.")
    .toJSON()
];
