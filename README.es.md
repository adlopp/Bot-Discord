[English](README.md) | [Español](README.es.md)

# 🤖 Discord Bot de Preguntas y Respuestas

Bot multiusos para Discord con Q&A impulsado por IA, estadísticas de juegos y comandos útiles. Construido con **discord.js v14** y **TypeScript**.

## ✨ Comandos

### 🎯 `/preguntar <pregunta>`

Haz cualquier pregunta en lenguaje natural. El bot responde usando IA (Gemini u Ollama).

```
/preguntar ¿Cuál es la capital de Francia?
→ 🇫🇷 La capital de Francia es París.
```

### 🔫 `/valorant <nombre> <tag>`

Muestra las últimas 10 partidas competitivas de cualquier jugador de Valorant mediante la API de HenrikDev.

Muestra:
- Agente usado en cada partida
- K/D/A y porcentaje de headshots
- Resultado (Victoria/Derrota) y marcador
- Rango
- Estadísticas globales: K/D total, ratio de victorias

```
/valorant nombre:TenZ tag:666
→ ✅ 1. TenZ — 22/15/8 (KD 1.47) — 32.5% HS — Radiante
```

### 🏆 `/lol <nombre> <tag>`

Muestra las últimas 10 partidas de cualquier jugador de League of Legends mediante la API de Riot Games.

Muestra:
- Campeón usado en cada partida
- Ratio KDA
- CS (creep score)
- Resultado (Victoria/Derrota)
- Modo de juego y duración
- Estadísticas globales: KDA promedio, CS promedio, ratio de victorias

```
/lol nombre:Faker tag:EUW
→ ✅ 1. Faker — 12/2/15 (KDA 13.50) — 280 CS — CLASSIC
```

### ⚡ `/electrod`

Muestra información sobre Electrod, el mejor servicio de electricistas en Granada, con enlace a su web.

```
/electrod
→ ⚡ Electrod — ¿Necesitas al mejor electricista de Granada? https://www.electrod.es/
```

## 🔑 API Keys necesarias

| Clave | Dónde conseguirla |
|---|---|
| `DISCORD_TOKEN` & `CLIENT_ID` | [Discord Developer Portal](https://discord.com/developers/applications) → Nueva App → Bot → Reset Token |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `VALORANT_API_KEY` | [HenrikDev API](https://docs.henrikdev.xyz/) (gratis) |
| `LOL_API_KEY` | [Riot Developer Portal](https://developer.riotgames.com/) → Register Project. La dev key gratis expira en 24h. Solicita una **Personal key** (sin expiración) para proyectos pequeños; requiere una web (GitHub Pages vale). |

## 🚀 Instalación

### Local

```sh
git clone <repo>
cd bot
npm install
```

Copia `.env.example` a `.env` y rellena los valores:

```env
DISCORD_TOKEN=tu_token
CLIENT_ID=tu_client_id
GUILD_IDS=id_servidor_1,id_servidor_2   # opcional — comandos instantáneos
GEMINI_API_KEY=tu_key_de_gemini
VALORANT_API_KEY=tu_key_de_henrikdev
LOL_API_KEY=tu_key_de_riot
```

Ejecuta:

```sh
npm run deploy     # Registrar comandos slash
npm run dev        # Desarrollo (hot reload)
```

### Docker

```sh
docker compose up -d
```

O sin compose:

```sh
docker build -t discord-bot .
docker run --env-file .env discord-bot
```

> Requiere Docker. La imagen incluye ffmpeg automáticamente.

### Render (gratis)

El bot incluye un servidor HTTP de health-check necesario para Render (el plan gratis duerme el servicio a los 15 min de inactividad; el WebSocket se reconecta al despertar).

1. Sube tu repo a GitHub
2. Ve a [render.com](https://render.com) → **New Web Service** → conecta tu repo
3. Rellena:

   | Campo | Valor |
   |---|---|
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm run start` |
   | Plan | **Free** |
4. Añade las variables de entorno desde `.env` en el panel de Render (nunca las subas al repo)
5. Despliega

### Invitar al bot a tu servidor

1. Ve al [Discord Developer Portal](https://discord.com/developers/applications) → tu app → OAuth2 → URL Generator
2. Scopes: `bot` + `applications.commands`
3. Permisos: `Send Messages`, `Read Messages/View Channels`, `Use Slash Commands`
4. Abre la URL generada y selecciona tu servidor

## 📦 Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Ejecutar con hot reload (tsx watch) |
| `npm run build` | Compilar TypeScript a dist/ |
| `npm run start` | Ejecutar JS compilado (producción) |
| `npm run deploy` | Registrar comandos slash en Discord |
| `npm run lint` | Ejecutar ESLint |
| `npm run format` | Ejecutar Prettier |

## 🗂️ Estructura del proyecto

```
├── src/
│   ├── commands/          # Comandos slash (uno por archivo)
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

## 📄 Licencia

MIT
