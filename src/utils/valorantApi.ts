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
  damageMade: number;
  tier: number;
  tierName: string;
  startedAt: string;
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

export function parseMatches(matches: HenrikMatch[], playerPuuid: string): ValorantMatch[] {
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
      damageMade: player.damage_made,
      tier: player.currenttier,
      tierName: player.currenttier_patched,
      startedAt: m.metadata.game_start_patched,
    };
  }).filter((m): m is ValorantMatch => m !== null);
}
