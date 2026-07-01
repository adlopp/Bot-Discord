import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { BotCommand } from "../types.js";
import { fetchAccount, fetchMatches, parseMatches } from "../utils/valorantApi.js";

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

    const parsed = parseMatches(matches, account.puuid);

    const totalKills = parsed.reduce((s, m) => s + m.kills, 0);
    const totalDeaths = parsed.reduce((s, m) => s + m.deaths, 0);
    const totalAssists = parsed.reduce((s, m) => s + m.assists, 0);
    const wins = parsed.filter((m) => m.result === "Victoria").length;
    const avgKd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);

    const matchesField = parsed
      .map(
        (m, i) =>
          `**${i + 1}.** ${m.result === "Victoria" ? "✅" : "❌"} \`${m.score}\` **${m.agent}**` +
          ` — ${m.kills}/${m.deaths}/${m.assists} (KD ${m.kdRatio}) — ${m.headshotPercent}% HS — ${m.tierName}`,
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0xfd4556)
      .setTitle(`Valorant — ${name}#${tag}`)
      .setThumbnail(account.card.small)
      .setDescription(
        `${account.region.toUpperCase()} · Nivel ${account.account_level}\n` +
          `${parsed.length} partidas · ${wins}V ${parsed.length - wins}D · K/D ${avgKd} · ${totalKills}/${totalDeaths}/${totalAssists}`,
      )
      .addFields(
        { name: `Últimas ${parsed.length} partidas`, value: matchesField },
      )
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
