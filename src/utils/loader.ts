import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Client } from "discord.js";
import type { BotCommand, BotEvent } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadCommands(client: Client): Promise<void> {
  const commandsPath = join(__dirname, "..", "commands");
  const files = readdirSync(commandsPath).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

  for (const file of files) {
    const command = (await import(`../commands/${file}`)).default as BotCommand;
    if (!command?.data?.name) continue;
    client.commands.set(command.data.name, command);
    console.log(`📦 Comando cargado: /${command.data.name}`);
  }
}

export async function loadEvents(client: Client): Promise<void> {
  const eventsPath = join(__dirname, "..", "events");
  const files = readdirSync(eventsPath).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

  for (const file of files) {
    const event = (await import(`../events/${file}`)).default as BotEvent;
    if (!event?.name) continue;

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }

    console.log(`🔌 Evento cargado: ${event.name}`);
  }
}
