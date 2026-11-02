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
    .setName("recomendar_trasfondo")
    .setDescription("Recomienda trasfondos según la historia y la clase.")
    .addStringOption(option => option.setName("historia").setDescription("Cuenta brevemente el pasado de tu personaje.").setRequired(true))
    .addStringOption(option => option.setName("clase").setDescription("Clase del personaje.").setRequired(false).addChoices(
      {name:"Pícaro",value:"rogue"},{name:"Guerrero",value:"fighter"},{name:"Mago",value:"wizard"},
      {name:"Clérigo",value:"cleric"},{name:"Explorador",value:"ranger"},{name:"Bardo",value:"bard"},
      {name:"Druida",value:"druid"},{name:"Paladín",value:"paladin"},{name:"Bárbaro",value:"barbarian"},
      {name:"Monje",value:"monk"},{name:"Hechicero",value:"sorcerer"},{name:"Brujo",value:"warlock"}
    ))
    .toJSON(),
  new SlashCommandBuilder()
    .setName("crear_personaje")
    .setDescription("Comienza la creación guiada de tu personaje.")
    .toJSON()
];
