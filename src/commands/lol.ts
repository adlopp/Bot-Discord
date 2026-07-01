import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { BotCommand } from "../types.js";
import {
  fetchAccountRiot,
  fetchSummoner,
  fetchMatchIds,
  fetchMatchDetails,
  parseLolMatches,
} from "../utils/lolApi.js";
import type { MatchInfo } from "../utils/lolApi.js";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("lol")
    .setDescription("Muestra las últimas partidas de un jugador de League of Legends")
    .addStringOption((option) =>
      option.setName("nombre").setDescription("Nombre de Riot ID").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("tag").setDescription("Tag (ej: EUW)").setRequired(true),
    ),

  async execute(interaction) {
    const name = interaction.options.getString("nombre", true);
    const tag = interaction.options.getString("tag", true);

    await interaction.deferReply();

    const account = await fetchAccountRiot(name, tag);
    if (!account) {
      await interaction.editReply({
        content: `No se encontró la cuenta **${name}#${tag}**. Verifica el nombre y tag.`,
      });
      return;
    }

    const summoner = await fetchSummoner(account.puuid, tag);
    if (!summoner) {
      await interaction.editReply({
        content: `No se pudo obtener información del invocador **${name}#${tag}**.`,
      });
      return;
    }

    const matchIds = await fetchMatchIds(account.puuid, tag);
    if (!matchIds || matchIds.length === 0) {
      await interaction.editReply({
        content: `No se encontraron partidas para **${name}#${tag}**.`,
      });
      return;
    }

    const matchesData: MatchInfo[] = [];
    for (const id of matchIds) {
      const details = await fetchMatchDetails(id, tag);
      if (details) matchesData.push(details);
    }

    const parsed = parseLolMatches(matchesData, account.puuid);
    if (parsed.length === 0) {
      await interaction.editReply({
        content: `No se pudieron procesar las partidas de **${name}#${tag}**.`,
      });
      return;
    }

    const totalKills = parsed.reduce((s, m) => s + m.kills, 0);
    const totalDeaths = parsed.reduce((s, m) => s + m.deaths, 0);
    const totalAssists = parsed.reduce((s, m) => s + m.assists, 0);
    const wins = parsed.filter((m) => m.win).length;
    const avgKda = totalDeaths > 0
      ? ((totalKills + totalAssists) / totalDeaths).toFixed(2)
      : "Perfecto";
    const avgCs = Math.round(parsed.reduce((s, m) => s + m.cs, 0) / parsed.length);

    const matchesField = parsed
      .map(
        (m, i) =>
          `**${i + 1}.** ${m.win ? "✅" : "❌"} **${m.champion}** — ${m.kills}/${m.deaths}/${m.assists} ` +
          `(KDA ${m.kda}) — ${m.cs} CS — ${m.gameMode}`,
      )
      .join("\n");

    const iconUrl = `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${summoner.profileIconId}.png`;

    const embed = new EmbedBuilder()
      .setColor(0x0a6bff)
      .setTitle(`League of Legends — ${name}#${tag}`)
      .setThumbnail(iconUrl)
      .setDescription(
        `Nivel ${summoner.summonerLevel} · ${parsed.length} partidas · ` +
          `${wins}V ${parsed.length - wins}D · KDA ${avgKda} · ${avgCs} CS/partida`,
      )
      .addFields({ name: `Últimas ${parsed.length} partidas`, value: matchesField })
      .setFooter({
        text: wins > parsed.length - wins
          ? "El GOAT de la Grieta."
          : wins < parsed.length - wins
            ? "GG, mala suerte bro."
            : "50/50, tas medio pelo.",
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
