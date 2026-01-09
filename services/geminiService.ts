
import { GoogleGenAI, Type } from "@google/genai";

export async function optimizePrompt(input: string): Promise<{
  optimizedContent: string;
  systemInstruction: string;
  reasoning: string;
}> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transform this basic prompt into a professional, structured prompt: "${input}"`,
    config: {
      systemInstruction: `You are an expert Prompt Engineer. Your goal is to take a raw user prompt and transform it into a high-quality, structured prompt following a framework like CO-STAR or Role-Context-Task-Constraint. 
      Return a JSON object with:
      1. 'optimizedContent': The refined user prompt.
      2. 'systemInstruction': A persona/system setting.
      3. 'reasoning': Why these changes help.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          optimizedContent: { type: Type.STRING },
          systemInstruction: { type: Type.STRING },
          reasoning: { type: Type.STRING }
        },
        required: ["optimizedContent", "systemInstruction", "reasoning"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
}
