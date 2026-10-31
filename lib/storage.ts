import { migratePrompt } from './prompts';
import type { Prompt } from '../types';

/** Existing library key. Do not rename — already-saved vaults live here. */
export const LIBRARY_KEY = 'prompt_vault_data';
export const THEME_KEY = 'prompt_vault_theme';
export const SQUARE_FAV_KEY = 'prompt_vault_square_favs';
export const GEMINI_KEY = 'prompt_vault_gemini_key';
const UNREADABLE_KEY = 'prompt_vault_unreadable';

export interface LoadResult {
  prompts: Prompt[];
  persist: boolean;
  notice?: string;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* private mode or a full disk */
  }
}

export function loadLibrary(): LoadResult {
  const raw = safeGet(LIBRARY_KEY);
  if (!raw) return { prompts: [], persist: true };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      prompts: [],
      persist: false,
      notice: '本地库数据无法读取，已停止自动保存以免覆盖。',
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      prompts: [],
      persist: false,
      notice: '本地库数据格式无法识别，已停止自动保存以免覆盖。',
    };
  }

  const prompts: Prompt[] = [];
  const dropped: unknown[] = [];
  for (const item of parsed) {
    const prompt = migratePrompt(item);
    if (prompt) prompts.push(prompt);
    else dropped.push(item);
  }

  if (dropped.length) {
    safeSet(UNREADABLE_KEY, JSON.stringify(dropped));
    return {
      prompts,
      persist: true,
      notice: `有 ${dropped.length} 条旧数据无法识别，已原样另存，其余提示词可正常使用。`,
    };
  }

  return { prompts, persist: true };
}

export function saveLibrary(prompts: Prompt[]): boolean {
  return safeSet(LIBRARY_KEY, JSON.stringify(prompts));
}

export function loadTheme(): 'light' | 'dark' {
  return safeGet(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function saveTheme(theme: 'light' | 'dark') {
  safeSet(THEME_KEY, theme);
}

export function loadSquareFavs(): string[] {
  const raw = safeGet(SQUARE_FAV_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function saveSquareFavs(ids: string[]) {
  safeSet(SQUARE_FAV_KEY, JSON.stringify(ids));
}

export function loadGeminiKey(): string {
  return safeGet(GEMINI_KEY) ?? '';
}

export function saveGeminiKey(key: string) {
  if (key) safeSet(GEMINI_KEY, key);
  else safeRemove(GEMINI_KEY);
}

export function parseImportedPrompts(data: unknown): { prompts: Prompt[]; invalid: number } {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { prompts?: unknown }).prompts)
      ? (data as { prompts: unknown[] }).prompts
      : null;
  if (!list) throw new Error('FORMAT');

  const prompts: Prompt[] = [];
  let invalid = 0;
  for (const item of list) {
    const prompt = migratePrompt(item);
    if (prompt) prompts.push(prompt);
    else invalid += 1;
  }
  return { prompts, invalid };
}

export function downloadLibrary(prompts: Prompt[]) {
  const payload = {
    app: 'promptvault',
    version: 1,
    exportedAt: new Date().toISOString(),
    prompts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `promptvault-library-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
