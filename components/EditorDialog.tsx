import { useState, type FormEvent } from 'react';
import { categoryChoices, createId, currentVersion, modelChoices, safeCover } from '../lib/prompts';
import type { Prompt } from '../types';

interface EditorDialogProps {
  mode: 'create' | 'edit';
  initial?: Prompt;
  extraCategories: string[];
  extraModels: string[];
  onCancel: () => void;
  onSave: (prompt: Prompt) => void;
}

export function EditorDialog({ mode, initial, extraCategories, extraModels, onCancel, onSave }: EditorDialogProps) {
  const categories = categoryChoices([...(initial ? [initial.category] : []), ...extraCategories]);
  const models = modelChoices([...(initial ? [initial.model] : []), ...extraModels]);
  const existing = initial ? currentVersion(initial) : undefined;
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? categories[0]);
  const [model, setModel] = useState(initial?.model ?? models[0]);
  const [tags, setTags] = useState(initial?.tags.join('，') ?? '');
  const [author, setAuthor] = useState(initial?.author ?? '我');
  const [content, setContent] = useState(existing?.content ?? '');
  const [note, setNote] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextContent = content.trim();
    if (!nextTitle || !nextContent) return;
    const nextTags = tags.split(/[,，]/).map(tag => tag.trim()).filter(Boolean);
    const nextAuthor = author.trim() || '我';

    if (!initial) {
      const versionId = createId('ver');
      const now = Date.now();
      onSave({
        id: createId('user'),
        title: nextTitle,
        description: description.trim(),
        category,
        model,
        tags: nextTags,
        author: nextAuthor,
        likes: 0,
        uses: 0,
        isFavorite: false,
        cover: safeCover(undefined, category),
        createdAt: now,
        updatedAt: now,
        currentVersionId: versionId,
        versions: [{
          id: versionId,
          versionNumber: 1,
          content: nextContent,
          notes: note.trim() || '新创建的提示词',
          timestamp: now,
        }],
      });
      return;
    }

    let versions = initial.versions.map(version => ({ ...version }));
    let currentVersionId = initial.currentVersionId;
    if (nextContent !== (existing?.content ?? '').trim()) {
      const versionId = createId('ver');
      const versionNumber = Math.max(...versions.map(version => version.versionNumber)) + 1;
      versions = [...versions, {
        id: versionId,
        versionNumber,
        content: nextContent,
        notes: note.trim() || '手动编辑',
        timestamp: Date.now(),
      }];
      currentVersionId = versionId;
    }

    onSave({
      ...initial,
      title: nextTitle,
      description: description.trim(),
      category,
      model,
      tags: nextTags,
      author: nextAuthor,
      cover: initial.sourceId ? initial.cover : safeCover(undefined, category),
      versions,
      currentVersionId,
      updatedAt: Date.now(),
      featured: undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" />
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
        className="relative w-full max-w-2xl max-h-[min(90vh,860px)] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="editor-title" className="text-lg font-bold">{mode === 'create' ? '新建提示词' : '编辑提示词'}</h2>
          <button type="button" aria-label="关闭" onClick={onCancel} className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        <div className="mt-5 space-y-4">
          <label className="block text-xs text-slate-500">
            标题
            <input required value={title} onChange={event => setTitle(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-violet-400" placeholder="给这条提示词起个名字" />
          </label>
          <label className="block text-xs text-slate-500">
            描述
            <input value={description} onChange={event => setDescription(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-violet-400" placeholder="一句话说明它解决什么问题" />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-xs text-slate-500">
              分类
              <select value={category} onChange={event => setCategory(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
                {categories.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-xs text-slate-500">
              适用模型
              <select value={model} onChange={event => setModel(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
                {models.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-xs text-slate-500">
              标签（用逗号分隔）
              <input value={tags} onChange={event => setTags(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-violet-400" placeholder="周报，职场" />
            </label>
            <label className="block text-xs text-slate-500">
              作者
              <input value={author} onChange={event => setAuthor(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-violet-400" />
            </label>
          </div>
          <label className="block text-xs text-slate-500">
            提示词正文
            <textarea required rows={8} value={content} onChange={event => setContent(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-mono outline-none focus:ring-2 focus:ring-violet-400" placeholder={'用 {{变量}} 标出需要填写的地方'} />
          </label>
          <p className="text-xs text-slate-400 -mt-2">修改正文会保存为新版本，旧版本仍留在时间线里。</p>
          <label className="block text-xs text-slate-500">
            版本备注
            <input value={note} onChange={event => setNote(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-violet-400" placeholder="只在正文变化时写入时间线" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-full text-sm hover:bg-slate-100 dark:hover:bg-slate-800">取消</button>
          <button type="submit" className="px-4 py-2 rounded-full text-sm bg-violet-600 hover:bg-violet-700 text-white">保存</button>
        </div>
      </form>
    </div>
  );
}
