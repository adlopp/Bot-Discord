import { REST, Routes } from "discord.js";
import { env } from "./config/env.js";
import preguntar from "./commands/preguntar.js";
import valorant from "./commands/valorant.js";
import lol from "./commands/lol.js";
import electrod from "./commands/electrod.js";
import gato from "./commands/gato.js";

const commands = [preguntar.data.toJSON(), valorant.data.toJSON(), lol.data.toJSON(), electrod.data.toJSON(), gato.data.toJSON()];

const rest = new REST().setToken(env.discordToken);

async function deploy(): Promise<void> {
  try {
    if (env.guildIds.length > 0) {
      for (const guildId of env.guildIds) {
        const route = Routes.applicationGuildCommands(env.clientId, guildId);
        const data = await rest.put(route, { body: commands });
        console.log(`✅ ${(data as unknown[]).length} comandos → servidor ${guildId}`);
      }
      return;
    }

    console.log(`Registrando ${commands.length} comandos globales...`);
    const data = await rest.put(Routes.applicationCommands(env.clientId), { body: commands });
    console.log(`✅ ${(data as unknown[]).length} comandos registrados globalmente.`);
  } catch (error) {
    console.error("Error registrando comandos:", error);
    process.exit(1);
  }
}

void deploy();
