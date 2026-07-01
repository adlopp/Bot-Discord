# Discord Bot - Preguntas y Respuestas

## Stack
- **Runtime:** Node.js (`"type": "module"`)
- **Lenguaje:** TypeScript
- **Framework:** discord.js v14+
- **Linter/Formatter:** ESLint + Prettier
- **Base de datos:** (por definir)

## Convenciones de código
- Sin `any` explícito; tipar todo correctamente.
- Nombres en inglés para variables, funciones, archivos y carpetas.
- Comandos en español (slash commands con descripciones en español).
- Usar `camelCase` para variables/funciones, `PascalCase` para clases/interfaces.
- Preferir `const` sobre `let`; evitar `var`.
- Funciones asíncronas con `async/await`, evitar callbacks.
- Los archivos de comandos van en `src/commands/`, uno por archivo con `export default`.
- Los eventos van en `src/events/`, uno por archivo con `export default`.
- Handlers en `src/handlers/`, utils en `src/utils/`.
- Tipos compartidos en `src/types.ts`.
- Los imports usan extensión `.js` (Node16 moduleResolution).

## Scripts disponibles
```json
{
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "deploy": "tsx src/deploy-commands.ts",
  "lint": "eslint src/",
  "format": "prettier --write src/"
}
```

## Estructura del proyecto
```
src/
├── commands/
│   └── preguntar.ts          # /preguntar - responde preguntas
├── events/
│   ├── ready.ts               # Log al conectar
│   └── interactionCreate.ts   # Dispatch de comandos + manejo de errores
├── handlers/
│   └── qaHandler.ts           # Lógica de Q&A (Map interno)
├── utils/
│   └── loader.ts              # Carga automática de comandos/eventos
├── config/
│   └── env.ts                 # Validación de variables de entorno
├── types.ts                   # Interfaces BotCommand, BotEvent, BotCommandData
├── deploy-commands.ts         # Registro de comandos via REST
└── index.ts                   # Entry point - crea el Client y loguea
```

## Reglas
- No subir tokens/secrets al repo. Usar `.env` (incluido en `.gitignore`).
- Los comandos deben responder usando `interaction.reply`, `interaction.editReply` o `interaction.followUp`.
- Manejar errores con try/catch y responder al usuario con mensaje ephemeral amigable.
- Usar `Ephemeral` para mensajes de error o información sensible.
- Prefijo de comandos: `/` (slash commands nativos).
- Registrar comandos con `npm run deploy` (usa `REST.put`).
- Para añadir un comando nuevo: crear archivo en `src/commands/`, exportar `BotCommand` como default.
- Para añadir un evento: crear archivo en `src/events/`, exportar `BotEvent` como default.

## Testing
- Framework: (por definir - Vitest o Jest)
- Tests unitarios en `src/__tests__/`
- Tests de integración con un bot de prueba
