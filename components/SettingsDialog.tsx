import { useState } from 'react';
import { GEMINI_MODEL } from '../services/geminiService';

interface SettingsDialogProps {
  apiKey: string;
  hint?: string | null;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  onExport: () => void;
  onImport: () => void;
}

export function SettingsDialog({ apiKey, hint, onClose, onSaveKey, onExport, onImport }: SettingsDialogProps) {
  const [draft, setDraft] = useState(apiKey);
  const [visible, setVisible] = useState(false);

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="settings-title" className="text-lg font-bold">设置</h2>
          <button type="button" aria-label="关闭" onClick={onClose} className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        {hint && <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">{hint}</p>}
        <label className="block mt-4 text-xs text-slate-500">
          Gemini API Key
          <div className="mt-1 flex gap-2">
            <input
              value={draft}
              onChange={event => setDraft(event.target.value)}
              type={visible ? 'text' : 'password'}
              autoComplete="off"
              spellCheck={false}
              placeholder="粘贴你的 API Key"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button type="button" onClick={() => setVisible(value => !value)} className="px-3 rounded-lg text-xs bg-slate-100 dark:bg-slate-800">
              {visible ? '隐藏' : '显示'}
            </button>
          </div>
        </label>
        <p className="mt-2 text-xs text-slate-400">密钥仅保存在本机浏览器，不会上传到服务器。</p>
        <p className="mt-1 text-xs text-slate-400">调用模型 {GEMINI_MODEL}，请求从这台浏览器直接发往 Google。</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => onSaveKey(draft)} className="px-4 py-2 rounded-full text-sm bg-violet-600 hover:bg-violet-700 text-white">
            保存
          </button>
          <button type="button" onClick={() => { setDraft(''); onSaveKey(''); }} className="px-4 py-2 rounded-full text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
            清除
          </button>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-medium">我的库</h3>
          <p className="mt-1 text-xs text-slate-400">导出文件只包含提示词，不含 API Key。</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={onExport} className="px-4 py-2 rounded-full text-sm border border-slate-200 dark:border-slate-700">导出</button>
            <button type="button" onClick={onImport} className="px-4 py-2 rounded-full text-sm border border-slate-200 dark:border-slate-700">导入</button>
          </div>
        </div>
      </div>
    </div>
  );
}
