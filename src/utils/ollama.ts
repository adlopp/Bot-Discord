import ollama from "ollama";

const MODEL = "llama3.2";

export async function askOllama(question: string): Promise<string | null> {
  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: `Responde esta pregunta de forma clara y concisa en español: ${question}`,
        },
      ],
    });

    return response.message.content || null;
  } catch (error) {
    console.error("Error con Ollama:", error);
    return null;
  }
}
