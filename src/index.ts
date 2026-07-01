import { createServer } from "node:http";
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

const PORT = Number(process.env.PORT) || 3000;
createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is alive");
}).listen(PORT, () => {
  console.log(`HTTP health check server listening on port ${PORT}`);
});

async function main(): Promise<void> {
  await loadEvents(client);
  await loadCommands(client);

  await client.login(env.discordToken);
}

void main();
