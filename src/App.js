import {
  Briefcase,
  CheckCircle,
  Clock,
  Code,
  Heart,
  Home,
  Lightbulb,
  MessageSquare,
  Palette,
  PlusCircle,
  Send,
  Star,
  Trash2,
  TrendingUp,
  User,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

/* ====== 定数 ====== */
const TITLE_LIMIT = 40;
const CONTENT_LIMIT = 500;
const PREVIEW_LIMIT = 120;
const USER_KEY = "kht-user-v1";
const STORAGE_KEY = "kotohajime-ideas-v2";
const MODE_KEY = "kotohajime-mode";

/* ====== 配分（グローバル） ======
   より現実的に：creator 30%, contributors 30%, platform 40%
*/
const GLOBAL_DISTRIBUTION = { creator: 30, contributors: 30, platform: 40 };

/* ====== ヘルパー ====== */
const truncateText = (text, limit) =>
  text.length <= limit ? text : text.slice(0, limit) + "…";

/* ====== バッジ類 ====== */
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

const StatusBadge = ({ status }) => {
  const statuses = {
    draft: { label: "📝 投稿中", color: "bg-gray-100 text-gray-700" },
    open: { label: "🌱 成長中", color: "bg-yellow-100 text-yellow-700" }, // ← 「肉付け中」→「成長中」
    verified: { label: "✅ 検証済み", color: "bg-green-100 text-green-700" },
    interest: { label: "🏢 企業関心あり", color: "bg-indigo-100 text-indigo-700" },
    realized: { label: "🎉 実現", color: "bg-pink-100 text-pink-700" }
  };
  const s = statuses[status] || statuses.draft;
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.color}`}>{s.label}</span>;
};

/* ====== IdeaCard ======
  - 個別に配分ルールは表示しない
  - いいねは currentUser に基づき 1 投稿につき最大 3 回
  - 自分の投稿なら削除ボタン表示
*/
const IdeaCard = ({ idea, currentUser, onLike, onFavorite, onDelete, mode }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = idea.content.length > PREVIEW_LIMIT;

  // ユーザーがその投稿に付けているいいね数（0〜3）
  const userLikeCount = (idea.likes?.userLikes && currentUser?.id && idea.likes.userLikes[currentUser.id]) || 0;
  const remaining = 3 - userLikeCount;

  const isOwner = currentUser && idea.authorId && currentUser.id === idea.authorId;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 transition-colors hover:border-indigo-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={idea.status} />
          {idea.verified && <CheckCircle size={16} className="text-green-500" />}
        </div>
        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
          {idea.likes?.count ?? 0} 応援
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <User size={14} />
        {idea.author}・{idea.date}
      </div>

      <h3 className="font-bold text-slate-900 mb-1">{idea.title}</h3>

      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-3">
        {expanded ? idea.content : truncateText(idea.content, PREVIEW_LIMIT)}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-indigo-500 hover:underline mb-3"
        >
          {expanded ? "閉じる" : "続きを読む"}
        </button>
      )}

      {idea.contributions && idea.contributions.length > 0 && (
        <div className="mb-3 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
            <Users size={14} />
            貢献者 {idea.contributions.length}名
          </div>
          <div className="flex flex-wrap gap-1">
            {idea.contributions.slice(0, 3).map((c, i) => (
              <ContributionBadge key={i} type={c.type} />
            ))}
            {idea.contributions.length > 3 && (
              <span className="text-xs text-slate-500">+{idea.contributions.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {mode === 'business' && idea.marketSize && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs font-bold text-blue-900">
            💰 想定市場規模: {idea.marketSize}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {mode === 'creator' ? (
          <>
            <button
              onClick={() => onLike(idea.id)}
              className={`flex-1 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95 ${remaining <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={remaining <= 0}
              title={remaining <= 0 ? "1投稿につき最大3いいねです" : `残り ${remaining} いいね`}
            >
              <Heart size={16} />
              応援する {userLikeCount > 0 ? `(${userLikeCount})` : ""}
            </button>

            <button className="flex-1 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-500 transition-all active:scale-95">
              <MessageSquare size={16} />
              貢献する
            </button>
          </>
        ) : (
          <>
            <button className="flex-1 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all active:scale-95">
              <Briefcase size={16} />
              興味あり
            </button>
            <button
              onClick={() => onFavorite(idea.id)}
              className={`py-2 px-4 rounded-xl border-2 ${idea.favorited ? 'border-yellow-400 bg-yellow-50 text-yellow-600' : 'border-slate-200 bg-white text-slate-400'} text-sm font-bold flex items-center justify-center gap-2 hover:border-yellow-400 hover:bg-yellow-50 hover:text-yellow-600 transition-all active:scale-95`}
            >
              <Star size={16} fill={idea.favorited ? 'currentColor' : 'none'} />
            </button>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px] text-slate-300">ハッシュ: <span className="select-all">{(idea.hash || "").slice(0,16)}…</span></div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => onDelete(idea.id)}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1"
            >
              <Trash2 size={14} /> 削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ====== Mode トグル ====== */
const ModeToggle = ({ mode, setMode }) => {
  return (
    <div className="flex items-center gap-2 bg-white rounded-full p-1 border-2 border-slate-200 shadow-sm">
      <button
        onClick={() => setMode('creator')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${ mode === 'creator' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600' }`}
      >
        <Palette size={16} />
        <span className="hidden sm:inline">クリエイター</span>
      </button>
      <button
        onClick={() => setMode('business')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${ mode === 'business' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600' }`}
      >
        <Briefcase size={16} />
        <span className="hidden sm:inline">ビジネス</span>
      </button>
    </div>
  );
};

/* ====== グローバル配分表示 ====== */
const DistributionInfo = () => (
  <div className="max-w-md mx-auto p-4">
    <div className="bg-gradient-to-r from-gray-50 to-white border rounded-xl p-3 text-sm text-slate-700 shadow-sm">
      <div className="font-bold mb-2">収益配分ルール（全体）</div>
      <div className="flex gap-4">
        <div className="text-center">
          <div className="font-bold text-purple-600">{GLOBAL_DISTRIBUTION.creator}%</div>
          <div className="text-slate-500 text-xs">原案者</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-pink-600">{GLOBAL_DISTRIBUTION.contributors}%</div>
          <div className="text-slate-500 text-xs">貢献者</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-indigo-600">{GLOBAL_DISTRIBUTION.platform}%</div>
          <div className="text-slate-500 text-xs">運営（実現費）</div>
        </div>
      </div>
      <div className="text-xs text-slate-400 mt-2">※各案件の詳細はプラットフォームポリシーに準じます（β版）</div>
    </div>
  </div>
);

/* ====== App ====== */
const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sortMode, setSortMode] = useState("new");
  const [ideas, setIdeas] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState("creator");
  const [currentUser, setCurrentUser] = useState(null);

  /* ユーザー初期化（匿名ID） */
  useEffect(() => {
    let u = localStorage.getItem(USER_KEY);
    if (!u) {
      const id = crypto.randomUUID();
      const user = { id, name: "あなた" };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setCurrentUser(user);
    } else {
      setCurrentUser(JSON.parse(u));
    }
  }, []);

  /* モードとデータのロード（サンプル込み） */
  useEffect(() => {
    const savedIdeas = localStorage.getItem(STORAGE_KEY);
    const savedMode = localStorage.getItem(MODE_KEY);

    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    } else {
      // サンプルデータ（likes は {count, userLikes:{}} の形）
      const sampleIdeas = [
        {
          id: 1,
          title: "音楽で料理が美味しくなるレシピアプリ",
          content: "料理のプロセスに合わせて最適な音楽を流すことで、味覚を増幅させるAIレシピアプリ。科学的根拠に基づいた音楽×料理の新体験を提供します。",
          author: "山田太郎",
          authorId: null,
          date: "2025-01-15",
          likes: { count: 234, userLikes: {} },
          status: "verified",
          verified: true,
          marketSize: "50億円",
          contributions: [
            { user: "技術者A", type: "tech" },
            { user: "デザイナーB", type: "design" },
            { user: "経営者C", type: "business" }
          ],
          favorited: false,
          hash: ""
        },
        {
          id: 2,
          title: "夢日記を分析してストーリーに変換するサービス",
          content: "毎日の夢を記録すると、AIが物語として再構成。自分だけの夢小説が完成し、出版やアニメ化の可能性も広がります。",
          author: "佐藤花子",
          authorId: null,
          date: "2025-01-14",
          likes: { count: 567, userLikes: {} },
          status: "interest",
          verified: true,
          marketSize: "30億円",
          contributions: [
            { user: "開発者D", type: "tech" },
            { user: "編集者E", type: "business" }
          ],
          favorited: false,
          hash: ""
        },
        {
          id: 3,
          title: "失恋した人同士でしか入れないバーチャル空間",
          content: "失恋証明書が必要な、癒しと出会いのメタバース。同じ痛みを知る者同士だから生まれる共感と新しい出会い。",
          author: "鈴木一郎",
          authorId: null,
          date: "2025-01-13",
          likes: { count: 892, userLikes: {} },
          status: "open", // ← 成長中
          verified: false,
          contributions: [
            { user: "3Dデザイナー", type: "design" }
          ],
          favorited: false,
          hash: ""
        }
      ];
      setIdeas(sampleIdeas);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleIdeas));
    }

    if (savedMode) setMode(savedMode);
  }, []);

  /* モード変更時の副作用：ビジネスモードにしたら投稿フォーム（postタブ）は閉じる */
  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
    if (mode === 'business' && activeTab === 'post') {
      setActiveTab('home'); // 意味わからん画面を防ぐ
    }
  }, [mode]);

  const saveIdeas = (data) => {
    setIdeas(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  /* 投稿（authorId を入れる） */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const user = currentUser || JSON.parse(localStorage.getItem(USER_KEY));

    const newIdea = {
      id: Date.now(),
      title,
      content,
      author: user.name || "あなた",
      authorId: user.id,
      date: new Date().toLocaleDateString(),
      likes: { count: 0, userLikes: {} },
      status: "draft",
      verified: false,
      contributions: [],
      favorited: false,
      hash: ""
    };

    saveIdeas([newIdea, ...ideas]);
    setTitle("");
    setContent("");
    setActiveTab("home");
  };

  /* いいね：1ユーザーあたり1投稿最大3いいね */
  const handleLike = (id) => {
    const user = currentUser || JSON.parse(localStorage.getItem(USER_KEY));
    if (!user) return;

    const next = ideas.map((it) => {
      if (it.id !== id) return it;

      // userLikes マップ初期化
      const userLikes = it.likes?.userLikes ? { ...it.likes.userLikes } : {};
      const cur = userLikes[user.id] ?? 0;

      if (cur >= 3) {
        // 既に上限到達 → 何もしない（UIで disabled にしてあるが念のため）
        return it;
      }

      userLikes[user.id] = cur + 1;
      const newCount = (it.likes?.count ?? 0) + 1;

      return { ...it, likes: { count: newCount, userLikes } };
    });

    saveIdeas(next);
  };

  const handleFavorite = (id) => {
    saveIdeas(ideas.map((i) => (i.id === id ? { ...i, favorited: !i.favorited } : i)));
  };

  /* 投稿削除（自分の投稿のみ） */
  const handleDelete = (id) => {
    const user = currentUser || JSON.parse(localStorage.getItem(USER_KEY));
    const target = ideas.find(i => i.id === id);
    if (!target) return;
    if (target.authorId && user && target.authorId === user.id) {
      const next = ideas.filter(i => i.id !== id);
      saveIdeas(next);
    } else {
      alert("この投稿はあなたの投稿ではないため削除できません。");
    }
  };

  /* フィルタ（ビジネスモードは検証済みのみ） */
  const filteredIdeas = mode === 'business'
    ? ideas.filter(i => i.verified === true)
    : ideas;

  const sortedIdeas = [...filteredIdeas].sort((a, b) =>
    sortMode === "popular" ? (b.likes?.count ?? 0) - (a.likes?.count ?? 0) : b.id - a.id
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-36 font-sans">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb size={22} /> 
            <h1 className="text-lg font-bold">コトハジメ</h1>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle mode={mode} setMode={setMode} />
          </div>
        </div>
      </header>

      {/* グローバル配分はヘッダ下に1箇所で常駐表示 */}
      <DistributionInfo />

      {mode === 'business' && (
        <div className="max-w-md mx-auto p-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-2xl shadow-md mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={20} />
              <span className="font-bold">ビジネスモード</span>
            </div>
            <p className="text-sm opacity-90">
              検証済みの高品質なアイデアのみを表示しています。
              興味のあるプロジェクトに「興味あり」を送信できます。
            </p>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-4 space-y-4">
        {activeTab === "home" ? (
          <>
            <div className="flex bg-white rounded-lg p-1 border">
              <button
                onClick={() => setSortMode("new")}
                className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-1 ${ sortMode === "new" ? "bg-indigo-50 text-indigo-600" : "text-slate-400" }`}
              >
                <Clock size={14} /> 新着
              </button>
              <button
                onClick={() => setSortMode("popular")}
                className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-1 ${ sortMode === "popular" ? "bg-indigo-50 text-indigo-600" : "text-slate-400" }`}
              >
                <TrendingUp size={14} /> 人気
              </button>
            </div>

            {sortedIdeas.length === 0 ? (
              <div className="text-center py-10">
                {mode === 'business' ? (
                  <div className="space-y-2">
                    <Briefcase size={48} className="mx-auto text-slate-300" />
                    <p className="text-slate-400">検証済みのプロジェクトがまだありません</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Lightbulb size={48} className="mx-auto text-slate-300" />
                    <p className="text-slate-400">まだアイデアがありません 🌱</p>
                  </div>
                )}
              </div>
            ) : (
              sortedIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onFavorite={handleFavorite}
                  onDelete={handleDelete}
                  mode={mode}
                />
              ))
            )}
          </>
        ) : (
          // 投稿フォームはクリエーターモードのみ（切替時にpostが閉じる）
          <div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-black mb-6 text-slate-800">アイデアを公開</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400">タイトル</label>
                <input
                  value={title}
                  maxLength={TITLE_LIMIT}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="あなたの「もしも」を一言で..."
                />
                <p className="text-right text-xs text-slate-400">{title.length}/{TITLE_LIMIT}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">内容</label>
                <textarea
                  rows={5}
                  value={content}
                  maxLength={CONTENT_LIMIT}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="詳しく教えてください..."
                />
                <p className="text-right text-xs text-slate-400">{content.length}/{CONTENT_LIMIT}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-xs font-bold text-purple-900 mb-2">💎 このアイデアが実現したら</div>
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div>
                    <div className="font-bold text-purple-600">{GLOBAL_DISTRIBUTION.creator}%</div>
                    <div className="text-slate-600">あなた</div>
                  </div>
                  <div>
                    <div className="font-bold text-pink-600">{GLOBAL_DISTRIBUTION.contributors}%</div>
                    <div className="text-slate-600">貢献者</div>
                  </div>
                  <div>
                    <div className="font-bold text-indigo-600">{GLOBAL_DISTRIBUTION.platform}%</div>
                    <div className="text-slate-600">実現費用</div>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform">
                <Send size={18} /> アイデアを公開する
              </button>
            </form>
          </div>
        )}
      </main>

      {/* β版注意書き */}
      <div className="fixed left-4 bottom-24 max-w-md">
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 text-xs p-3 rounded-xl shadow-sm">
          ※現在β版です。投稿されたアイデアは予告なく削除・変更される可能性があります。
        </div>
      </div>

      {/* ナビ（クリエイターモードのみ投稿ボタン表示） */}
      {mode === 'creator' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 ${ activeTab === "home" ? "text-indigo-500" : "text-slate-300" }`}
          >
            <Home size={24} />
            <span className="text-xs font-bold">ホーム</span>
          </button>
          <button
            onClick={() => setActiveTab("post")}
            className={`flex flex-col items-center gap-1 ${ activeTab === "post" ? "text-indigo-500" : "text-slate-300" }`}
          >
            <PlusCircle size={24} />
            <span className="text-xs font-bold">投稿</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
