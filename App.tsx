
import React, { useState, useEffect, useMemo } from 'react';
import { Prompt, PromptVersion, ViewState } from './types';
import { INITIAL_PROMPTS, CATEGORIES, DISCOVERY_RESOURCES } from './constants';
import { Plus, Search, Sparkles, ChevronLeft, Copy, Check, Import, Export, ExternalLink, Heart, Clock, User, Bookmark, MessageSquare, Zap, ShieldCheck, ArrowDown, History, Trash } from './components/Icon';
import { optimizePrompt } from './services/geminiService';

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const saved = localStorage.getItem('prompt_vault_data');
    return saved ? JSON.parse(saved) : INITIAL_PROMPTS;
  });
  const [view, setView] = useState<ViewState>('LANDING');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('prompt_vault_data', JSON.stringify(prompts));
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                            p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [prompts, search, activeCategory]);

  const handleAddPrompt = (newPrompt: Prompt) => {
    setPrompts([newPrompt, ...prompts]);
    setView('GALLERY');
  };

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrompts(prompts.map(p => {
      if (p.id === id) {
        const currentLikes = p.likes || 0;
        return { ...p, likes: currentLikes + 1 };
      }
      return p;
    }));
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrompts(prompts.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  const handleDeletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个提示词吗？')) {
      setPrompts(prompts.filter(p => p.id !== id));
      if (selectedId === id) {
        setView('GALLERY');
        setSelectedId(null);
      }
    }
  };

  const selectedPrompt = useMemo(() => 
    prompts.find(p => p.id === selectedId) || null
  , [prompts, selectedId]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 selection:bg-indigo-100">
      {/* Navbar - Only visible after landing or in specific states */}
      {view !== 'LANDING' && (
        <nav className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('LANDING')}>
            <div className="w-8 h-8 bg-black rounded rotate-45 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm -rotate-45"></div>
            </div>
            <span className="font-bold text-lg tracking-tight">提示词库</span>
          </div>

          <div className="flex-1 max-w-lg mx-12 relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索提示词"
              className="w-full bg-[#F3F4F6] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-slate-200 outline-none transition-all placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-all border border-slate-100 hidden sm:flex">
              博客
            </button>
            <button 
              onClick={() => setView('CREATE')}
              className="bg-[#0F172A] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              新建提示词
            </button>
          </div>
        </nav>
      )}

      {view === 'LANDING' && (
        <section className="relative h-screen bg-white bg-grid overflow-hidden flex flex-col items-center justify-center animate-in fade-in duration-700">
          {/* Landing Header (Minimal) */}
          <div className="absolute top-0 inset-x-0 h-20 px-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded rotate-45 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm -rotate-45"></div>
              </div>
              <span className="font-bold text-sm tracking-tighter uppercase">PromptVault</span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-400">
              <button className="hover:text-slate-900 transition-colors">Blog</button>
              <button onClick={() => setView('GALLERY')} className="bg-black text-white px-4 py-1.5 rounded-full hover:bg-slate-800 transition-all">Sign up to Waitlist</button>
            </div>
          </div>

          {/* Background Doodles */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-20 h-64 select-none">
            <div className="flex justify-around items-end h-full px-10">
              <div className="w-24 h-48 bg-purple-200 rounded-full blur-3xl -rotate-12 translate-y-10"></div>
              <div className="w-32 h-64 bg-blue-200 rounded-full blur-3xl translate-y-20"></div>
              <div className="w-40 h-56 bg-orange-200 rounded-full blur-3xl rotate-12 translate-y-10"></div>
              <div className="w-28 h-60 bg-green-200 rounded-full blur-3xl -translate-y-10"></div>
              <div className="w-36 h-44 bg-pink-200 rounded-full blur-3xl translate-y-20"></div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center z-10 space-y-8 px-6">
            <div className="space-y-4">
              <p className="font-mono text-slate-400 italic text-lg tracking-widest">Listen!</p>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
                你的 AI 正在对话。<br />你在倾听吗？
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                你的创作灵感都在提示词里。构建一个专属于你的 AI 知识库 —— 由 PromptVault 提供动力。
              </p>
            </div>

            {/* Floating Menu Card */}
            <div className="relative mx-auto max-w-sm mt-12 bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 space-y-4 animate-in slide-in-from-bottom-8 duration-1000">
              <div onClick={() => setView('GALLERY')} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-800 text-sm">发现灵感</h4>
                  <p className="text-xs text-slate-400">分享你的想法与见解</p>
                </div>
              </div>
              
              <div onClick={() => setView('GALLERY')} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-800 text-sm">优化进化</h4>
                  <p className="text-xs text-slate-400">帮助我们改进你的创作</p>
                </div>
              </div>

              <div onClick={() => setView('GALLERY')} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-800 text-sm">私人收藏</h4>
                  <p className="text-xs text-slate-400">将你的心意与我们分享</p>
                </div>
              </div>

              <div onClick={() => setView('GALLERY')} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-800 text-sm">评价反馈</h4>
                  <p className="text-xs text-slate-400">评价你的交互体验质量</p>
                </div>
              </div>
            </div>

            <div className="pt-10 flex flex-col items-center gap-4">
              <button 
                onClick={() => setView('GALLERY')}
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 animate-bounce"
              >
                <ArrowDown className="w-6 h-6" />
              </button>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">进入我的提示词库</span>
            </div>
          </div>
        </section>
      )}

      {view !== 'LANDING' && (
        <main className="max-w-7xl mx-auto px-8 py-10 animate-in fade-in duration-500">
          {view === 'GALLERY' && (
            <div className="space-y-16">
              <section className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">我的提示词</h2>
                    <p className="text-slate-500 font-medium text-lg">长期积累与灵感进化</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => setActiveCategory(null)}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!activeCategory ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-600/10' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                    >
                      全部
                    </button>
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-600/10' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative group max-w-2xl">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="在你的知识库中检索..."
                    className="w-full bg-white border border-slate-100 rounded-3xl pl-14 pr-6 py-5 text-lg focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredPrompts.map(prompt => (
                    <PromptCard 
                      key={prompt.id} 
                      prompt={prompt} 
                      onSelect={() => { setSelectedId(prompt.id); setView('DETAIL'); }}
                      onLike={(e) => handleToggleLike(prompt.id, e)}
                      onFavorite={(e) => handleToggleFavorite(prompt.id, e)}
                      onDelete={(e) => handleDeletePrompt(prompt.id, e)}
                    />
                  ))}
                  {filteredPrompts.length === 0 && (
                    <div className="col-span-full py-32 text-center text-slate-400 bg-white rounded-[3rem] border border-dashed border-slate-200">
                      <p className="text-xl font-bold mb-2">空空如也</p>
                      <p className="text-sm">没有找到匹配的提示词，试试其他关键词吧。</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="pt-20 pb-20 border-t border-slate-100 space-y-12">
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">发现优质资源</h2>
                  <p className="text-slate-400 font-medium">扩展你的 Prompt 知识边界</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {DISCOVERY_RESOURCES.map((res, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                      <div className={`w-14 h-14 ${res.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner`}>
                        {res.icon}
                      </div>
                      <div className="mb-4">
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{res.title}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{res.subtitle}</p>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1 line-clamp-3">{res.desc}</p>
                      <button className="w-full py-3 text-sm font-bold text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                        <ExternalLink className="w-4 h-4" /> {res.linkText}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {view === 'CREATE' && (
            <PromptEditor onSave={handleAddPrompt} onCancel={() => setView('GALLERY')} />
          )}

          {view === 'DETAIL' && selectedPrompt && (
            <PromptDetail 
              prompt={selectedPrompt} 
              onBack={() => setView('GALLERY')} 
              onUpdate={(p) => setPrompts(prompts.map(pr => pr.id === p.id ? p : pr))}
            />
          )}
        </main>
      )}
    </div>
  );
};

// --- Subcomponents ---

const PromptCard: React.FC<{ 
  prompt: Prompt, 
  onSelect: () => void,
  onLike: (e: React.MouseEvent) => void,
  onFavorite: (e: React.MouseEvent) => void,
  onDelete: (e: React.MouseEvent) => void
}> = ({ prompt, onSelect, onLike, onFavorite, onDelete }) => {
  const currentVersion = prompt.versions[0];
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentVersion.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeAgo = useMemo(() => {
    const diff = Date.now() - prompt.createdAt;
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    if (months > 0) return `${months}个月前`;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? '今天' : `${days}天前`;
  }, [prompt.createdAt]);

  return (
    <div 
      onClick={onSelect}
      className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full cursor-pointer overflow-hidden border-t-4 border-t-transparent hover:border-t-indigo-500"
    >
      <div className="flex flex-col h-full gap-5">
        <div>
          <span className="px-5 py-2 bg-[#F3F4F6] text-slate-500 text-xs font-bold rounded-full uppercase tracking-widest">
            {prompt.category}
          </span>
        </div>

        <h3 className="text-3xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
          {prompt.title}
        </h3>

        <div className="flex items-center gap-6 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-bold text-slate-700">{prompt.author || '阿德民'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{timeAgo}</span>
          </div>
        </div>

        <div className="relative bg-[#F9FAFB] rounded-3xl p-8 mt-2 overflow-hidden max-h-48 min-h-[180px]">
          <div className="text-slate-600 font-mono text-base leading-relaxed break-words whitespace-pre-wrap">
            {currentVersion.content}
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50 text-slate-500 font-bold">
          <button 
            onClick={onLike}
            className="flex items-center gap-2 hover:text-red-500 transition-colors p-3 hover:bg-red-50 rounded-2xl"
          >
            <Heart className={`w-6 h-6 ${prompt.likes ? 'text-red-400 fill-red-400' : ''}`} />
            <span className="text-xl">{prompt.likes || 0}</span>
          </button>
          
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 hover:text-indigo-600 transition-colors p-3 hover:bg-indigo-50 rounded-2xl"
          >
            {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
            <span className="text-xl">{copied ? '已复制' : '复制'}</span>
          </button>

          <button 
            onClick={onFavorite}
            className="flex items-center gap-2 hover:text-yellow-600 transition-colors p-3 hover:bg-yellow-50 rounded-2xl"
          >
            <Bookmark className={`w-6 h-6 ${prompt.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} />
            <span className="text-xl">收藏</span>
          </button>

          <button 
            onClick={onDelete}
            className="flex items-center gap-2 hover:text-red-600 transition-colors p-3 hover:bg-red-50 rounded-2xl"
          >
            <Trash className="w-6 h-6" />
            <span className="text-xl">删除</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const PromptEditor: React.FC<{ onSave: (p: Prompt) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    description: '',
    content: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const versionId = `v1-${Date.now()}`;
    const newPrompt: Prompt = {
      id: `p-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      author: '我',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentVersionId: versionId,
      likes: 0,
      isFavorite: false,
      versions: [{
        id: versionId,
        versionNumber: 1,
        content: formData.content,
        notes: '新创建的提示词',
        timestamp: Date.now()
      }]
    };
    onSave(newPrompt);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden p-12 space-y-10 animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">新建提示词</h2>
        <button onClick={onCancel} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">标题</label>
            <input required className="w-full px-6 py-4 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-lg shadow-sm" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="输入一个吸引人的标题" />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">分类</label>
            <select className="w-full px-6 py-4 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-slate-100 outline-none transition-all bg-white text-lg shadow-sm" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">标签 (英文逗号分隔)</label>
          <input className="w-full px-6 py-4 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-lg shadow-sm" placeholder="e.g. chatgpt, coding, creative" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">详细内容</label>
          <textarea required rows={8} className="w-full px-6 py-5 rounded-3xl border border-slate-100 focus:ring-4 focus:ring-slate-100 outline-none transition-all font-mono text-lg shadow-sm" placeholder="在这里输入你的 Prompt..." value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
        </div>
        <div className="flex gap-6 pt-6">
          <button type="submit" className="flex-1 bg-black text-white py-5 rounded-3xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl active:scale-95">提交保存</button>
          <button type="button" onClick={onCancel} className="px-10 py-5 bg-slate-50 text-slate-500 rounded-3xl font-bold text-lg hover:bg-slate-100 transition-all">放弃修改</button>
        </div>
      </form>
    </div>
  );
};

const PromptDetail: React.FC<{ prompt: Prompt, onBack: () => void, onUpdate: (p: Prompt) => void }> = ({ prompt, onBack, onUpdate }) => {
  const currentVersion = prompt.versions.find(v => v.id === prompt.currentVersionId) || prompt.versions[0];
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentVersion.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const result = await optimizePrompt(currentVersion.content);
      const newVersion: PromptVersion = {
        id: `v${prompt.versions.length + 1}-${Date.now()}`,
        versionNumber: prompt.versions.length + 1,
        content: result.optimizedContent,
        systemInstruction: result.systemInstruction,
        notes: `AI 智能演化版本`,
        timestamp: Date.now()
      };
      onUpdate({ ...prompt, currentVersionId: newVersion.id, versions: [newVersion, ...prompt.versions], updatedAt: Date.now() });
    } catch (e) {
      console.error(e);
      alert("优化失败，请检查 API 配置");
    } finally { setIsOptimizing(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="flex items-start gap-8">
          <button onClick={onBack} className="mt-1 p-4 bg-white border border-slate-100 rounded-[1.5rem] hover:bg-slate-50 transition-all shadow-sm">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{prompt.title}</h2>
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-widest">{prompt.category}</span>
            </div>
            <div className="flex items-center gap-6 text-slate-400 text-base">
              <div className="flex items-center gap-2 font-bold text-slate-600"><User className="w-5 h-5" /> <span>{prompt.author || '阿德民'}</span></div>
              <div className="flex items-center gap-2 font-bold"><Clock className="w-5 h-5" /> <span>版本 V{currentVersion.versionNumber}</span></div>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={handleCopy} className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-3xl text-lg font-bold hover:bg-slate-50 transition-all shadow-sm">
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            {copied ? '已复制' : '复制正文'}
          </button>
          <button onClick={handleOptimize} disabled={isOptimizing} className="flex items-center gap-4 px-10 py-4 bg-black text-white rounded-3xl text-lg font-bold hover:bg-slate-800 transition-all shadow-2xl disabled:opacity-50">
            <Sparkles className={`w-5 h-5 ${isOptimizing ? 'animate-spin' : ''}`} />
            {isOptimizing ? 'AI 进化中...' : '一键 AI 进化'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-sm min-h-[600px] border-l-[12px] border-l-slate-50">
            <div className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
               <span>PROMPT CONTENT</span>
               <div className="h-px flex-1 bg-slate-50"></div>
            </div>
            <div className="text-slate-800 font-mono text-xl leading-relaxed whitespace-pre-wrap selection:bg-indigo-100">
              {currentVersion.content}
            </div>
          </div>
        </div>
        
        <div className="space-y-10">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
               <History className="w-4 h-4" /> 演化历史
            </h4>
            <div className="space-y-6">
              {prompt.versions.map((v, i) => (
                <div 
                  key={v.id} 
                  className={`flex items-center justify-between text-sm group cursor-pointer p-4 rounded-2xl transition-all ${prompt.currentVersionId === v.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`} 
                  onClick={() => onUpdate({ ...prompt, currentVersionId: v.id })}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${prompt.currentVersionId === v.id ? 'bg-indigo-500 shadow-[0_0_0_6px_rgba(99,102,241,0.1)]' : 'bg-slate-200'}`}></div>
                    <span className={`font-black text-lg ${prompt.currentVersionId === v.id ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>V{v.versionNumber}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300">{new Date(v.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">当前备注</h4>
             <p className="text-slate-600 font-medium leading-relaxed italic">"{currentVersion.notes}"</p>
          </div>

          <div className="flex flex-wrap gap-2 px-2">
            {prompt.tags.map(t => (
              <span key={t} className="px-5 py-2 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest shadow-sm">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
