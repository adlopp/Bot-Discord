import { askOllama } from "../utils/ollama.js";

const qaStore = new Map<string, string>([
  ["¿qué es este bot?", "Soy un bot de preguntas y respuestas creado con discord.js y TypeScript."],
  ["¿quién te creó?", "Fui creado por un desarrollador usando discord.js v14 con TypeScript."],
  ["¿cómo funcionas?", "Proceso comandos slash y respondo preguntas basadas en mi base de conocimiento."],
  ["¿qué comandos tienes?", "Usa /preguntar para hacerme una pregunta, o /ayuda para ver todos los comandos disponibles."],
]);

export async function getAnswer(question: string): Promise<string | null> {
  const normalized = question.toLowerCase().trim();

  for (const [key, answer] of qaStore) {
    if (normalized.includes(key.toLowerCase())) {
      return answer;
    }
  }

  return await askOllama(question);
}

export function addQuestion(key: string, answer: string): void {
  qaStore.set(key.toLowerCase(), answer);
}

export function getKnownKeys(): string[] {
  return Array.from(qaStore.keys());
}
