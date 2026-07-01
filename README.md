[English](README.md) | [Español](README.es.md)

# 🤖 Discord Q&A Bot

Multipurpose Discord bot with AI-powered Q&A, game stats, and utility commands. Built with **discord.js v14** and **TypeScript**.

## ✨ Commands

### 🎯 `/preguntar <pregunta>`

Ask any question in natural language. The bot responds using AI (Gemini or Ollama).

```
/preguntar ¿Cuál es la capital de Francia?
→ 🇫🇷 La capital de Francia es París.
```

### 🔫 `/valorant <nombre> <tag>`

Shows the last 10 competitive matches of any Valorant player via HenrikDev API.

Displays:
- Agent played per match
- K/D/A and headshot percentage
- Match result (Victory/Defeat) and score
- Rank tier
- Global stats: total K/D, win/loss ratio

```
/valorant nombre:TenZ tag:666
→ ✅ 1. TenZ — 22/15/8 (KD 1.47) — 32.5% HS — Radiant
```

### 🏆 `/lol <nombre> <tag>`

Shows the last 10 matches of any League of Legends player via Riot Games API.

Displays:
- Champion played per match
- KDA ratio
- CS (creep score)
- Win/loss result
- Game mode and duration
- Global stats: average KDA, average CS, win/loss ratio

```
/lol nombre:Faker tag:EUW
→ ✅ 1. Faker — 12/2/15 (KDA 13.50) — 280 CS — CLASSIC
```

### ⚡ `/electrod`

Shows info about Electrod, the best electrical service in Granada, with a link to their website.

```
/electrod
→ ⚡ Electrod — ¿Necesitas al mejor electricista de Granada? https://www.electrod.es/
```

## 🔑 API Keys needed

| Key | Where to get it |
|---|---|
| `DISCORD_TOKEN` & `CLIENT_ID` | [Discord Developer Portal](https://discord.com/developers/applications) → New Application → Bot → Reset Token |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `VALORANT_API_KEY` | [HenrikDev API](https://docs.henrikdev.xyz/) (free) |
| `LOL_API_KEY` | [Riot Developer Portal](https://developer.riotgames.com/) → Register Project. The free dev key expires in 24h. Apply for a **Personal key** (no expiry) for small projects; needs a website (GitHub Pages works). |

## 🚀 Installation

### Local

```sh
git clone <repo>
cd bot
npm install
```

Copy `.env.example` to `.env` and fill in the values:

```env
DISCORD_TOKEN=your_token
CLIENT_ID=your_client_id
GUILD_IDS=server_id_1,server_id_2   # optional — instant command registration
GEMINI_API_KEY=your_gemini_key
VALORANT_API_KEY=your_henrikdev_key
LOL_API_KEY=your_riot_api_key
```

Run:

```sh
npm run deploy     # Register slash commands
npm run dev        # Development (hot reload)
```

### Docker

```sh
docker compose up -d
```

Or without compose:

```sh
docker build -t discord-bot .
docker run --env-file .env discord-bot
```

> Requires Docker installed. The image includes ffmpeg automatically.

### Inviting the bot to your server

1. Go to [Discord Developer Portal](https://discord.com/developers/applications) → your app → OAuth2 → URL Generator
2. Scopes: `bot` + `applications.commands`
3. Permissions: `Send Messages`, `Read Messages/View Channels`, `Use Slash Commands`
4. Open the generated URL and select your server

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to dist/ |
| `npm run start` | Run compiled JS (production) |
| `npm run deploy` | Register slash commands on Discord |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |

## 🗂️ Project Structure

```
├── src/
│   ├── commands/          # Slash commands (one file each)
│   │   ├── preguntar.ts
│   │   ├── valorant.ts
│   │   ├── lol.ts
│   │   └── electrod.ts
│   ├── events/
│   │   ├── ready.ts
│   │   └── interactionCreate.ts
│   ├── handlers/
│   │   └── qaHandler.ts
│   ├── utils/
│   │   ├── loader.ts
│   │   ├── gemini.ts
│   │   ├── ollama.ts
│   │   ├── valorantApi.ts
│   │   └── lolApi.ts
│   ├── config/
│   │   └── env.ts
│   ├── types.ts
│   ├── index.ts
│   └── deploy-commands.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## 🧰 Stack

`Node.js` · `TypeScript` · `discord.js v14` · `Gemini AI` · `Ollama` · `Riot Games API` · `HenrikDev API`
## 📄 License

MIT