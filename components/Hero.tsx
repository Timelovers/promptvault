import { formatCount } from '../lib/prompts';
import type { Prompt } from '../types';

export function Hero({ prompts, onOpen }: { prompts: Prompt[]; onOpen: (id: string) => void }) {
  const featured = prompts.filter(prompt => prompt.featured);

  return (
    <section className="py-8 sm:py-10">
      <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
        发现好用的提示词，
        <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">一键填空、复制、收进你的库</span>
      </h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm sm:text-base">
        精选写作、编程、学习、产品、绘图等场景模板。变量用 <span className="var">{'{{变量}}'}</span> 标出，填好即可用。
      </p>
      {featured.length > 0 && (
        <div className="mt-6 flex md:grid md:grid-cols-3 gap-4 overflow-x-auto scroll-x snap-x">
          {featured.map(prompt => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => onOpen(prompt.id)}
              className={`shrink-0 w-[80%] md:w-auto snap-start text-left cursor-pointer rounded-2xl p-5 text-white bg-gradient-to-br ${prompt.cover} hover:scale-[1.01] transition shadow-lg`}
            >
              <div className="text-xs opacity-80">✦ 本周精选 · {prompt.category}</div>
              <div className="mt-2 text-lg font-semibold">{prompt.title}</div>
              <div className="text-sm opacity-90 mt-1">{prompt.description}</div>
              <div className="mt-4 text-xs opacity-80">
                @{prompt.author} · ♥ {formatCount(prompt.likes)} · {formatCount(prompt.uses)} 次使用
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
