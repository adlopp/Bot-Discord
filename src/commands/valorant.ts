import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { BotCommand } from "../types.js";
import { fetchAccount, fetchMatches, fetchMmrHistory, parseMatches } from "../utils/valorantApi.js";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("valorant")
    .setDescription("Muestra las últimas 10 partidas de un jugador de Valorant")
    .addStringOption((option) =>
      option.setName("nombre").setDescription("Nombre de Riot ID (ej: Jugador)").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("tag").setDescription("Tag de Riot ID (ej: 1234)").setRequired(true),
    ),

  async execute(interaction) {
    const name = interaction.options.getString("nombre", true);
    const tag = interaction.options.getString("tag", true);

    await interaction.deferReply();

    const account = await fetchAccount(name, tag);
    if (!account) {
      await interaction.editReply({
        content: `No se encontró la cuenta **${name}#${tag}**. Verifica el nombre y tag.`,
      });
      return;
    }

    const matches = await fetchMatches(name, tag, account.region);
    if (matches.length === 0) {
      await interaction.editReply({
        content: `No se encontraron partidas para **${name}#${tag}**.`,
      });
      return;
    }

    const [mmrHistory] = await Promise.all([
      fetchMmrHistory(name, tag, account.region),
    ]);

    const parsed = parseMatches(matches, account.puuid, mmrHistory);

    const totalKills = parsed.reduce((s, m) => s + m.kills, 0);
    const totalDeaths = parsed.reduce((s, m) => s + m.deaths, 0);
    const totalAssists = parsed.reduce((s, m) => s + m.assists, 0);
    const wins = parsed.filter((m) => m.result === "Victoria").length;
    const avgKd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);
    const currentElo = parsed.find((m) => m.elo !== null)?.elo ?? null;

    const formatMmr = (change: number | null): string => {
      if (change === null) return "";
      const sign = change >= 0 ? "+" : "";
      return ` (${sign}${change} RR)`;
    };

    const formatMatch = (m: typeof parsed[number], i: number): string =>
      `**${i + 1}.** ${m.result === "Victoria" ? "✅" : "❌"} \`${m.score}\` **${m.agent}**` +
      ` ─ ${m.kills}/${m.deaths}/${m.assists} (${m.kdRatio} KD) ${m.acs} ACS` +
      ` ─ ${m.headshotPercent}% HS\n` +
      `　　　 ─ **${m.tierName}** │ Sala ${m.lobbyAvgTierName} │ #${m.placement}${formatMmr(m.mmrChange)}`;

    const chunkSize = 5;
    const fields = [];
    for (let i = 0; i < parsed.length; i += chunkSize) {
      const chunk = parsed.slice(i, i + chunkSize);
      fields.push({
        name: i === 0 ? `Últimas ${parsed.length} partidas` : "\u200B",
        value: chunk.map((m, j) => formatMatch(m, i + j)).join("\n"),
      });
    }

    const eloText = currentElo !== null ? ` │ ${currentElo} RR` : "";

    const embed = new EmbedBuilder()
      .setColor(0xfd4556)
      .setTitle(`Valorant — ${name}#${tag}`)
      .setThumbnail(account.card.small)
      .setDescription(
        `\`${account.region.toUpperCase()}\` ─ Nv. ${account.account_level}` +
          `${eloText}\n` +
          `${parsed.length} partidas · ${wins}V ${parsed.length - wins}D · K/D ${avgKd} · ${totalKills}/${totalDeaths}/${totalAssists}`,
      )
      .addFields(...fields)
      .setFooter({
        text: wins > parsed.length - wins
          ? "Relájate Faker."
          : wins < parsed.length - wins
            ? "Tranquilo, las derrotas son por culpa de tus compañeros."
            : "Ni frío ni calor, 50 grados.",
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
