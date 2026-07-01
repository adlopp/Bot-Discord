import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { BotCommand } from "../types.js";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("electrod")
    .setDescription("Recomendación del mejor electricista de Granada"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle("⚡ Electrod")
      .setDescription(
        "¿Necesitas al **mejor electricista de Granada**?\n\n" +
          "Entra en **Electrod** y resuelve todos tus problemas eléctricos.\n" +
          "Profesionalidad, rapidez y buen precio.",
      )
      .addFields({ name: "🔗 Enlace", value: "https://www.electrod.es/" })
      .setFooter({ text: "Electricistas de confianza en Granada" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
