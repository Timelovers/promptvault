import type { KeyboardEvent } from 'react';
import { authorInitial, currentVersion, formatCount } from '../lib/prompts';
import type { Prompt } from '../types';
import { Highlight } from './Highlight';

interface PromptCardProps {
  prompt: Prompt;
  favorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onCopy: () => void;
}

export function PromptCard({ prompt, favorite, onOpen, onToggleFavorite, onCopy }: PromptCardProps) {
  const version = currentVersion(prompt);
  const shownLikes = prompt.likes + (favorite ? 1 : 0);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      className="break-inside-avoid mb-4 group w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition cursor-pointer overflow-hidden text-left"
    >
      <div className={`h-1.5 bg-gradient-to-r ${prompt.cover}`} />
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            {prompt.category}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{prompt.model}</span>
          {prompt.versions.length > 1 && <span className="text-slate-400">v{prompt.versions.length}</span>}
          <button
            type="button"
            aria-label={favorite ? '取消收藏' : '收藏'}
            aria-pressed={favorite}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
            className={`ml-auto text-base leading-none ${favorite ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'}`}
          >
            {favorite ? '♥' : '♡'}
          </button>
        </div>
        <h3 className="mt-3 font-semibold">{prompt.title}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{prompt.description}</p>
        <pre className="mt-3 text-xs whitespace-pre-wrap break-words font-mono bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 line-clamp-3 text-slate-600 dark:text-slate-300">
          <Highlight text={version.content} />
        </pre>
        <div className="mt-3 flex items-center text-xs text-slate-400 gap-3">
          <span className="flex items-center gap-1.5 min-w-0">
            <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${prompt.cover} text-white grid place-items-center text-[10px] shrink-0`}>
              {authorInitial(prompt.author)}
            </span>
            <span className="truncate">{prompt.author}</span>
          </span>
          <span className="ml-auto shrink-0">♥ {formatCount(shownLikes)}</span>
          <span className="shrink-0">⧉ {formatCount(prompt.uses)}</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCopy();
            }}
            className="card-copy shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 px-2 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          >
            复制
          </button>
        </div>
      </div>
    </div>
  );
}
