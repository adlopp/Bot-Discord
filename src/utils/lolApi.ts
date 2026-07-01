import { env } from "../config/env.js";

interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface RiotSummoner {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  summonerLevel: number;
}

interface MatchParticipant {
  puuid: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  totalDamageDealtToChampions: number;
  visionScore: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  summoner1Id: number;
  summoner2Id: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  lane: string;
  role: string;
}

export interface MatchInfo {
  gameDuration: number;
  gameMode: string;
  participants: MatchParticipant[];
  teams: { teamId: number; win: boolean }[];
}

export interface LolMatch {
  champion: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  win: boolean;
  gameMode: string;
  gameDuration: string;
  cs: number;
  damage: number;
  visionScore: number;
  items: number[];
  summoners: number[];
  lane: string;
}

const RIOT_API_KEY = env.lolApiKey;

const REGION_MAP: Record<string, string> = {
  NA: "na1",
  EUW: "euw1",
  EUN: "eun1",
  JP: "jp1",
  KR: "kr",
  BR: "br1",
  LA: "la1",
  LA2: "la2",
  OC: "oc1",
  PH2: "ph2",
  SG2: "sg2",
  TH2: "th2",
  TW2: "tw2",
  VN2: "vn2",
  RU: "ru",
  TR: "tr1",
};

const MATCH_REGION: Record<string, string> = {
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  oc1: "americas",
  euw1: "europe",
  eun1: "europe",
  tr1: "europe",
  ru: "europe",
  jp1: "asia",
  kr: "asia",
  ph2: "asia",
  sg2: "asia",
  th2: "asia",
  tw2: "asia",
  vn2: "asia",
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "X-Riot-Token": RIOT_API_KEY },
    });
    if (!res.ok) {
      console.error(`Riot API error ${res.status} ${res.statusText} — ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`Riot API network error:`, err);
    return null;
  }
}

export async function fetchAccountRiot(name: string, tag: string): Promise<RiotAccount | null> {
  return fetchJson<RiotAccount>(
    `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
  );
}

export async function fetchSummoner(puuid: string, region: string): Promise<RiotSummoner | null> {
  const routing = REGION_MAP[region.toUpperCase()] ?? region;
  return fetchJson<RiotSummoner>(
    `https://${routing}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
  );
}

export async function fetchMatchIds(puuid: string, region: string, count = 10): Promise<string[] | null> {
  const routing = REGION_MAP[region.toUpperCase()] ?? region;
  const matchRegion = MATCH_REGION[routing] ?? "americas";
  return fetchJson<string[]>(
    `https://${matchRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
  );
}

export async function fetchMatchDetails(matchId: string, region: string): Promise<MatchInfo | null> {
  const routing = REGION_MAP[region.toUpperCase()] ?? region;
  const matchRegion = MATCH_REGION[routing] ?? "americas";
  const data = await fetchJson<{ info: MatchInfo }>(
    `https://${matchRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
  );
  return data?.info ?? null;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function parseLolMatches(matches: MatchInfo[], puuid: string): LolMatch[] {
  return matches.slice(0, 10).map((m) => {
    const participant = m.participants.find((p) => p.puuid === puuid);
    if (!participant) return null;

    const kda =
      participant.deaths > 0
        ? ((participant.kills + participant.assists) / participant.deaths).toFixed(2)
        : "Perfecto";

    const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled;

    return {
      champion: participant.championName,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      kda,
      win: participant.win,
      gameMode: m.gameMode,
      gameDuration: formatDuration(m.gameDuration),
      cs,
      damage: participant.totalDamageDealtToChampions,
      visionScore: participant.visionScore,
      items: [
        participant.item0,
        participant.item1,
        participant.item2,
        participant.item3,
        participant.item4,
        participant.item5,
        participant.item6,
      ],
      summoners: [participant.summoner1Id, participant.summoner2Id],
      lane: participant.lane === "NONE" ? participant.role : participant.lane,
    };
  }).filter((m): m is LolMatch => m !== null);
}
