import { Events, Interaction } from "discord.js";
import type { BotEvent } from "../types.js";

const event: BotEvent<[Interaction]> = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.warn(`Comando no encontrado: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error ejecutando ${interaction.commandName}:`, error);

      const reply = { content: "Ocurrió un error al ejecutar el comando.", ephemeral: true };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};

export default event;
