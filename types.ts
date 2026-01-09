
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
  likes?: number;
  isFavorite?: boolean;
  author?: string;
}

export type ViewState = 'LANDING' | 'GALLERY' | 'CREATE' | 'DETAIL';
export type DisplayMode = 'GRID' | 'TABLE';

export interface AppState {
  prompts: Prompt[];
  searchQuery: string;
  selectedCategory: string | null;
  selectedPromptId: string | null;
  currentView: ViewState;
  displayMode: DisplayMode;
}
