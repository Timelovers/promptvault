export interface PromptVersion {
  id: string;
  versionNumber: number;
  content: string;
  systemInstruction?: string;
  notes: string;
  timestamp: number;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  versions: PromptVersion[];
  currentVersionId: string;
  createdAt: number;
  updatedAt: number;
  likes: number;
  uses: number;
  isFavorite: boolean;
  author: string;
  model: string;
  /** Tailwind gradient stops, e.g. "from-sky-400 to-indigo-500". */
  cover: string;
  /** Square prompt id this library item was copied from. */
  sourceId?: string;
  featured?: boolean;
}

export type AppTab = 'square' | 'library';
export type SortKey = 'hot' | 'new' | 'used';
export type PromptOrigin = 'square' | 'library';
