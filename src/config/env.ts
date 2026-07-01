import "dotenv/config";

export const env = {
  discordToken: process.env.DISCORD_TOKEN ?? "",
  clientId: process.env.CLIENT_ID ?? "",
  guildIds: process.env.GUILD_IDS
    ? process.env.GUILD_IDS.split(",").map((id) => id.trim())
    : [],
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  valorantApiKey: process.env.VALORANT_API_KEY ?? "",
  lolApiKey: process.env.LOL_API_KEY ?? "",
} as const;

function validateEnv(): void {
  const missing: string[] = [];

  if (!env.discordToken) missing.push("DISCORD_TOKEN");
  if (!env.clientId) missing.push("CLIENT_ID");

  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
}

validateEnv();
