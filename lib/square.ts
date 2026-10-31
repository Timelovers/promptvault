import rawSquare from '../data/square-prompts.json';
import { migratePrompt } from './prompts';
import type { Prompt } from '../types';

interface SquareVersionFile {
  version: number;
  date: string;
  note: string;
  content: string;
}

interface SquarePromptFile {
  id: string;
  title: string;
  description: string;
  category: string;
  model: string;
  tags: string[];
  author: string;
  likes: number;
  uses: number;
  featured?: boolean;
  cover: string;
  createdAt: string;
  versions: SquareVersionFile[];
}

function fromFile(file: SquarePromptFile): Prompt {
  const prompt = migratePrompt({
    ...file,
    versions: file.versions.map(version => ({
      id: `${file.id}-v${version.version}`,
      versionNumber: version.version,
      content: version.content,
      notes: version.note,
      date: version.date,
    })),
  });
  if (!prompt) throw new Error(`Invalid square prompt: ${file.id}`);
  return { ...prompt, featured: Boolean(file.featured), sourceId: file.id };
}

export const SQUARE_PROMPTS: Prompt[] = (rawSquare as SquarePromptFile[]).map(fromFile);

const ids = new Set<string>();
for (const prompt of SQUARE_PROMPTS) {
  if (ids.has(prompt.id)) throw new Error(`Duplicate square prompt id: ${prompt.id}`);
  ids.add(prompt.id);
}
