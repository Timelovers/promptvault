import { forwardRef, type RefObject } from 'react';
import type { AppTab } from '../types';

interface TopBarProps {
  tab: AppTab;
  libraryCount: number;
  search: string;
  theme: 'light' | 'dark';
  desktopSearchRef: RefObject<HTMLInputElement | null>;
  mobileSearchRef: RefObject<HTMLInputElement | null>;
  onSearch: (value: string) => void;
  onTab: (tab: AppTab) => void;
  onExport: () => void;
  onImport: () => void;
  onTheme: () => void;
  onCreate: () => void;
  onSettings: () => void;
  onLogo: () => void;
}

export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar(props, ref) {
  const tabClass = (active: boolean) =>
    `px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap ${active ? 'bg-white dark:bg-slate-950 shadow font-medium' : 'text-slate-500'}`;

  return (
    <header ref={ref} className="sticky top-0 z-30 backdrop-blur bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-4">
        <button type="button" onClick={props.onLogo} className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white grid place-items-center">P</span>
          <span className="hidden sm:inline">PromptVault</span>
        </button>
        <nav className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 text-sm shrink-0" aria-label="视图">
          <button type="button" className={tabClass(props.tab === 'square')} aria-pressed={props.tab === 'square'} onClick={() => props.onTab('square')}>
            广场
          </button>
          <button type="button" className={tabClass(props.tab === 'library')} aria-pressed={props.tab === 'library'} onClick={() => props.onTab('library')}>
            我的库 <span className="text-xs opacity-60">{props.libraryCount}</span>
          </button>
        </nav>
        <div className="flex-1 hidden md:block min-w-0">
          <input
            ref={props.desktopSearchRef}
            value={props.search}
            onChange={event => props.onSearch(event.target.value)}
            aria-label="搜索提示词"
            placeholder="搜索标题、描述、标签…  ( / )"
            className="w-full max-w-md px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-violet-400 text-sm"
          />
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
          <button type="button" onClick={props.onExport} className="hidden sm:inline text-sm px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            导出
          </button>
          <button type="button" onClick={props.onImport} className="hidden sm:inline text-sm px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            导入
          </button>
          <button
            type="button"
            onClick={props.onSettings}
            aria-label="设置"
            title="设置"
            className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 grid place-items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.757.426 1.757 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.757-2.924 1.757-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.757-.426-1.757-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={props.onTheme}
            aria-label={props.theme === 'dark' ? '切换到浅色' : '切换到深色'}
            title="切换主题"
            className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {props.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button type="button" onClick={props.onCreate} className="text-sm px-3 sm:px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white">
            + 新建
          </button>
        </div>
      </div>
      <div className="md:hidden px-4 pb-3">
        <input
          ref={props.mobileSearchRef}
          value={props.search}
          onChange={event => props.onSearch(event.target.value)}
          aria-label="搜索提示词"
          placeholder="搜索提示词…"
          className="w-full px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-violet-400 text-sm"
        />
      </div>
    </header>
  );
});
