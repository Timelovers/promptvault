import type { SortKey } from '../types';

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'hot', label: '热门' },
  { id: 'new', label: '最新' },
  { id: 'used', label: '最多使用' },
];

interface FilterBarProps {
  categories: string[];
  category: string;
  models: string[];
  model: string;
  sort: SortKey;
  onCategory: (category: string) => void;
  onModel: (model: string) => void;
  onSort: (sort: SortKey) => void;
}

export function FilterBar({ categories, category, models, model, sort, onCategory, onModel, onSort }: FilterBarProps) {
  return (
    <div className="sticky-filters bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur py-3 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="flex gap-2 overflow-x-auto scroll-x flex-1">
        {categories.map(item => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => onCategory(item)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm border ${category === item ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-400'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm shrink-0">
        <select
          aria-label="模型"
          value={model}
          onChange={event => onModel(event.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5"
        >
          {models.map(item => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-0.5">
          {SORTS.map(item => (
            <button
              key={item.id}
              type="button"
              aria-pressed={sort === item.id}
              onClick={() => onSort(item.id)}
              className={`px-3 py-1 rounded-full ${sort === item.id ? 'bg-violet-600 text-white' : 'text-slate-500'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
