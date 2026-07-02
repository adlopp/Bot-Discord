import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { BotCommand } from "../types.js";

const CAT_API = "https://api.thecatapi.com/v1/images/search";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("gato")
    .setDescription("Muestra una imagen aleatoria de un gato"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const res = await fetch(CAT_API);
      const data = (await res.json()) as { url: string }[];
      const imageUrl = data[0]?.url;

      if (!imageUrl) {
        await interaction.editReply("No encontré ningún gato 😿");
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0xf2a900)
        .setTitle("🐱 ¡Mira este gato!")
        .setImage(imageUrl)
        .setFooter({ text: "Powered by thecatapi.com" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error al obtener imagen de gato:", error);
      await interaction.editReply("Ocurrió un error al buscar un gato. Intenta de nuevo más tarde.");
    }
  },
};

export default command;
