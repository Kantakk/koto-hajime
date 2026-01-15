import {
  Briefcase,
  CheckCircle,
  Code,
  Heart,
  Home,
  Lightbulb,
  MessageSquare,
  Palette,
  PlusCircle,
  Search,
  Star,
  Tag,
  Trash2,
  User,
  Users,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
// Supabaseクライアントをインポート
import { supabase } from "./supabaseClient";

/* ====== 定数 ====== */
const TITLE_LIMIT = 40;
const CONTENT_LIMIT = 500;
const PREVIEW_LIMIT = 120;
const CONTRIBUTION_LIMIT = 300;
const USER_KEY = "kht-user-v1";
const MODE_KEY = "kotohajime-mode";

const CATEGORIES = [
  { id: "ai", label: "AI", color: "bg-blue-100 text-blue-700" },
  { id: "food", label: "フードテック", color: "bg-green-100 text-green-700" },
  { id: "metaverse", label: "メタバース", color: "bg-purple-100 text-purple-700" },
  { id: "health", label: "ヘルスケア", color: "bg-red-100 text-red-700" },
  { id: "edu", label: "教育", color: "bg-yellow-100 text-yellow-700" },
  { id: "entertainment", label: "エンタメ", color: "bg-pink-100 text-pink-700" },
  { id: "business", label: "ビジネス", color: "bg-indigo-100 text-indigo-700" },
  { id: "other", label: "その他", color: "bg-gray-100 text-gray-700" }
];

const truncateText = (text, limit) =>
  text && text.length <= limit ? text : (text || "").slice(0, limit) + "…";

const formatISODate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

/* ===== UIパーツ ===== */
const ContributionBadge = ({ type }) => {
  const badges = {
    tech: { icon: <Code size={12} />, label: "技術", color: "bg-blue-100 text-blue-700" },
    design: { icon: <Palette size={12} />, label: "デザイン", color: "bg-purple-100 text-purple-700" },
    business: { icon: <Briefcase size={12} />, label: "ビジネス", color: "bg-green-100 text-green-700" }
  };
  const badge = badges[type] || badges.tech;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>
      {badge.icon} {badge.label}
    </span>
  );
};

const CategoryBadge = ({ categoryId }) => {
  const cat = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${cat.color}`}>
      <Tag size={12} /> {cat.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const statuses = {
    draft: { label: "📝 投稿中", color: "bg-gray-100 text-gray-700" },
    open: { label: "🌱 成長中", color: "bg-yellow-100 text-yellow-700" },
    verified: { label: "✅ 検証済み", color: "bg-green-100 text-green-700" },
    interest: { label: "🏢 企業関心あり", color: "bg-indigo-100 text-indigo-700" },
    realized: { label: "🎉 実現", color: "bg-pink-100 text-pink-700" }
  };
  const s = statuses[status] || statuses.draft;
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.color}`}>{s.label}</span>;
};

/* ====== 貢献モーダル ====== */
const ContributionModal = ({ isOpen, onClose, onSubmit, ideaTitle }) => {
  const [type, setType] = useState("tech");
  const [content, setContent] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({ type, content });
    setContent("");
    setType("tech");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">貢献を追加</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="text-sm text-slate-600 mb-4">
          「{truncateText(ideaTitle || "", 30)}」への貢献
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-2 block">貢献タイプ</label>
            <div className="flex gap-2">
              {['tech', 'design', 'business'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border-2 ${type === t ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"}`}
                >
                  {t === 'tech' && <Code size={16} className="inline mr-1" />}
                  {t === 'design' && <Palette size={16} className="inline mr-1" />}
                  {t === 'business' && <Briefcase size={16} className="inline mr-1" />}
                  {t === 'tech' ? '技術' : t === 'design' ? 'デザイン' : 'ビジネス'}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={CONTRIBUTION_LIMIT}
            rows={4}
            className="w-full p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            placeholder="具体的な提案や改善案を入力してください..."
          />
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold disabled:opacity-50"
          >
            貢献を送信
          </button>
        </div>
      </div>
    </div>
  );
};

/* ====== IdeaCard ====== */
const IdeaCard = ({ idea, currentUser, onLike, onFavorite, onDelete, onContribute, mode }) => {
  const [expanded, setExpanded] = useState(false);
  const [showContributions, setShowContributions] = useState(false);
  
  const userLikeCount = (idea.likes?.userLikes && currentUser?.id && idea.likes.userLikes[currentUser.id]) || 0;
  const remaining = 3 - userLikeCount;
  const isOwner = currentUser && idea.author_id && currentUser.id === idea.author_id;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 transition-colors hover:border-indigo-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={idea.status} />
          {idea.categories && idea.categories.length > 0 && <CategoryBadge categoryId={idea.categories[0]} />}
          {idea.verified && <CheckCircle size={16} className="text-green-500" />}
        </div>
        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
          {idea.likes?.count ?? 0} 応援
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <User size={14} />
        <div>
          <div className="font-bold text-slate-700">{idea.author}</div>
          <div className="text-[11px]">{formatISODate(idea.created_at)}</div>
        </div>
      </div>

      <h3 className="font-bold text-slate-900 mb-1">{idea.title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-3">
        {expanded ? idea.content : truncateText(idea.content, PREVIEW_LIMIT)}
      </p>

      {idea.content?.length > PREVIEW_LIMIT && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-500 hover:underline mb-3 block">
          {expanded ? "閉じる" : "続きを読む"}
        </button>
      )}

      {idea.contributions && idea.contributions.length > 0 && (
        <div className="mb-3">
          <button onClick={() => setShowContributions(!showContributions)} className="w-full p-3 bg-slate-50 rounded-lg text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Users size={14} /> 貢献者 {idea.contributions.length}名
              </span>
              <span className="text-xs text-slate-400">{showContributions ? "閉じる" : "詳細"}</span>
            </div>
          </button>
          {showContributions && (
            <div className="mt-2 space-y-2">
              {idea.contributions.map((c, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-slate-700">{c.user}</span>
                    <ContributionBadge type={c.type} />
                  </div>
                  <p className="text-slate-600">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {mode === 'creator' ? (
          <>
            <button
              onClick={() => onLike(idea)}
              className={`flex-1 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${remaining <= 0 ? "opacity-50" : "hover:bg-rose-50 hover:text-rose-500"}`}
              disabled={remaining <= 0}
            >
              <Heart size={16} fill={userLikeCount > 0 ? "currentColor" : "none"} /> 応援 {userLikeCount > 0 ? `(${userLikeCount})` : ""}
            </button>
            <button
              onClick={() => onContribute(idea)}
              className="flex-1 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-500"
            >
              <MessageSquare size={16} /> 貢献する
            </button>
          </>
        ) : (
          <>
            <button className="flex-1 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all active:scale-95">
              <Briefcase size={16} /> 興味あり
            </button>
            <button
              onClick={() => onFavorite(idea.id)}
              className={`py-2 px-4 rounded-xl border-2 ${idea.favorited ? "border-yellow-400 bg-yellow-50 text-yellow-600" : "border-slate-200 bg-white text-slate-400"} transition-all active:scale-95`}
            >
              <Star size={16} fill={idea.favorited ? "currentColor" : "none"} />
            </button>
          </>
        )}
      </div>

      {isOwner && (
        <div className="mt-3 text-right">
          <button onClick={() => onDelete(idea.id)} className="text-xs text-rose-600 hover:underline flex items-center gap-1 ml-auto">
            <Trash2 size={14} /> 削除
          </button>
        </div>
      )}
    </div>
  );
};

/* ====== App ====== */
const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sortMode, setSortMode] = useState("new");
  const [ideas, setIdeas] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [mode, setMode] = useState("creator");
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategories, setFilterCategories] = useState([]);
  const [contributionModal, setContributionModal] = useState({ isOpen: false, idea: null });

  /* ユーザー初期化 */
  useEffect(() => {
    let u = localStorage.getItem(USER_KEY);
    if (!u) {
      const user = { id: crypto.randomUUID(), name: "あなた" };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setCurrentUser(user);
    } else {
      setCurrentUser(JSON.parse(u));
    }
  }, []);

  /* Supabaseからデータ取得 */
  const fetchIdeas = async () => {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('id', { ascending: false });

    if (error) console.error("Error fetching:", error);
    else setIdeas(data || []);
  };

  useEffect(() => {
    fetchIdeas();
    const savedMode = localStorage.getItem(MODE_KEY);
    if (savedMode) setMode(savedMode);
  }, []);

  /* モード保存 */
  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  /* 投稿 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newIdea = {
      title: title.trim(),
      content: content.trim(),
      author: currentUser.name,
      author_id: currentUser.id,
      likes: { count: 0, userLikes: {} },
      status: "draft",
      verified: false,
      categories: selectedCategories,
      contributions: [],
      hash: crypto.randomUUID().slice(0, 16)
    };

    const { data, error } = await supabase.from('ideas').insert([newIdea]).select();

    if (error) {
      alert("エラー: " + error.message);
    } else {
      setIdeas([data[0], ...ideas]);
      setTitle(""); setContent(""); setSelectedCategories([]);
      setActiveTab("home");
    }
  };

  /* いいね */
  const handleLike = async (idea) => {
    const userLikes = idea.likes?.userLikes ? { ...idea.likes.userLikes } : {};
    const cur = userLikes[currentUser.id] ?? 0;
    if (cur >= 3) return;

    userLikes[currentUser.id] = cur + 1;
    const newLikes = { count: (idea.likes?.count ?? 0) + 1, userLikes };

    const { error } = await supabase
      .from('ideas')
      .update({ likes: newLikes })
      .eq('id', idea.id);

    if (!error) {
      setIdeas(ideas.map(i => i.id === idea.id ? { ...i, likes: newLikes } : i));
    }
  };

  /* 貢献 */
  const handleContributionSubmit = async ({ type, content: cContent }) => {
    const newContrib = {
      user: currentUser.name,
      type,
      content: cContent,
      created_at: new Date().toISOString()
    };

    const targetIdea = contributionModal.idea;
    const updatedContribs = [...(targetIdea.contributions || []), newContrib];

    const { error } = await supabase
      .from('ideas')
      .update({ contributions: updatedContribs, status: "open" })
      .eq('id', targetIdea.id);

    if (!error) {
      setIdeas(ideas.map(i => i.id === targetIdea.id ? { ...i, contributions: updatedContribs, status: "open" } : i));
    }
  };

  /* 削除 */
  const handleDelete = async (id) => {
    if (!window.confirm("本当に削除しますか？")) return;
    const { error } = await supabase.from('ideas').delete().eq('id', id);
    if (!error) setIdeas(ideas.filter(i => i.id !== id));
  };

  /* お気に入り (これはローカルのみの体験にしています) */
  const handleFavorite = (id) => {
    setIdeas(ideas.map(i => i.id === id ? { ...i, favorited: !i.favorited } : i));
  };

  /* フィルタリング */
  let filtered = mode === "business" ? ideas.filter(i => i.verified) : ideas;
  if (activeTab === "favorites") filtered = filtered.filter(i => i.favorited);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q));
  }
  if (filterCategories.length > 0) {
    filtered = filtered.filter(i => i.categories?.some(c => filterCategories.includes(c)));
  }

  const sorted = [...filtered].sort((a, b) => 
    sortMode === "popular" ? (b.likes?.count || 0) - (a.likes?.count || 0) : b.id - a.id
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-36 font-sans">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb size={22} />
            <h1 className="text-lg font-bold">コトハジメ</h1>
          </div>
          <div className="flex bg-white/20 rounded-full p-1">
            <button onClick={() => {setMode("creator"); setActiveTab("home")}} className={`px-3 py-1 rounded-full text-xs font-bold ${mode === "creator" ? "bg-white text-indigo-600" : "text-white"}`}>クリエイター</button>
            <button onClick={() => {setMode("business"); setActiveTab("home")}} className={`px-3 py-1 rounded-full text-xs font-bold ${mode === "business" ? "bg-white text-indigo-600" : "text-white"}`}>ビジネス</button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {activeTab === "post" ? (
          <div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">アイデアを公開</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトル..." className="w-full p-3 rounded-xl bg-slate-50 border-none" maxLength={TITLE_LIMIT} />
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="内容..." rows={5} className="w-full p-3 rounded-xl bg-slate-50 border-none" maxLength={CONTENT_LIMIT} />
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.id} type="button" onClick={() => setSelectedCategories(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])} className={`px-3 py-1 rounded-full text-xs font-bold ${selectedCategories.includes(c.id) ? c.color : "bg-slate-100 text-slate-400"}`}>{c.label}</button>
                ))}
              </div>
              <button type="submit" className="w-full bg-indigo-500 text-white py-3 rounded-xl font-bold">公開する</button>
              <button type="button" onClick={() => setActiveTab("home")} className="w-full text-slate-400 text-sm">キャンセル</button>
            </form>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="検索..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200" />
            </div>
            <div className="flex gap-2 bg-white p-1 rounded-lg border">
              <button onClick={() => setSortMode("new")} className={`flex-1 py-1 text-xs font-bold rounded ${sortMode === "new" ? "bg-slate-100" : "text-slate-400"}`}>新着</button>
              <button onClick={() => setSortMode("popular")} className={`flex-1 py-1 text-xs font-bold rounded ${sortMode === "popular" ? "bg-slate-100" : "text-slate-400"}`}>人気</button>
            </div>
            {sorted.map(idea => (
              <IdeaCard key={idea.id} idea={idea} currentUser={currentUser} onLike={handleLike} onFavorite={handleFavorite} onDelete={handleDelete} onContribute={idea => setContributionModal({ isOpen: true, idea })} mode={mode} />
            ))}
          </>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center text-xs ${activeTab === "home" ? "text-indigo-600" : "text-slate-400"}`}><Home size={20} />ホーム</button>
        {mode === "creator" ? (
          <button onClick={() => setActiveTab("post")} className={`flex flex-col items-center text-xs ${activeTab === "post" ? "text-indigo-600" : "text-slate-400"}`}><PlusCircle size={20} />投稿</button>
        ) : (
          <button onClick={() => setActiveTab("favorites")} className={`flex flex-col items-center text-xs ${activeTab === "favorites" ? "text-indigo-600" : "text-slate-400"}`}><Star size={20} />お気に入り</button>
        )}
      </footer>

      <ContributionModal isOpen={contributionModal.isOpen} ideaTitle={contributionModal.idea?.title} onClose={() => setContributionModal({ isOpen: false, idea: null })} onSubmit={handleContributionSubmit} />
    </div>
  );
};

export default App;