import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EditorDialog } from './components/EditorDialog';
import { FilterBar } from './components/FilterBar';
import { Hero } from './components/Hero';
import { PromptCard } from './components/PromptCard';
import { PromptDrawer } from './components/PromptDrawer';
import { SettingsDialog } from './components/SettingsDialog';
import { TopBar } from './components/TopBar';
import { copyText } from './lib/clipboard';
import {
  categoriesFor,
  currentVersion,
  filterPrompts,
  findLibraryCopy,
  libraryCopyFromSquare,
  modelsFor,
  createId,
} from './lib/prompts';
import { SQUARE_PROMPTS } from './lib/square';
import {
  downloadLibrary,
  loadGeminiKey,
  loadLibrary,
  loadSquareFavs,
  loadTheme,
  parseImportedPrompts,
  saveGeminiKey,
  saveLibrary,
  saveSquareFavs,
  saveTheme,
} from './lib/storage';
import type { OptimizedPrompt } from './services/geminiService';
import type { AppTab, Prompt, PromptOrigin, PromptVersion, SortKey } from './types';

function squareWithVersion(id: string, overrides: Record<string, string>): Prompt | null {
  const square = SQUARE_PROMPTS.find(prompt => prompt.id === id);
  if (!square) return null;
  const override = overrides[id];
  if (override && square.versions.some(version => version.id === override)) {
    return { ...square, currentVersionId: override };
  }
  return square;
}

export default function App() {
  const [boot] = useState(loadLibrary);
  const [library, setLibrary] = useState<Prompt[]>(boot.prompts);
  const allowPersist = useRef(boot.persist);
  const [squareFavs, setSquareFavs] = useState<string[]>(loadSquareFavs);
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme);
  const [apiKey, setApiKey] = useState(loadGeminiKey);
  const [tab, setTab] = useState<AppTab>('square');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');
  const [model, setModel] = useState('全部模型');
  const [sort, setSort] = useState<SortKey>('hot');
  const [open, setOpen] = useState<{ id: string; origin: PromptOrigin } | null>(null);
  const [squareVersion, setSquareVersion] = useState<Record<string, string>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsHint, setSettingsHint] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ mode: 'create' } | { mode: 'edit'; id: string } | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const noticed = useRef(false);

  const showToast = useCallback((text: string) => {
    setToast({ id: Date.now(), text });
  }, []);

  useEffect(() => {
    if (noticed.current) return;
    noticed.current = true;
    if (boot.notice) showToast(boot.notice);
  }, [boot.notice, showToast]);

  useEffect(() => {
    if (!allowPersist.current) return;
    if (!saveLibrary(library)) {
      allowPersist.current = false;
      showToast('浏览器拒绝写入本地存储，本次修改可能无法保留。');
    }
  }, [library, showToast]);

  useEffect(() => {
    saveSquareFavs(squareFavs);
  }, [squareFavs]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const apply = () => {
      document.documentElement.style.setProperty('--pv-header-h', `${header.offsetHeight}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const locked = Boolean(open) || settingsOpen || Boolean(editor);
  useEffect(() => {
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [locked]);

  const focusSearch = useCallback(() => {
    const desktop = desktopSearchRef.current;
    if (desktop && desktop.offsetParent !== null) desktop.focus();
    else mobileSearchRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (settingsOpen) {
          setSettingsOpen(false);
          return;
        }
        if (editor) {
          setEditor(null);
          return;
        }
        if (open) {
          const active = document.activeElement;
          if (active instanceof HTMLElement) active.blur();
          setOpen(null);
        }
        return;
      }
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return;
      event.preventDefault();
      focusSearch();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settingsOpen, editor, open, focusSearch]);

  const source = tab === 'square' ? SQUARE_PROMPTS : library;
  const categories = categoriesFor(source);
  const modelOptions = modelsFor(source);
  const activeCategory = categories.includes(category) ? category : '全部';
  const activeModel = modelOptions.includes(model) ? model : '全部模型';
  const visible = useMemo(
    () => filterPrompts(source, { category: activeCategory, model: activeModel, query: search, sort }),
    [source, activeCategory, activeModel, search, sort],
  );

  const drawer = useMemo(() => {
    if (!open) return null;
    if (open.origin === 'library') {
      const prompt = library.find(item => item.id === open.id);
      return prompt ? { prompt, origin: 'library' as const } : null;
    }
    const prompt = squareWithVersion(open.id, squareVersion);
    return prompt ? { prompt, origin: 'square' as const } : null;
  }, [open, library, squareVersion]);

  const favoriteOf = useCallback((prompt: Prompt, origin: PromptOrigin) => {
    if (origin === 'library') return prompt.isFavorite;
    const copy = findLibraryCopy(library, prompt.id);
    if (copy) return copy.isFavorite;
    return squareFavs.includes(prompt.id);
  }, [library, squareFavs]);

  const selectTab = (next: AppTab) => {
    setTab(next);
    window.scrollTo({ top: 0 });
  };

  const toggleFavorite = (prompt: Prompt, origin: PromptOrigin) => {
    if (origin === 'library') {
      const next = !prompt.isFavorite;
      setLibrary(prev => prev.map(item => item.id === prompt.id ? { ...item, isFavorite: next } : item));
      if (prompt.sourceId) {
        setSquareFavs(prev => next
          ? Array.from(new Set([...prev, prompt.sourceId as string]))
          : prev.filter(id => id !== prompt.sourceId));
      }
      showToast(next ? '已收藏' : '已取消收藏');
      return;
    }

    const copy = findLibraryCopy(library, prompt.id);
    if (copy) {
      const next = !copy.isFavorite;
      setLibrary(prev => prev.map(item => item.id === copy.id ? { ...item, isFavorite: next } : item));
      setSquareFavs(prev => next ? Array.from(new Set([...prev, prompt.id])) : prev.filter(id => id !== prompt.id));
      showToast(next ? '已收藏' : '已取消收藏');
      return;
    }

    const next = !squareFavs.includes(prompt.id);
    setSquareFavs(prev => next ? [...prev, prompt.id] : prev.filter(id => id !== prompt.id));
    showToast(next ? '已收藏' : '已取消收藏');
  };

  const addToLibrary = (prompt: Prompt) => {
    if (findLibraryCopy(library, prompt.id)) {
      showToast('已经在我的库里了');
      return;
    }
    const copy = libraryCopyFromSquare(prompt, prompt.currentVersionId, squareFavs.includes(prompt.id));
    setLibrary(prev => [copy, ...prev]);
    showToast('已加入我的库，可在「我的库」中继续编辑与版本管理');
  };

  const changeVersion = (prompt: Prompt, origin: PromptOrigin, versionId: string) => {
    if (!prompt.versions.some(version => version.id === versionId)) return;
    if (origin === 'library') {
      setLibrary(prev => prev.map(item => item.id === prompt.id ? { ...item, currentVersionId: versionId } : item));
      return;
    }
    setSquareVersion(prev => ({ ...prev, [prompt.id]: versionId }));
  };

  const handleOptimized = (prompt: Prompt, result: OptimizedPrompt) => {
    const existing = library.find(item => item.id === prompt.id || item.sourceId === prompt.id);
    const base = existing ?? libraryCopyFromSquare(
      prompt,
      prompt.currentVersionId,
      squareFavs.includes(prompt.id) || prompt.isFavorite,
    );
    const versionNumber = Math.max(...base.versions.map(version => version.versionNumber)) + 1;
    const version: PromptVersion = {
      id: createId('ver'),
      versionNumber,
      content: result.optimizedContent,
      systemInstruction: result.systemInstruction || undefined,
      notes: result.reasoning ? `AI 优化：${result.reasoning}`.slice(0, 280) : 'AI 优化',
      timestamp: Date.now(),
    };
    const updated: Prompt = {
      ...base,
      tags: [...base.tags],
      versions: [...base.versions.map(item => ({ ...item })), version],
      currentVersionId: version.id,
      updatedAt: Date.now(),
      featured: undefined,
    };
    setLibrary(prev => {
      const index = prev.findIndex(item => item.id === updated.id || (updated.sourceId && item.sourceId === updated.sourceId));
      if (index === -1) return [updated, ...prev];
      return prev.map((item, itemIndex) => itemIndex === index ? updated : item);
    });
    setOpen({ id: updated.id, origin: 'library' });
    showToast(existing ? `已保存为新版本 v${versionNumber}` : `已保存为新版本 v${versionNumber}，并加入我的库`);
  };

  const deletePrompt = (id: string) => {
    if (!window.confirm('确定要删除这个提示词吗？')) return;
    setLibrary(prev => prev.filter(item => item.id !== id));
    setOpen(current => (current?.origin === 'library' && current.id === id ? null : current));
    setEditor(current => (current?.mode === 'edit' && current.id === id ? null : current));
    showToast('已删除');
  };

  const savePrompt = (prompt: Prompt) => {
    const creating = !library.some(item => item.id === prompt.id);
    setLibrary(prev => prev.some(item => item.id === prompt.id)
      ? prev.map(item => item.id === prompt.id ? prompt : item)
      : [prompt, ...prev]);
    setEditor(null);
    setTab('library');
    setOpen({ id: prompt.id, origin: 'library' });
    if (creating) {
      setSearch('');
      setCategory('全部');
      setModel('全部模型');
      setSort('new');
    }
    window.scrollTo({ top: 0 });
    showToast(creating ? '已创建' : '已保存');
  };

  const exportLibrary = () => {
    downloadLibrary(library);
    showToast(library.length ? '已导出 JSON' : '已导出空的库');
  };

  const requestImport = () => {
    if (fileRef.current) fileRef.current.value = '';
    fileRef.current?.click();
  };

  const onImportFile = async (file: File) => {
    if (file.size > 5_000_000) {
      showToast('文件过大（上限 5MB）');
      return;
    }
    let data: unknown;
    try {
      data = JSON.parse(await file.text());
    } catch {
      showToast('导入失败：文件不是有效的 JSON');
      return;
    }
    let parsed: { prompts: Prompt[]; invalid: number };
    try {
      parsed = parseImportedPrompts(data);
    } catch {
      showToast('导入失败：找不到提示词列表');
      return;
    }
    if (parsed.prompts.length > 2000) {
      showToast('一次最多导入 2000 条');
      return;
    }

    const seen = new Set(library.map(prompt => prompt.id));
    const fresh: Prompt[] = [];
    let skipped = 0;
    for (const prompt of parsed.prompts) {
      if (seen.has(prompt.id)) {
        skipped += 1;
        continue;
      }
      seen.add(prompt.id);
      fresh.push(prompt);
    }
    if (!fresh.length) {
      showToast(skipped ? `没有新提示词，跳过 ${skipped} 条重复` : '没有导入任何提示词');
      return;
    }
    setLibrary(prev => [...fresh, ...prev]);
    setTab('library');
    const invalidNote = parsed.invalid ? `，${parsed.invalid} 条无法识别` : '';
    const skipNote = skipped ? `，跳过 ${skipped} 条重复` : '';
    showToast(`已导入 ${fresh.length} 条${skipNote}${invalidNote}`);
  };

  const copyPrompt = async (prompt: Prompt) => {
    const ok = await copyText(currentVersion(prompt).content);
    showToast(ok ? '已复制到剪贴板' : '复制失败，请手动选择文本');
  };

  const openSettings = (hint?: string) => {
    setSettingsHint(hint ?? null);
    setSettingsOpen(true);
  };

  const libraryEmpty = tab === 'library' && library.length === 0;
  const infoPrefix = tab === 'library' ? '我的库 · 存储于本地 localStorage · ' : '';
  const editingPrompt = editor?.mode === 'edit' ? library.find(item => item.id === editor.id) : undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 selection:bg-violet-200 dark:selection:bg-violet-800">
      <TopBar
        ref={headerRef}
        tab={tab}
        libraryCount={library.length}
        search={search}
        theme={theme}
        desktopSearchRef={desktopSearchRef}
        mobileSearchRef={mobileSearchRef}
        onSearch={setSearch}
        onTab={selectTab}
        onExport={exportLibrary}
        onImport={requestImport}
        onTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
        onCreate={() => setEditor({ mode: 'create' })}
        onSettings={() => openSettings()}
        onLogo={() => {
          setTab('square');
          setSearch('');
          window.scrollTo({ top: 0 });
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {tab === 'square' && search.trim() === '' && (
          <Hero prompts={SQUARE_PROMPTS} onOpen={id => setOpen({ id, origin: 'square' })} />
        )}
        <FilterBar
          categories={categories}
          category={activeCategory}
          models={modelOptions}
          model={activeModel}
          sort={sort}
          onCategory={setCategory}
          onModel={setModel}
          onSort={setSort}
        />
        <p className="text-xs text-slate-400 mt-4" aria-live="polite">{infoPrefix}共 {visible.length} 条提示词</p>

        {libraryEmpty ? (
          <div className="text-center text-slate-400 py-20 mb-16">
            <p>库里还没有内容，去广场挑几条「加入我的库」吧</p>
            <button type="button" onClick={() => selectTab('square')} className="mt-4 px-4 py-2 rounded-full bg-violet-600 text-white text-sm">
              去广场看看
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center text-slate-400 py-20 mb-16">没有找到匹配的提示词</div>
        ) : (
          <div className="mt-3 mb-16 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {visible.map(prompt => {
              const origin: PromptOrigin = tab === 'square' ? 'square' : 'library';
              return (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  favorite={favoriteOf(prompt, origin)}
                  onOpen={() => setOpen({ id: prompt.id, origin })}
                  onToggleFavorite={() => toggleFavorite(prompt, origin)}
                  onCopy={() => { void copyPrompt(prompt); }}
                />
              );
            })}
          </div>
        )}
      </main>

      <PromptDrawer
        open={Boolean(drawer)}
        prompt={drawer?.prompt ?? null}
        origin={drawer?.origin ?? 'square'}
        favorite={drawer ? favoriteOf(drawer.prompt, drawer.origin) : false}
        inLibrary={drawer ? Boolean(findLibraryCopy(library, drawer.prompt.id)) : false}
        apiKey={apiKey}
        onClose={() => setOpen(null)}
        onToggleFavorite={() => drawer && toggleFavorite(drawer.prompt, drawer.origin)}
        onAddToLibrary={() => drawer && addToLibrary(drawer.prompt)}
        onOpenLibrary={() => drawer && setOpen({ id: findLibraryCopy(library, drawer.prompt.id)?.id ?? drawer.prompt.id, origin: 'library' })}
        onChangeVersion={versionId => drawer && changeVersion(drawer.prompt, drawer.origin, versionId)}
        onEdit={() => drawer && setEditor({ mode: 'edit', id: drawer.prompt.id })}
        onDelete={() => drawer && deletePrompt(drawer.prompt.id)}
        onRequestKey={() => openSettings(apiKey.trim() ? undefined : '请先填写 Gemini API Key，再使用 AI 优化。')}
        onOptimized={result => drawer && handleOptimized(drawer.prompt, result)}
        onToast={showToast}
      />

      {settingsOpen && (
        <SettingsDialog
          apiKey={apiKey}
          hint={settingsHint}
          onClose={() => setSettingsOpen(false)}
          onSaveKey={(key) => {
            const trimmed = key.trim();
            setApiKey(trimmed);
            saveGeminiKey(trimmed);
            setSettingsOpen(false);
            setSettingsHint(null);
            showToast(trimmed ? '已保存 API Key' : '已清除 API Key');
          }}
          onExport={exportLibrary}
          onImport={requestImport}
        />
      )}

      {editor && (editor.mode === 'create' || editingPrompt) && (
        <EditorDialog
          key={editor.mode === 'edit' ? editor.id : 'create'}
          mode={editor.mode}
          initial={editingPrompt}
          extraCategories={library.map(prompt => prompt.category)}
          extraModels={library.map(prompt => prompt.model)}
          onCancel={() => setEditor(null)}
          onSave={savePrompt}
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-hidden="true"
        onChange={event => {
          const file = event.target.files?.[0];
          if (file) void onImportFile(file);
        }}
      />

      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm px-4 py-2 rounded-full transition pointer-events-none ${toast ? 'opacity-100' : 'opacity-0'}`}
        role="status"
      >
        {toast?.text}
      </div>
    </div>
  );
}
