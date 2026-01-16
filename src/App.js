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
  Search,
  Send,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useEffect, useState } from "react";

const TITLE_LIMIT = 40;
const CONTENT_LIMIT = 500;
const PREVIEW_LIMIT = 120;
const CONTRIBUTION_LIMIT = 300;
const USER_KEY = "kht-user-v1";
const STORAGE_KEY = "kotohajime-ideas-v5";
const MODE_KEY = "kotohajime-mode";

const GLOBAL_DISTRIBUTION = { creator: 30, contributors: 30, platform: 40 };

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
  text.length <= limit ? text : text.slice(0, limit) + "…";

const formatISODate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

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

const ContributionModal = ({ isOpen, onClose, onSubmit, ideaTitle }) => {
  const [type, setType] = useState("tech");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setType("tech");
      setContent("");
    }
  }, [isOpen]);

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
              <button
                type="button"
                onClick={() => setType("tech")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border-2 ${type === "tech" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}
              >
                <Code size={16} className="inline mr-1" /> 技術
              </button>
              <button
                type="button"
                onClick={() => setType("design")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border-2 ${type === "design" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200 text-slate-600"}`}
              >
                <Palette size={16} className="inline mr-1" /> デザイン
              </button>
              <button
                type="button"
                onClick={() => setType("business")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border-2 ${type === "business" ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 text-slate-600"}`}
              >
                <Briefcase size={16} className="inline mr-1" /> ビジネス
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 mb-2 block">貢献内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={CONTRIBUTION_LIMIT}
              rows={4}
              className="w-full p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              placeholder="具体的な提案や改善案を入力してください..."
            />
            <p className="text-right text-xs text-slate-400 mt-1">{content.length}/{CONTRIBUTION_LIMIT}</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            貢献を追加
          </button>
        </div>
      </div>
    </div>
  );
};

const GrowthRecordSection = ({ contributions }) => {
  const [expandedTypes, setExpandedTypes] = useState({});

  const techContributions = contributions.filter(c => c.type === 'tech');
  const designContributions = contributions.filter(c => c.type === 'design');
  const businessContributions = contributions.filter(c => c.type === 'business');

  const toggleExpand = (type) => {
    setExpandedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const ContributionTypeSection = ({ icon, title, contributions, type, color }) => {
    const isExpanded = expandedTypes[type];
    const displayContributions = isExpanded ? contributions : contributions.slice(0, 2);
    const hasMore = contributions.length > 2;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{icon}</span>
          <h5 className="font-bold text-slate-700 text-sm">{title}</h5>
          <span className="text-xs text-slate-500">({contributions.length}件)</span>
        </div>

        {contributions.length === 0 ? (
          <div className={`text-xs text-slate-500 italic p-3 bg-${color}-50 rounded-lg border border-${color}-200`}>
            📢 {title}を募集中！
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {displayContributions.map((c, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{c.user}</span>
                      <ContributionBadge type={c.type} />
                    </div>
                    <span className="text-xs text-slate-400">{c.date}</span>
                  </div>
                  <p className="text-sm text-slate-600">{c.content}</p>
                </div>
              ))}
            </div>

            {hasMore && (
              <button
                onClick={() => toggleExpand(type)}
                className="mt-2 text-xs text-indigo-500 hover:text-indigo-600 font-semibold flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={14} /> 閉じる
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} /> もっと見る (+{contributions.length - 2}件)
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-2xl">🌱</div>
        <h4 className="font-bold text-slate-800">成長の記録</h4>
        <span className="text-xs text-slate-500">{contributions.length}件の貢献</span>
      </div>

      <ContributionTypeSection
        icon="📘"
        title="技術的な実現方法"
        contributions={techContributions}
        type="tech"
        color="blue"
      />

      <ContributionTypeSection
        icon="💼"
        title="ビジネスモデル"
        contributions={businessContributions}
        type="business"
        color="green"
      />

      <ContributionTypeSection
        icon="🎨"
        title="デザイン提案"
        contributions={designContributions}
        type="design"
        color="purple"
      />
    </div>
  );
};

const IdeaCard = ({ idea, currentUser, onLike, onFavorite, onDelete, onContribute, mode }) => {
  const [expanded, setExpanded] = useState(false);
  const [showGrowth, setShowGrowth] = useState(false);
  const isLong = idea.content.length > PREVIEW_LIMIT;

  const userLikeCount = (idea.likes?.userLikes && currentUser?.id && idea.likes.userLikes[currentUser.id]) || 0;
  const remaining = 3 - userLikeCount;
  const isOwner = currentUser && idea.authorId && currentUser.id === idea.authorId;

  const hasContributions = idea.contributions && idea.contributions.length > 0;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 transition-colors hover:border-indigo-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={idea.status} />
          {idea.categories && idea.categories.length > 0 && <CategoryBadge categoryId={idea.categories[0]} />}
          {idea.verified && <CheckCircle size={16} className="text-green-500" />}
        </div>
        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full whitespace-nowrap">
          {idea.likes?.count ?? 0} 応援
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <User size={14} />
        <div>
          <div className="font-bold">{idea.author}</div>
          <div className="text-[11px]">{idea.date}</div>
        </div>
      </div>

      <h3 className="font-bold text-slate-900 mb-1">{idea.title}</h3>

      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-3">
        {expanded ? idea.content : truncateText(idea.content, PREVIEW_LIMIT)}
      </p>

      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-500 hover:underline mb-3">
          {expanded ? "閉じる" : "続きを読む"}
        </button>
      )}

      {hasContributions && (
        <div className="mb-3">
          <button
            onClick={() => setShowGrowth(!showGrowth)}
            className="w-full p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Users size={14} />
                貢献者 {idea.contributions.length}名
              </div>
              <span className="text-xs text-slate-400">
                {showGrowth ? "閉じる" : "詳細を見る"}
              </span>
            </div>
          </button>

          {showGrowth && <GrowthRecordSection contributions={idea.contributions} />}
        </div>
      )}

      {mode === 'business' && idea.marketSize && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs font-bold text-blue-900">💰 想定市場規模: {idea.marketSize}</div>
        </div>
      )}

      <div className="flex gap-2">
        {mode === 'creator' ? (
          <>
            <button
              onClick={() => onLike(idea.id)}
              className={`flex-1 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95 ${remaining <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={remaining <= 0}
              title={remaining <= 0 ? "1投稿につき最大3いいねです" : `残り ${remaining} いいね`}
            >
              <Heart size={16} /> 応援 {userLikeCount > 0 ? `(${userLikeCount})` : ""}
            </button>

            <button
              onClick={() => onContribute(idea)}
              className="flex-1 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-500 transition-all active:scale-95"
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
              className={`py-2 px-4 rounded-xl border-2 ${idea.favorited ? "border-yellow-400 bg-yellow-50 text-yellow-600" : "border-slate-200 bg-white text-slate-400"} text-sm font-bold flex items-center justify-center gap-2 hover:border-yellow-400 hover:bg-yellow-50 hover:text-yellow-600 transition-all active:scale-95`}
            >
              <Star size={16} fill={idea.favorited ? "currentColor" : "none"} />
            </button>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px] text-slate-300">ハッシュ: <span className="select-all">{(idea.hash || "").slice(0, 16)}…</span></div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button onClick={() => onDelete(idea.id)} className="text-xs text-rose-600 hover:underline flex items-center gap-1">
              <Trash2 size={14} /> 削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ModeToggle = ({ mode, setMode, setActiveTab }) => {
  const switchTo = (m) => {
    setMode(m);
    setActiveTab("home");
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-full p-1 border-2 border-slate-200 shadow-sm">
      <button onClick={() => switchTo("creator")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === "creator" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}>
        <Palette size={16} /> <span className="hidden sm:inline">クリエイター</span>
      </button>
      <button onClick={() => switchTo("business")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === "business" ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}>
        <Briefcase size={16} /> <span className="hidden sm:inline">ビジネス</span>
      </button>
    </div>
  );
};

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
          <div className="text-slate-500 text-xs">運営</div>
        </div>
      </div>
      <div className="text-xs text-slate-400 mt-2">※β版</div>
    </div>
  </div>
);

const AVAILABLE_TABS = {
  creator: ["home", "post"],
  business: ["home", "favorites"]
};

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

  useEffect(() => {
    const savedIdeas = localStorage.getItem(STORAGE_KEY);
    const savedMode = localStorage.getItem(MODE_KEY);

    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    } else {
      const sampleIdeas = [
        {
          id: 1,
          title: "音楽で料理が美味しくなるレシピアプリ",
          content: "料理のプロセスに合わせて最適な音楽を流すことで、味覚を増幅させるAIレシピアプリ。",
          author: "山田太郎",
          authorId: null,
          date: "2025-01-15",
          createdAt: new Date().toISOString(),
          likes: { count: 234, userLikes: {} },
          status: "verified",
          verified: true,
          marketSize: "50億円",
          categories: ["ai", "food"],
          contributions: [
            { user: "技術者A", type: "tech", content: "React NativeとSpotify APIで実装可能。音響心理学の論文も参照できます。", date: "2025-01-16", createdAt: new Date().toISOString() },
            { user: "エンジニアB", type: "tech", content: "バックエンドはNode.js + MongoDBで設計可能。リアルタイム音楽切り替えも実装できます。", date: "2025-01-16", createdAt: new Date().toISOString() },
            { user: "マーケターC", type: "business", content: "市場規模50億円。クックパッドの月間5000万ユーザーの5%が対象になると想定。競合はクックパッド、デリッシュキッチン。", date: "2025-01-16", createdAt: new Date().toISOString() },
            { user: "ビジネス職D", type: "business", content: "サブスクモデルで月額500円。広告収入との併用で収益化可能。", date: "2025-01-17", createdAt: new Date().toISOString() },
            { user: "デザイナーE", type: "design", content: "料理写真とビジュアライザーを融合したUIのモックアップ作成しました。", date: "2025-01-16", createdAt: new Date().toISOString() }
          ],
          favorited: false,
          hash: "a3f8d92e1b4c5"
        },
        {
          id: 2,
          title: "夢日記を分析してストーリーに変換するサービス",
          content: "毎日の夢を記録すると、AIが物語として再構成。自分だけの夢小説が完成し、出版やアニメ化の可能性も広がります。",
          author: "佐藤花子",
          authorId: null,
          date: "2025-01-14",
          createdAt: new Date().toISOString(),
          likes: { count: 567, userLikes: {} },
          status: "interest",
          verified: true,
          marketSize: "30億円",
          categories: ["ai", "entertainment"],
          contributions: [
            { user: "開発者F", type: "tech", content: "GPT-4での実装例を作成しました。夢の解析精度は高いです。", date: "2025-01-15", createdAt: new Date().toISOString() },
            { user: "編集者G", type: "business", content: "出版社との連携スキームを提案します。", date: "2025-01-15", createdAt: new Date().toISOString() }
          ],
          favorited: false,
          hash: "b7e2c41f9a6d8"
        }
      ];
      setIdeas(sampleIdeas);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleIdeas));
    }

    if (savedMode) setMode(savedMode);
  }, []);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
    if (!AVAILABLE_TABS[mode].includes(activeTab)) {
      setActiveTab("home");
    }
  }, [mode]);

    const saveIdeas = (data) => {
    setIdeas(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handlePost = () => {
    if (!title.trim() || !content.trim()) return;

    const newIdea = {
      id: Date.now(),
      title: title.slice(0, TITLE_LIMIT),
      content: content.slice(0, CONTENT_LIMIT),
      author: currentUser.name,
      authorId: currentUser.id,
      date: new Date().toLocaleString(),
      createdAt: new Date().toISOString(),
      likes: { count: 0, userLikes: {} },
      status: "open",
      verified: false,
      categories: selectedCategories.length ? selectedCategories : ["other"],
      contributions: [],
      favorited: false,
      hash: crypto.randomUUID()
    };

    const updated = [newIdea, ...ideas];
    saveIdeas(updated);

    setTitle("");
    setContent("");
    setSelectedCategories([]);
    setActiveTab("home");
  };

  const handleLike = (id) => {
    const updated = ideas.map(i => {
      if (i.id !== id) return i;

      const likes = i.likes || { count: 0, userLikes: {} };
      const userLikes = likes.userLikes[currentUser.id] || 0;
      if (userLikes >= 3) return i;

      return {
        ...i,
        likes: {
          count: likes.count + 1,
          userLikes: {
            ...likes.userLikes,
            [currentUser.id]: userLikes + 1
          }
        }
      };
    });

    saveIdeas(updated);
  };

  const handleFavorite = (id) => {
    const updated = ideas.map(i =>
      i.id === id ? { ...i, favorited: !i.favorited } : i
    );
    saveIdeas(updated);
  };

  const handleDelete = (id) => {
    const updated = ideas.filter(i => i.id !== id);
    saveIdeas(updated);
  };

  const handleContribute = (idea) => {
    setContributionModal({ isOpen: true, idea });
  };

  const submitContribution = ({ type, content }) => {
    const updated = ideas.map(i => {
      if (i.id !== contributionModal.idea.id) return i;

      return {
        ...i,
        contributions: [
          ...(i.contributions || []),
          {
            user: currentUser.name,
            type,
            content,
            date: new Date().toLocaleString(),
            createdAt: new Date().toISOString()
          }
        ]
      };
    });

    saveIdeas(updated);
  };

  const filteredIdeas = ideas
    .filter(i =>
      !searchQuery ||
      i.title.includes(searchQuery) ||
      i.content.includes(searchQuery)
    )
    .filter(i =>
      filterCategories.length === 0 ||
      filterCategories.some(cat =>
        Array.isArray(i.categories)
          ? i.categories.includes(cat)
          : i.categories === cat
      )
    )
    .sort((a, b) =>
      sortMode === "new"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : (b.likes?.count || 0) - (a.likes?.count || 0)
    );
