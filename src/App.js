import {
  Briefcase,
  CheckCircle,
  ChevronDown,
  ChevronUp,
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
  Share2,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  User,
  Users,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

/* ====== 定数 ====== */
const TITLE_LIMIT = 40;
const CONTENT_LIMIT = 500;
const PREVIEW_LIMIT = 120;
const CONTRIBUTION_LIMIT = 300;
const USER_KEY = "kht-user-v1";
const STORAGE_KEY = "kotohajime-ideas-v6";
const MODE_KEY = "kotohajime-mode";
const DRAFT_KEY = "kotohajime-draft";
const ONBOARDING_KEY = "kotohajime-onboarding-done";

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

const truncateText = (text = "", limit) => (text.length <= limit ? text : text.slice(0, limit) + "…");

const formatISODate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

/* ====== UIパーツ ====== */
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
  const cat = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${cat.color}`}>
      <Tag size={12} /> {cat.label}
    </span>
  );
};

/* ====== 注意書き（安心文言） ====== */
const AssuranceBanner = () => (
  <div className="max-w-md mx-auto px-4 py-3">
    <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
      <div className="font-bold mb-1">※ご注意（β版）</div>
      <div className="leading-relaxed">
        ※現在β版です。投稿されたアイデアは予告なく削除・変更される可能性があります。  
        投稿内容の権利関係や事業化に関する保証は行っていません。自分の投稿は自分で削除できます。
      </div>
    </div>
  </div>
);

/* ====== ステータスバッジ ====== */
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

/* ====== オンボーディングモーダル ====== */
const OnboardingModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "コトハジメへようこそ！",
      description: "アイデアを投稿し、みんなで育てるプラットフォームです",
      icon: <Lightbulb size={48} className="text-yellow-500" />,
      content: "あなたの「もしもこんなサービスがあったら...」というアイデアを投稿して、クリエイターや企業と一緒に実現を目指しましょう。"
    },
    {
      title: "2つのモード",
      description: "クリエイターモードとビジネスモード",
      icon: <Users size={48} className="text-indigo-500" />,
      content: "クリエイターモード：アイデアを投稿・応援・貢献\nビジネスモード：検証済みアイデアを探して事業化"
    },
    {
      title: "貢献して成長させる",
      description: "技術・デザイン・ビジネスの視点から",
      icon: <MessageSquare size={48} className="text-green-500" />,
      content: "気になるアイデアに貢献すると、そのアイデアが実現した時の収益配分を受け取れます（原案者30%、貢献者30%、運営40%）"
    },
    {
      title: "さあ、始めましょう！",
      description: "あなたのアイデアを世界へ",
      icon: <Star size={48} className="text-pink-500" />,
      content: "まずはホーム画面でアイデアを見てみましょう。気に入ったら応援ボタンを押してみてください！"
    }
  ];

  if (!isOpen) return null;

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">{currentStep.icon}</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">{currentStep.title}</h2>
          <p className="text-sm text-indigo-600 font-bold">{currentStep.description}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{currentStep.content}</p>
        </div>

        <div className="flex gap-2 mb-4">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${i === step ? "bg-indigo-500" : "bg-slate-200"}`} />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition">
              戻る
            </button>
          )}
          <button
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(step + 1);
              } else {
                localStorage.setItem(ONBOARDING_KEY, "true");
                onClose();
              }
            }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:shadow-lg transition active:scale-95"
          >
            {step < steps.length - 1 ? "次へ" : "始める"}
          </button>
        </div>

        {step === 0 && (
          <button onClick={() => { localStorage.setItem(ONBOARDING_KEY, "true"); onClose(); }} className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600">
            スキップ
          </button>
        )}
      </div>
    </div>
  );
};

/* ====== 貢献モーダル ====== */
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

        <div className="text-sm text-slate-600 mb-4">「{truncateText(ideaTitle || "", 30)}」への貢献</div>

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

/* ====== 成長の記録 ====== */
const GrowthRecordSection = ({ contributions }) => {
  const [expandedTypes, setExpandedTypes] = useState({});

  const techContributions = contributions.filter((c) => c.type === "tech");
  const designContributions = contributions.filter((c) => c.type === "design");
  const businessContributions = contributions.filter((c) => c.type === "business");

  const toggleExpand = (type) => setExpandedTypes((p) => ({ ...p, [type]: !p[type] }));

  const ContributionTypeSection = ({ icon, title, contributions, type }) => {
    const isExpanded = expandedTypes[type];
    const display = isExpanded ? contributions : contributions.slice(0, 2);
    const hasMore = contributions.length > 2;

    return (
      <div className="mb-4 last:mb-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{icon}</span>
          <h5 className="font-bold text-slate-700 text-sm">{title}</h5>
          <span className="text-xs text-slate-500">({contributions.length}件)</span>
        </div>

        {contributions.length === 0 ? (
          <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
            📢 {title}を募集中！
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {display.map((c, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{c.user}</span>
                      <ContributionBadge type={c.type} />
                    </div>
                    <span className="text-xs text-slate-400">{c.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>

            {hasMore && (
              <button onClick={() => toggleExpand(type)} className="mt-2 text-xs text-indigo-500 hover:text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                {isExpanded ? <><ChevronUp size={14} /> 閉じる</> : <><ChevronDown size={14} /> もっと見る (+{contributions.length - 2}件)</>}
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

      <ContributionTypeSection icon="📘" title="技術的な実現方法" contributions={techContributions} type="tech" />
      <ContributionTypeSection icon="💼" title="ビジネスモデル" contributions={businessContributions} type="business" />
      <ContributionTypeSection icon="🎨" title="デザイン提案" contributions={designContributions} type="design" />
    </div>
  );
};

/* ====== IdeaCard ====== */
const IdeaCard = ({ idea, currentUser, onLike, onFavorite, onDelete, onContribute, onShare, mode }) => {
  const [expanded, setExpanded] = useState(false);
  const [showContributions, setShowContributions] = useState(false);
  const isLong = (idea.content || "").length > PREVIEW_LIMIT;

  const userLikeCount = (idea.likes?.userLikes && currentUser?.id && idea.likes.userLikes[currentUser.id]) || 0;
  const remaining = 3 - userLikeCount;
  const isOwner = currentUser && idea.authorId && currentUser.id === idea.authorId;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 transition-colors hover:border-indigo-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={idea.status} />
          {Array.isArray(idea.categories) && idea.categories.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              {idea.categories.map((catId) => (
                <CategoryBadge key={catId} categoryId={catId} />
              ))}
            </div>
          ) : (
            <CategoryBadge categoryId="other" />
          )}
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
          <div className="text-[11px]">{idea.date}{idea.createdAt ? ` • ${formatISODate(idea.createdAt)}` : ""}</div>
        </div>
      </div>

      <h3 className="font-bold text-slate-900 mb-1">{idea.title}</h3>

      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-3">
        {expanded ? idea.content : truncateText(idea.content || "", PREVIEW_LIMIT)}
      </p>

      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-500 hover:underline mb-3">
          {expanded ? "閉じる" : "続きを読む"}
        </button>
      )}

      {idea.contributions && idea.contributions.length > 0 && (
        <div className="mb-3">
          <button onClick={() => setShowContributions(!showContributions)} className="w-full p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Users size={14} /> 貢献者 {idea.contributions.length}名
              </div>
              <span className="text-xs text-slate-400">{showContributions ? "閉じる" : "詳細を見る"}</span>
            </div>
          </button>

          {showContributions && <div className="mt-2"><GrowthRecordSection contributions={idea.contributions} /></div>}
        </div>
      )}

      {mode === "business" && idea.marketSize && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs font-bold text-blue-900">💰 想定市場規模: {idea.marketSize}</div>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        {mode === "creator" ? (
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
        <button
          onClick={() => onShare(idea)}
          className="py-2 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
          title="シェア"
        >
          <Share2 size={16} />
        </button>
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

/* ====== ModeToggle ====== */
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

/* ====== DistributionInfo ====== */
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

/* ====== App ====== */
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  /* ユーザー初期化 & オンボーディング */
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

    // オンボーディングチェック
    const onboardingDone = localStorage.getItem(ONBOARDING_KEY);
    if (!onboardingDone) {
      setShowOnboarding(true);
    }
  }, []);

  /* データロード（サンプル込み） */
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
            { user: "技術者A", type: "tech", content: "React NativeとSpotify APIで実装可能", date: "2025-01-16", createdAt: new Date().toISOString() },
            { user: "デザイナーB", type: "design", content: "料理写真とビジュアライザーの融合UI提案", date: "2025-01-16", createdAt: new Date().toISOString() }
          ],
          favorited: false,
          hash: "a3f8d92e1b4c5"
        },
        {
          id: 2,
          title: "夢日記を分析してストーリーに変換するサービス",
          content: "毎日の夢を記録すると、AIが物語として再構成。",
          author: "佐藤花子",
          authorId: null,
          date: "2025-01-14",
          createdAt: new Date().toISOString(),
          likes: { count: 567, userLikes: {} },
          status: "interest",
          verified: true,
          marketSize: "30億円",
          categories: ["ai", "entertainment"],
          contributions: [{ user: "開発者D", type: "tech", content: "GPT-4での実装例を作成しました", date: "2025-01-15", createdAt: new Date().toISOString() }],
          favorited: false,
          hash: "b7e2c41f9a6d8"
        }
      ];
      setIdeas(sampleIdeas);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleIdeas));
    }

    if (savedMode) setMode(savedMode);

    // Draft復元（投稿フォームの下書き）
    try {
      const draftRaw = localStorage.getItem(DRAFT_KEY);
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        if (draft.title) setTitle(draft.title);
        if (draft.content) setContent(draft.content);
        if (Array.isArray(draft.categories)) setSelectedCategories(draft.categories);
      }
    } catch (e) {
      // ignore parse errors
      console.warn("draft load failed", e);
    }
  }, []);

  /* モード変更時の安全処理 */
  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
    if (!AVAILABLE_TABS[mode].includes(activeTab)) {
      setActiveTab("home");
    }
  }, [mode, activeTab]);

  /* 下書き自動保存 */
  useEffect(() => {
    const draft = { title, content, categories: selectedCategories };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn("draft save failed", e);
    }
  }, [title, content, selectedCategories]);

  /* 保存ユーティリティ */
  const saveIdeas = (data) => {
    setIdeas(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("saveIdeas failed", e);
    }
  };

  /* 投稿 (下書き消去含む) */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const user = currentUser || JSON.parse(localStorage.getItem(USER_KEY));
    const now = new Date().toISOString();
    const newIdea = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      author: user.name || "あなた",
      authorId: user.id,
      date: new Date().toLocaleDateString(),
      createdAt: now,
      likes: { count: 0, userLikes: {} },
      status: "draft",
      verified: false,
      categories: selectedCategories,
      contributions: [],
      favorited: false,
      hash: crypto.randomUUID().slice(0, 16)
    };

    saveIdeas([newIdea, ...ideas]);
    // 下書きを消す
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }

    setTitle("");
    setContent("");
    setSelectedCategories([]);
    setActiveTab("home");
  };

  /* いいね（1ユーザーあたり1投稿につき最大3回） */
  const handleLike = (id) => {
    const user = currentUser || JSON.parse(localStorage.getItem(USER_KEY));
    if (!user) return;
    const next = ideas.map((it) => {
      if (it.id !== id) return it;
      const userLikes = it.likes?.userLikes ? { ...it.likes.userLikes } : {};
      const cur = userLikes[user.id] ?? 0;
      if (cur >= 3) return it;
      userLikes[user.id] = cur + 1;
      const newCount = (it.likes?.count ?? 0) + 1;
      return { ...it, likes: { count: newCount, userLikes } };
    });
    saveIdeas(next);
  };

  /* お気に入りトグル（ローカル体験） */
  const handleFavorite = (id) => {
    saveIdeas(ideas.map((i) => (i.id === id ? { ...i, favorited: !i.favorited } : i)));
  };

  /* 削除（自分のみ可能） */
  const handleDelete = (id) => {
    const user = currentUser || JSON.parse(localStorage.getItem(USER_KEY));
    const target = ideas.find((i) => i.id === id);
    if (!target) return;
    if (target.authorId && user && target.authorId === user.id) {
      if (!window.confirm("本当にこの投稿を削除しますか？")) return;
      saveIdeas(ideas.filter((i) => i.id !== id));
    } else {
      alert("この投稿はあなたの投稿ではないため削除できません。");
    }
  };

  /* 貢献モーダルを開く */
  const handleContribute = (idea) => {
    setContributionModal({ isOpen: true, idea });
  };

  /* 貢献送信 */
  const handleContributionSubmit = ({ type, content: contributionContent }) => {
    const user = currentUser || JSON.parse(localStorage.getItem(USER_KEY));
    const newContribution = {
      user: user.name || "あなた",
      type,
      content: contributionContent,
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString()
    };

    saveIdeas(
      ideas.map((i) =>
        i.id === contributionModal.idea.id
          ? { ...i, contributions: [...(i.contributions || []), newContribution], status: "open" }
          : i
      )
    );
    setContributionModal({ isOpen: false, idea: null });
  };

  /* カテゴリ選択（投稿フォーム） */
  const toggleCategorySelect = (catId) => {
    setSelectedCategories((prev) => (prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]));
  };

  /* カテゴリフィルタ（一覧） */
  const toggleCategoryFilter = (catId) => {
    setFilterCategories((prev) => (prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]));
  };

  /* シェア機能（安全に window を参照） */
  const handleShare = (idea) => {
    try {
      const text = `「${idea.title}」\n\n${truncateText(idea.content || "", 120)}\n\n#コトハジメ`;
      let shareUrl = "";
      if (typeof window !== "undefined") {
        // できれば特定アイデアへリンクを作る（hash付き）
        shareUrl = `${window.location.origin}${window.location.pathname}?idea=${idea.id}#${idea.hash || ""}`;
      }

      if (navigator.share) {
        navigator.share({ title: idea.title, text, url: shareUrl }).catch(() => {
          // ignore
        });
      } else {
        // fallback: open Twitter intent
        const tweet = `${text}\n${shareUrl}`;
        const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
        window.open(twitter, "_blank", "noopener");
      }
    } catch (e) {
      console.warn("share failed", e);
    }
  };

  /* フィルタリング & 並び替え */
  let filteredIdeas = mode === "business" ? ideas.filter((i) => i.verified === true) : ideas;

  if (activeTab === "favorites" && mode === "business") {
    filteredIdeas = filteredIdeas.filter((i) => i.favorited);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredIdeas = filteredIdeas.filter(
      (i) => (i.title || "").toLowerCase().includes(q) || (i.content || "").toLowerCase().includes(q)
    );
  }

  if (filterCategories.length > 0) {
    filteredIdeas = filteredIdeas.filter((i) => Array.isArray(i.categories) && i.categories.some((c) => filterCategories.includes(c)));
  }

  const sortedIdeas = [...filteredIdeas].sort((a, b) =>
    sortMode === "popular" ? (b.likes?.count ?? 0) - (a.likes?.count ?? 0) : (new Date(b.createdAt) - new Date(a.createdAt))
  );

  /* オンボーディング閉じる */
  const closeOnboarding = () => {
    try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch (e) {}
    setShowOnboarding(false);
  };

  /* レンダリング */
  return (
    <div className="min-h-screen bg-slate-50 pb-36 font-sans">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb size={22} />
            <h1 className="text-lg font-bold">コトハジメ</h1>
          </div>
          <ModeToggle mode={mode} setMode={setMode} setActiveTab={setActiveTab} />
        </div>
      </header>

      {/* 安心文言を常時表示 */}
      <AssuranceBanner />

      <DistributionInfo />

      {/* オンボーディング */}
      <OnboardingModal isOpen={showOnboarding} onClose={closeOnboarding} />

      {mode === "business" && (
        <div className="max-w-md mx-auto p-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-2xl shadow-md mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={20} />
              <span className="font-bold">ビジネスモード</span>
            </div>
            <p className="text-sm opacity-90">検証済みの高品質なアイデアのみを表示しています。</p>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-4 space-y-4">
        {(activeTab === "home" || (activeTab === "favorites" && mode === "business")) ? (
          <>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="タイトル・内容から検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${filterCategories.includes(cat.id) ? cat.color : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex bg-white rounded-lg p-1 border">
              <button
                onClick={() => setSortMode("new")}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition ${sortMode === "new" ? "bg-indigo-50 text-indigo-600" : "text-slate-400"}`}
              >
                <Clock size={14} /> 新着
              </button>
              <button
                onClick={() => setSortMode("popular")}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition ${sortMode === "popular" ? "bg-indigo-50 text-indigo-600" : "text-slate-400"}`}
              >
                <TrendingUp size={14} /> 人気
              </button>
            </div>

            {sortedIdeas.length === 0 ? (
              <div className="text-center py-12 text-slate-400">該当するアイデアがありません</div>
            ) : (
              sortedIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onFavorite={handleFavorite}
                  onDelete={handleDelete}
                  onContribute={handleContribute}
                  onShare={handleShare}
                  mode={mode}
                />
              ))
            )}
          </>
        ) : activeTab === "post" && mode === "creator" ? (
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

              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block">カテゴリー（複数選択可）</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleCategorySelect(cat.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${selectedCategories.includes(cat.id) ? cat.color : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
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

              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform">
                  <Send size={18} /> アイデアを公開する
                </button>
                <button type="button" onClick={() => {
                  // 下書き捨て
                  if (confirm("下書きを破棄しますか？")) {
                    setTitle(""); setContent(""); setSelectedCategories([]);
                    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
                  }
                }} className="py-3 px-4 rounded-2xl border text-slate-600 font-bold">
                  下書きを破棄
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">この画面は現在利用できません</div>
        )}
      </main>

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={contributionModal.isOpen}
        ideaTitle={contributionModal.idea?.title}
        onClose={() => setContributionModal({ isOpen: false, idea: null })}
        onSubmit={handleContributionSubmit}
      />

      {/* Footer nav */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md">
        <div className="max-w-md mx-auto flex justify-around py-3">
          <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center text-xs ${activeTab === "home" ? "text-indigo-600 font-bold" : "text-slate-400"}`}>
            <Home size={20} /> ホーム
          </button>

          {mode === "creator" && (
            <button onClick={() => setActiveTab("post")} className={`flex flex-col items-center text-xs ${activeTab === "post" ? "text-indigo-600 font-bold" : "text-slate-400"}`}>
              <PlusCircle size={20} /> 投稿
            </button>
          )}

          {mode === "business" && (
            <button onClick={() => setActiveTab("favorites")} className={`flex flex-col items-center text-xs ${activeTab === "favorites" ? "text-indigo-600 font-bold" : "text-slate-400"}`}>
              <Star size={20} /> お気に入り
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
