import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { BotCommand } from "../types.js";
import { getAnswer } from "../handlers/qaHandler.js";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("preguntar")
    .setDescription("Haz una pregunta y el bot te responderá")
    .addStringOption((option) =>
      option
        .setName("pregunta")
        .setDescription("Escribe tu pregunta aquí")
        .setRequired(true)
    ),

  async execute(interaction) {
    const question = interaction.options.getString("pregunta", true);

    await interaction.deferReply();

    const answer = await getAnswer(question);

    if (answer) {
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("❓ Pregunta")
        .setDescription(`**${question}**`)
        .addFields({ name: "Respuesta", value: answer })
        .setFooter({ text: "Bot de Preguntas y Respuestas" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply({
        content: "No tengo una respuesta para esa pregunta. Intenta reformularla o pregúntale al administrador del servidor.",
      });
    }
  },
};

export default command;
