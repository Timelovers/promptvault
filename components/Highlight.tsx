import type { ReactNode } from 'react';

export function Highlight({ text, values }: { text: string; values?: Record<string, string> }) {
  const parts: ReactNode[] = [];
  const pattern = /\{\{(.+?)\}\}/g;
  let last = 0;
  let index = 0;

  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    const name = match[1];
    const value = values?.[name];
    if (value) {
      parts.push(
        <span key={index} className="rounded px-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
          {value}
        </span>,
      );
    } else {
      parts.push(
        <span key={index} className="var">
          {`{{${name}}}`}
        </span>,
      );
    }
    index += 1;
    last = start + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
