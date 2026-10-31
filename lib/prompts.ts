import type { Prompt, PromptVersion, SortKey } from '../types';

export const DEFAULT_COVER = 'from-violet-400 to-fuchsia-500';

export const SQUARE_CATEGORIES = [
  '办公效率',
  '编程开发',
  '学习成长',
  '产品设计',
  '内容创作',
  'AI 绘图',
  '职场求职',
] as const;

export const MODEL_OPTIONS = ['通用', 'GPT', 'Claude', 'Gemini', 'Midjourney', 'Stable Diffusion'] as const;

/** Covers for categories that already exist in older local libraries. */
export const CATEGORY_COVER: Record<string, string> = {
  '办公效率': 'from-sky-400 to-indigo-500',
  '编程开发': 'from-emerald-400 to-teal-600',
  '学习成长': 'from-amber-400 to-orange-500',
  '产品设计': 'from-fuchsia-400 to-pink-500',
  '内容创作': 'from-rose-400 to-red-500',
  'AI 绘图': 'from-violet-400 to-purple-600',
  '职场求职': 'from-orange-400 to-amber-600',
  '创意写作': 'from-pink-400 to-rose-500',
  '绘图': 'from-violet-400 to-purple-600',
  '编程': 'from-cyan-400 to-blue-600',
  'ChatGPT': 'from-emerald-400 to-teal-500',
};

const COVER_RE = /^from-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:200|300|400|500|600|700) to-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:200|300|400|500|600|700)$/;

export function safeCover(cover: string | undefined, category: string): string {
  if (cover && COVER_RE.test(cover.trim())) return cover.trim();
  return CATEGORY_COVER[category] ?? DEFAULT_COVER;
}

export function createId(prefix: string): string {
  const rand = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${rand}`;
}

export function parseTime(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T12:00:00` : trimmed;
    const parsed = Date.parse(iso);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function finiteNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : NaN;
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(tag => String(tag).trim()).filter(Boolean);
  if (typeof tags === 'string') return tags.split(/[,，]/).map(tag => tag.trim()).filter(Boolean);
  return [];
}

function normalizeVersions(item: Record<string, unknown>, createdAt: number): PromptVersion[] {
  const rawVersions = Array.isArray(item.versions) ? item.versions : [];
  const versions: PromptVersion[] = [];
  const seen = new Set<string>();

  rawVersions.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    const version = entry as Record<string, unknown>;
    const content = typeof version.content === 'string'
      ? version.content
      : typeof version.c === 'string'
        ? version.c
        : null;
    if (content === null) return;
    const versionNumber = finiteNumber(version.versionNumber ?? version.version ?? version.n, index + 1);
    let id = typeof version.id === 'string' && version.id.trim() ? version.id.trim() : `v${versionNumber || index + 1}`;
    if (seen.has(id)) id = `${id}-${index}`;
    seen.add(id);
    const next: PromptVersion = {
      id,
      versionNumber: versionNumber || index + 1,
      content,
      notes: typeof version.notes === 'string' ? version.notes : typeof version.note === 'string' ? version.note : '',
      timestamp: parseTime(version.timestamp ?? version.t ?? version.date, createdAt),
    };
    if (typeof version.systemInstruction === 'string' && version.systemInstruction.trim()) {
      next.systemInstruction = version.systemInstruction;
    }
    versions.push(next);
  });

  if (!versions.length && typeof item.content === 'string') {
    versions.push({
      id: 'v1',
      versionNumber: 1,
      content: item.content,
      notes: '导入的提示词',
      timestamp: createdAt,
    });
  }

  return versions;
}

function pickCurrent(versions: PromptVersion[], current: unknown): string {
  if (typeof current === 'string' && versions.some(version => version.id === current)) return current;
  return [...versions].sort((a, b) => b.versionNumber - a.versionNumber)[0].id;
}

/** Accepts the historical PromptVault shape and the square-file shape. */
export function migratePrompt(raw: unknown): Prompt | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  if (!title) return null;

  const createdAt = parseTime(item.createdAt, Date.now());
  const versions = normalizeVersions(item, createdAt);
  if (!versions.length) return null;

  const category = typeof item.category === 'string' && item.category.trim() ? item.category.trim() : '办公效率';
  const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : createId('legacy');

  return {
    id,
    title,
    description: typeof item.description === 'string' ? item.description : '',
    category,
    tags: normalizeTags(item.tags),
    versions,
    currentVersionId: pickCurrent(versions, item.currentVersionId),
    createdAt,
    updatedAt: parseTime(item.updatedAt, createdAt),
    likes: finiteNumber(item.likes),
    uses: finiteNumber(item.uses),
    isFavorite: item.isFavorite === true,
    author: typeof item.author === 'string' && item.author.trim() ? item.author.trim() : '我',
    model: typeof item.model === 'string' && item.model.trim() ? item.model.trim() : '通用',
    cover: safeCover(typeof item.cover === 'string' ? item.cover : undefined, category),
    sourceId: typeof item.sourceId === 'string' && item.sourceId.trim() ? item.sourceId.trim() : undefined,
  };
}

export function currentVersion(prompt: Prompt): PromptVersion {
  return prompt.versions.find(version => version.id === prompt.currentVersionId)
    ?? [...prompt.versions].sort((a, b) => b.versionNumber - a.versionNumber)[0];
}

export function versionsNewestFirst(prompt: Prompt): PromptVersion[] {
  return [...prompt.versions].sort((a, b) => b.versionNumber - a.versionNumber || b.timestamp - a.timestamp);
}

export function extractVars(content: string): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const match of content.matchAll(/\{\{(.+?)\}\}/g)) {
    const name = match[1];
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}

export function fillTemplate(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{(.+?)\}\}/g, (token, name: string) => {
    const value = values[name];
    return value ? value : token;
  });
}

export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.max(0, Math.round(value));
  if (rounded < 1000) return String(rounded);
  return `${(rounded / 1000).toFixed(1)}k`;
}

export function formatDate(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return '';
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

export function authorInitial(author: string): string {
  const trimmed = author.trim();
  if (!trimmed) return '?';
  return Array.from(trimmed)[0];
}

function orderedPresent(preferred: readonly string[], values: string[]): string[] {
  const present = new Set(values.filter(Boolean));
  const head = preferred.filter(item => present.has(item));
  const rest = [...present].filter(item => !preferred.includes(item));
  return [...head, ...rest];
}

export function categoriesFor(prompts: Prompt[]): string[] {
  return ['全部', ...orderedPresent(SQUARE_CATEGORIES, prompts.map(prompt => prompt.category))];
}

export function modelsFor(prompts: Prompt[]): string[] {
  return ['全部模型', ...orderedPresent(MODEL_OPTIONS, prompts.map(prompt => prompt.model))];
}

export function categoryChoices(extra: string[]): string[] {
  const known = new Set<string>(SQUARE_CATEGORIES);
  const extras = extra.filter(item => item && !known.has(item));
  return [...SQUARE_CATEGORIES, ...Array.from(new Set(extras))];
}

export function modelChoices(extra: string[]): string[] {
  const known = new Set<string>(MODEL_OPTIONS);
  const extras = extra.filter(item => item && !known.has(item));
  return [...MODEL_OPTIONS, ...Array.from(new Set(extras))];
}

export function filterPrompts(
  prompts: Prompt[],
  options: { category: string; model: string; query: string; sort: SortKey },
): Prompt[] {
  const query = options.query.trim().toLowerCase();
  const filtered = prompts.filter(prompt => {
    if (options.category !== '全部' && prompt.category !== options.category) return false;
    if (options.model !== '全部模型' && prompt.model !== options.model) return false;
    if (!query) return true;
    const haystack = [
      prompt.title,
      prompt.description,
      prompt.author,
      prompt.category,
      prompt.model,
      ...prompt.tags,
      ...prompt.versions.map(version => `${version.content}\n${version.notes}`),
    ].join('\n').toLowerCase();
    return haystack.includes(query);
  });

  return [...filtered].sort((a, b) => {
    if (options.sort === 'new') return b.createdAt - a.createdAt;
    if (options.sort === 'used') return b.uses - a.uses;
    return b.likes - a.likes;
  });
}

export function findLibraryCopy(library: Prompt[], squareId: string): Prompt | undefined {
  return library.find(prompt => prompt.id === squareId || prompt.sourceId === squareId);
}

export function libraryCopyFromSquare(square: Prompt, currentVersionId: string, isFavorite: boolean): Prompt {
  const versionId = square.versions.some(version => version.id === currentVersionId)
    ? currentVersionId
    : currentVersion(square).id;
  return {
    id: square.id,
    sourceId: square.id,
    title: square.title,
    description: square.description,
    category: square.category,
    tags: [...square.tags],
    versions: square.versions.map(version => ({ ...version })),
    currentVersionId: versionId,
    createdAt: square.createdAt,
    updatedAt: Date.now(),
    likes: square.likes,
    uses: square.uses,
    isFavorite,
    author: square.author,
    model: square.model,
    cover: safeCover(square.cover, square.category),
  };
}
