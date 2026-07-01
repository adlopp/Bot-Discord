import { Events, Client } from "discord.js";
import type { BotEvent } from "../types.js";

const event: BotEvent<[Client]> = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    if (!client.user) return;
    console.log(`✅ Bot conectado como ${client.user.tag}`);
  },
};

export default event;
