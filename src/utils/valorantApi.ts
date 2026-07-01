import { env } from "../config/env.js";

const BASE_URL = "https://api.henrikdev.xyz/valorant";
const HEADERS = env.valorantApiKey
  ? { Authorization: env.valorantApiKey }
  : undefined;

export interface ValorantMatch {
  agent: string;
  map: string;
  mode: string;
  result: "Victoria" | "Derrota";
  score: string;
  kills: number;
  deaths: number;
  assists: number;
  kdRatio: number;
  headshots: number;
  headshotPercent: number;
  acs: number;
  damageMade: number;
  tier: number;
  tierName: string;
  lobbyAvgTier: number;
  lobbyAvgTierName: string;
  placement: number;
  mmrChange: number | null;
  elo: number | null;
  startedAt: string;
}

export interface MmrEntry {
  date: string;
  currenttier: number;
  currenttier_patched: string;
  ranking_in_tier: number;
  elo: number;
  mmr_change_to_last_game: number;
}

interface Player {
  puuid: string;
  name: string;
  tag: string;
  team: string;
  character: string;
  currenttier: number;
  currenttier_patched: string;
  stats: {
    score: number;
    kills: number;
    deaths: number;
    assists: number;
    bodyshots: number;
    headshots: number;
    legshots: number;
  };
  damage_made: number;
  damage_received: number;
}

interface HenrikMatch {
  metadata: {
    map: string;
    mode: string;
    game_start_patched: string;
    rounds_played: number;
  };
  players: {
    all_players: Player[];
  };
  teams: {
    red: { has_won: boolean; rounds_won: number };
    blue: { has_won: boolean; rounds_won: number };
  };
}

interface AccountResponse {
  status: number;
  data: {
    puuid: string;
    region: string;
    account_level: number;
    name: string;
    tag: string;
    card: { small: string; large: string; wide: string; id: string };
    last_update: string;
  };
}

interface MatchResponse {
  status: number;
  data: HenrikMatch[];
}

export async function fetchAccount(name: string, tag: string): Promise<AccountResponse["data"] | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      { headers: HEADERS },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as AccountResponse;
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchMatches(name: string, tag: string, region: string): Promise<HenrikMatch[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/v3/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=10`,
      { headers: HEADERS },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as MatchResponse;
    return json.data ?? [];
  } catch {
    return [];
  }
}

interface MmrHistoryResponse {
  status: number;
  data: MmrEntry[];
}

export async function fetchMmrHistory(name: string, tag: string, region: string): Promise<MmrEntry[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/v1/mmr-history/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      { headers: HEADERS },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as MmrHistoryResponse;
    return json.data ?? [];
  } catch {
    return [];
  }
}

const TIER_NAMES: Record<number, string> = {
  0: "Unrated",
  1: "Unrated 1",
  2: "Unrated 2",
  3: "Iron 1",
  4: "Iron 2",
  5: "Iron 3",
  6: "Bronze 1",
  7: "Bronze 2",
  8: "Bronze 3",
  9: "Silver 1",
  10: "Silver 2",
  11: "Silver 3",
  12: "Gold 1",
  13: "Gold 2",
  14: "Gold 3",
  15: "Platinum 1",
  16: "Platinum 2",
  17: "Platinum 3",
  18: "Diamond 1",
  19: "Diamond 2",
  20: "Diamond 3",
  21: "Ascendant 1",
  22: "Ascendant 2",
  23: "Ascendant 3",
  24: "Immortal 1",
  25: "Immortal 2",
  26: "Immortal 3",
  27: "Radiant",
};

function computeAvgTier(allPlayers: Player[]): { avgTier: number; avgTierName: string } {
  const total = allPlayers.reduce((sum, p) => sum + p.currenttier, 0);
  const avg = Math.round(total / allPlayers.length);
  return {
    avgTier: avg,
    avgTierName: TIER_NAMES[avg] ?? `Tier ${avg}`,
  };
}

function computePlacement(allPlayers: Player[], playerPuuid: string): number {
  const sorted = [...allPlayers].sort((a, b) => b.stats.score - a.stats.score);
  const idx = sorted.findIndex((p) => p.puuid === playerPuuid);
  return idx + 1;
}

export function parseMatches(
  matches: HenrikMatch[],
  playerPuuid: string,
  mmrHistory?: MmrEntry[],
): ValorantMatch[] {
  let mmrIdx = 0;

  return matches.slice(0, 10).map((m) => {
    const player = m.players.all_players.find((p) => p.puuid === playerPuuid);
    if (!player) {
      return null;
    }

    const playerTeam = player.team.toLowerCase() as "red" | "blue";
    const enemyTeam = playerTeam === "red" ? "blue" : "red";
    const teamScore = m.teams[playerTeam]?.rounds_won ?? 0;
    const enemyScore = m.teams[enemyTeam]?.rounds_won ?? 0;
    const playerWon = m.teams[playerTeam]?.has_won ?? false;
    const totalShots = player.stats.headshots + player.stats.bodyshots + player.stats.legshots;
    const { avgTier, avgTierName } = computeAvgTier(m.players.all_players);
    const placement = computePlacement(m.players.all_players, playerPuuid);
    const acs = m.metadata.rounds_played > 0
      ? Math.round(player.stats.score / m.metadata.rounds_played)
      : 0;

    const isCompetitive = m.metadata.mode === "Competitive";
    const mmrEntry = isCompetitive && mmrHistory && mmrIdx < mmrHistory.length
      ? mmrHistory[mmrIdx++]
      : null;

    return {
      agent: player.character,
      map: m.metadata.map,
      mode: m.metadata.mode,
      result: playerWon ? "Victoria" : "Derrota",
      score: `${teamScore}-${enemyScore}`,
      kills: player.stats.kills,
      deaths: player.stats.deaths,
      assists: player.stats.assists,
      kdRatio: player.stats.deaths > 0
        ? Number((player.stats.kills / player.stats.deaths).toFixed(2))
        : player.stats.kills,
      headshots: player.stats.headshots,
      headshotPercent: totalShots > 0
        ? Number(((player.stats.headshots / totalShots) * 100).toFixed(1))
        : 0,
      acs,
      damageMade: player.damage_made,
      tier: player.currenttier,
      tierName: player.currenttier_patched,
      lobbyAvgTier: avgTier,
      lobbyAvgTierName: avgTierName,
      placement,
      mmrChange: mmrEntry?.mmr_change_to_last_game ?? null,
      elo: mmrEntry?.elo ?? null,
      startedAt: m.metadata.game_start_patched,
    };
  }).filter((m): m is ValorantMatch => m !== null);
}
