import { GoogleGenAI, Type } from '@google/genai';

export const GEMINI_MODEL = 'gemini-3-flash-preview';

export interface OptimizedPrompt {
  optimizedContent: string;
  systemInstruction: string;
  reasoning: string;
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseOptimized(text: string): OptimizedPrompt {
  const trimmed = text.trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('BAD_JSON');
    parsed = JSON.parse(trimmed.slice(start, end + 1));
  }

  if (!parsed || typeof parsed !== 'object') throw new Error('BAD_JSON');
  const record = parsed as Record<string, unknown>;
  const optimizedContent = asText(record.optimizedContent);
  if (!optimizedContent) throw new Error('EMPTY');
  return {
    optimizedContent,
    systemInstruction: asText(record.systemInstruction),
    reasoning: asText(record.reasoning),
  };
}

/**
 * Rewrites a prompt with the caller's own Gemini key.
 * The key is never read from the build environment.
 */
export async function optimizePrompt(input: string, apiKey: string): Promise<OptimizedPrompt> {
  const key = apiKey.trim();
  if (!key) throw new Error('MISSING_KEY');

  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Rewrite this prompt. Keep its language and every {{variable}} placeholder:\n\n${input}`,
    config: {
      systemInstruction: `You are an expert prompt engineer. Transform the user's prompt into a clearer, more structured prompt.
Rules:
- Write optimizedContent in the same language as the original prompt.
- Preserve every {{variable}} placeholder exactly, including the braces.
- Do not invent facts, names, or requirements the user did not provide.
- systemInstruction is a short persona or system setting in the same language.
- reasoning briefly explains what changed, in the same language as the original prompt.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          optimizedContent: { type: Type.STRING },
          systemInstruction: { type: Type.STRING },
          reasoning: { type: Type.STRING },
        },
        required: ['optimizedContent', 'systemInstruction', 'reasoning'],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error('EMPTY');
  return parseOptimized(text);
}
