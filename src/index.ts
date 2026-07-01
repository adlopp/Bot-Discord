import { Client, Collection, GatewayIntentBits } from "discord.js";
import { env } from "./config/env.js";
import { loadEvents } from "./utils/loader.js";
import { loadCommands } from "./utils/loader.js";
import type { BotCommand } from "./types.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection<string, BotCommand>();

async function main(): Promise<void> {
  await loadEvents(client);
  await loadCommands(client);

  await client.login(env.discordToken);
}

void main();
