import { useEffect, useRef, useState } from 'react';
import { copyText } from '../lib/clipboard';
import {
  authorInitial,
  currentVersion,
  extractVars,
  fillTemplate,
  formatCount,
  formatDate,
  versionsNewestFirst,
} from '../lib/prompts';
import { optimizePrompt, type OptimizedPrompt } from '../services/geminiService';
import type { Prompt, PromptOrigin } from '../types';
import { Highlight } from './Highlight';

interface PromptDrawerProps {
  open: boolean;
  prompt: Prompt | null;
  origin: PromptOrigin;
  favorite: boolean;
  inLibrary: boolean;
  apiKey: string;
  onClose: () => void;
  onToggleFavorite: () => void;
  onAddToLibrary: () => void;
  onOpenLibrary: () => void;
  onChangeVersion: (versionId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onRequestKey: () => void;
  onOptimized: (result: OptimizedPrompt) => void;
  onToast: (message: string) => void;
}

type OptState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; reasoning: string; systemInstruction: string }
  | { status: 'error'; message: string };

function friendlyError(error: unknown, apiKey: string): string {
  const message = error instanceof Error ? error.message : String(error);
  if (apiKey && message.includes(apiKey)) return '优化失败，请检查 API Key 或网络。';
  if (/api key|permission|unauth|401|403/i.test(message)) return 'API Key 无效或没有权限，请在设置中检查。';
  if (/quota|429|resource exhausted/i.test(message)) return '请求过于频繁或额度已用完，请稍后再试。';
  if (/not found|404|model/i.test(message) && /model|not found|invalid/i.test(message)) return '当前模型不可用，请稍后再试。';
  return '优化失败，请稍后再试。';
}

export function PromptDrawer(props: PromptDrawerProps) {
  const [cached, setCached] = useState<Prompt | null>(props.prompt);
  const [values, setValues] = useState<Record<string, string>>({});
  const [opt, setOpt] = useState<OptState>({ status: 'idle' });
  const closeRef = useRef<HTMLButtonElement>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (props.prompt) setCached(props.prompt);
  }, [props.prompt]);

  const prompt = props.open && props.prompt ? props.prompt : cached;

  useEffect(() => {
    setValues({});
    setOpt({ status: 'idle' });
  }, [prompt?.id]);

  useEffect(() => {
    if (props.open) closeRef.current?.focus();
  }, [props.open, prompt?.id]);

  if (!prompt) return null;

  const version = currentVersion(prompt);
  const variables = extractVars(version.content);
  const shownLikes = prompt.likes + (props.favorite ? 1 : 0);
  const timeline = versionsNewestFirst(prompt);

  const copyFilled = async () => {
    const ok = await copyText(fillTemplate(version.content, values));
    props.onToast(ok ? '已复制填好的提示词' : '复制失败，请手动选择文本');
  };

  const optimize = async () => {
    if (!props.apiKey.trim()) {
      props.onRequestKey();
      return;
    }
    setOpt({ status: 'loading' });
    try {
      const result = await optimizePrompt(version.content, props.apiKey);
      props.onOptimized(result);
      if (alive.current) {
        setOpt({
          status: 'done',
          reasoning: result.reasoning,
          systemInstruction: result.systemInstruction,
        });
      }
    } catch (error) {
      if (alive.current) setOpt({ status: 'error', message: friendlyError(error, props.apiKey) });
    }
  };

  const visible = props.open && Boolean(props.prompt);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={props.onClose}
      />
      <aside
        role="dialog"
        aria-modal={visible}
        aria-hidden={!visible}
        aria-labelledby="drawer-title"
        className={`fixed z-50 bg-white dark:bg-slate-900 shadow-2xl right-0 top-0 h-full w-full sm:w-[560px] transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="关闭"
          onClick={props.onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/20 text-white hover:bg-black/40"
        >
          ✕
        </button>
        <div className="h-full overflow-y-auto">
          <div className={`h-28 bg-gradient-to-br ${prompt.cover}`} />
          <div className="px-6 -mt-8 pb-10">
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-2 text-xs items-center">
                <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">{prompt.category}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">适用：{prompt.model}</span>
                {prompt.tags.map(tag => (
                  <span key={tag} className="text-slate-400">#{tag}</span>
                ))}
              </div>
              <h2 id="drawer-title" className="text-xl font-bold mt-3">{prompt.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{prompt.description}</p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${prompt.cover} text-white grid place-items-center shrink-0`}>
                  {authorInitial(prompt.author)}
                </span>
                <div>
                  <div className="font-medium">{prompt.author}</div>
                  <div className="text-xs text-slate-400">
                    ♥ {formatCount(shownLikes)} · {formatCount(prompt.uses)} 次使用 · 更新于 {formatDate(version.timestamp)}
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                <button type="button" onClick={copyFilled} className="py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700">
                  复制
                </button>
                <button
                  type="button"
                  onClick={props.onToggleFavorite}
                  className={`py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 ${props.favorite ? 'text-rose-500' : ''}`}
                >
                  {props.favorite ? '♥ 已收藏' : '♡ 收藏'}
                </button>
                {props.origin === 'library' ? (
                  <button type="button" onClick={props.onEdit} className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    编辑
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={props.onAddToLibrary}
                    className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    {props.inLibrary ? '✓ 已在我的库' : '+ 加入我的库'}
                  </button>
                )}
              </div>
              {props.origin === 'square' && props.inLibrary && (
                <button type="button" onClick={props.onOpenLibrary} className="mt-3 text-xs text-violet-600 hover:underline">
                  在我的库中编辑
                </button>
              )}
            </div>

            {variables.length > 0 && (
              <>
                <h4 className="mt-6 font-semibold text-sm">① 填写变量</h4>
                <div className="mt-2 grid sm:grid-cols-2 gap-3">
                  {variables.map(name => (
                    <label key={name} className="text-xs text-slate-500 block">
                      {name}
                      <input
                        value={values[name] ?? ''}
                        onChange={event => setValues(current => ({ ...current, [name]: event.target.value }))}
                        placeholder={`输入${name}`}
                        className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-violet-400"
                      />
                    </label>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6 flex items-center">
              <h4 className="font-semibold text-sm">② 实时预览</h4>
              <button
                type="button"
                onClick={optimize}
                disabled={opt.status === 'loading'}
                className="ml-auto text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white disabled:opacity-60"
              >
                {opt.status === 'loading' ? '优化中…' : '✨ AI 优化'}
              </button>
            </div>
            <pre className="mt-2 text-sm whitespace-pre-wrap break-words font-mono bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 leading-relaxed">
              <Highlight text={version.content} values={values} />
            </pre>
            {opt.status === 'loading' && <div className="mt-3 h-20 rounded-xl shimmer" />}
            {opt.status === 'done' && (
              <div className="mt-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/60 dark:bg-violet-500/10 p-4 text-sm">
                <div className="font-medium text-violet-700 dark:text-violet-300">已另存为新版本</div>
                {opt.reasoning && <p className="mt-2 text-slate-600 dark:text-slate-300">{opt.reasoning}</p>}
                {opt.systemInstruction && (
                  <details className="mt-2">
                    <summary className="text-xs text-slate-400 cursor-pointer">查看建议的系统设定</summary>
                    <p className="mt-1 text-xs whitespace-pre-wrap text-slate-600 dark:text-slate-300">{opt.systemInstruction}</p>
                  </details>
                )}
              </div>
            )}
            {opt.status === 'error' && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 p-4 text-sm">
                {opt.message}
              </div>
            )}
            <p className="mt-2 text-xs text-slate-400">
              AI 优化需在
              <button type="button" onClick={props.onRequestKey} className="mx-1 underline underline-offset-2 hover:text-violet-600">设置</button>
              中配置自己的 API Key（仅保存在本机浏览器）。
            </p>

            <h4 className="mt-6 font-semibold text-sm">③ 版本时间线</h4>
            <ol className="mt-3 border-l-2 border-violet-200 dark:border-violet-900 ml-2 space-y-4">
              {timeline.map(item => {
                const active = item.id === prompt.currentVersionId;
                return (
                  <li key={item.id} className="pl-4 relative">
                    <span className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ${active ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    <button type="button" onClick={() => props.onChangeVersion(item.id)} className="block w-full text-left">
                      <span className="text-sm font-medium">v{item.versionNumber}</span>
                      {active && <span className="text-xs text-violet-600 ml-1">当前</span>}
                      <span className="block text-xs text-slate-400 font-normal mt-0.5 break-words">
                        {formatDate(item.timestamp)}{item.notes ? ` · ${item.notes}` : ''}
                      </span>
                    </button>
                    <details className="mt-1">
                      <summary className="text-xs text-slate-400 cursor-pointer">查看内容</summary>
                      <pre className="mt-1 text-xs whitespace-pre-wrap break-words font-mono bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2">
                        <Highlight text={item.content} />
                      </pre>
                    </details>
                  </li>
                );
              })}
            </ol>

            {props.origin === 'library' && (
              <button type="button" onClick={props.onDelete} className="mt-8 text-xs text-slate-400 hover:text-rose-500">
                删除这条提示词
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
