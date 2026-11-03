import { SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder().setName("atlas").setDescription("Comprueba que Atlas DM está conectado.").toJSON(),
  new SlashCommandBuilder().setName("tirar").setDescription("Tira un d20 con reglas de ventaja o desventaja.")
    .addStringOption(option => option.setName("modo").setDescription("Elige cómo realizar la tirada.").setRequired(false)
      .addChoices({name:"Normal",value:"normal"},{name:"Ventaja",value:"advantage"},{name:"Desventaja",value:"disadvantage"})).toJSON(),
  new SlashCommandBuilder().setName("recomendar_trasfondo").setDescription("Analiza la biografía y recomienda trasfondos compatibles.")
    .addStringOption(option => option.setName("historia").setDescription("Cuenta el pasado, experiencias y vida de tu personaje.").setRequired(true)).toJSON(),
  new SlashCommandBuilder().setName("personaje").setDescription("Consulta y selecciona tus personajes de campaña.")
    .addSubcommand(sub => sub.setName("listar").setDescription("Lista tus personajes registrados."))
    .addSubcommand(sub => sub.setName("seleccionar").setDescription("Selecciona tu personaje activo.")
      .addStringOption(option => option.setName("id").setDescription("ID del personaje mostrado en /personaje listar.").setRequired(true).setMaxLength(120)))
    .toJSON(),
  new SlashCommandBuilder().setName("prueba").setDescription("Realiza una prueba de habilidad con tu personaje activo.")
    .addStringOption(option => option.setName("habilidad").setDescription("Habilidad que intentas usar.").setRequired(true)
      .addChoices(
        {name:"Acrobacias",value:"acrobatics"},{name:"Trato con animales",value:"animal_handling"},
        {name:"Arcana",value:"arcana"},{name:"Atletismo",value:"athletics"},
        {name:"Engaño",value:"deception"},{name:"Historia",value:"history"},
        {name:"Perspicacia",value:"insight"},{name:"Intimidación",value:"intimidation"},
        {name:"Investigación",value:"investigation"},{name:"Medicina",value:"medicine"},
        {name:"Naturaleza",value:"nature"},{name:"Percepción",value:"perception"},
        {name:"Interpretación",value:"performance"},{name:"Persuasión",value:"persuasion"},
        {name:"Religión",value:"religion"},{name:"Juego de manos",value:"sleight_of_hand"},
        {name:"Sigilo",value:"stealth"},{name:"Supervivencia",value:"survival"}
      ))
    .addIntegerOption(option => option.setName("cd").setDescription("Clase de dificultad de la prueba.").setRequired(true).setMinValue(0).setMaxValue(40))
    .addStringOption(option => option.setName("modo").setDescription("Modo de tirada.").setRequired(false)
      .addChoices({name:"Normal",value:"normal"},{name:"Ventaja",value:"advantage"},{name:"Desventaja",value:"disadvantage"}))
    .toJSON(),
  new SlashCommandBuilder().setName("crear_personaje").setDescription("Comienza la creación guiada de tu personaje.").toJSON(),
  new SlashCommandBuilder().setName("campana").setDescription("Crea y consulta la memoria persistente de esta campaña.")
    .addSubcommand(sub=>sub.setName("crear").setDescription("Crea la campaña de este servidor.")
      .addStringOption(option=>option.setName("nombre").setDescription("Nombre de la campaña.").setRequired(true).setMaxLength(120)))
    .addSubcommand(sub=>sub.setName("ver").setDescription("Consulta el estado resumido de la campaña."))
    .addSubcommand(sub=>sub.setName("registrar").setDescription("Añade una nota no verificada al registro.")
      .addStringOption(option=>option.setName("acontecimiento").setDescription("Describe lo ocurrido.").setRequired(true).setMaxLength(1000)))
    .addSubcommand(sub=>sub.setName("confirmar").setDescription("Confirma el último aporte de jugador (requiere Gestionar servidor)."))
    .toJSON()
];
