// App.jsx
import {
  Clock,
  Edit2,
  FileText,
  Heart,
  Home,
  MessageSquare,
  PlusCircle,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

/* ====== 定数 ====== */
const TITLE_LIMIT = 40;
const CONTENT_LIMIT = 500;
const PREVIEW_LIMIT = 120;
const USER_KEY = "kht-user-v1";
const STORAGE_KEY = "kotohajime-ideas-vts-v1"; // vts = timestamp evidence
const DELETED_LOG_KEY = "kotohajime-deleted-v1";

/* ====== ヘルパー ====== */
const truncateText = (text, limit) =>
  text.length <= limit ? text : text.slice(0, limit) + "…";

const formatISO = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

/* ====== IdeaCard（タイムスタンプ＋履歴表示付き） ====== */
const IdeaCard = ({ idea, currentUser, onLike, onDelete, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(idea.title);
  const [editContent, setEditContent] = useState(idea.content);

  const isOwner = currentUser && idea.authorId && currentUser.id === idea.authorId;
  const isLong = idea.content.length > PREVIEW_LIMIT;

  const userLikeCount =
    (idea.likes?.userLikes && currentUser?.id && idea.likes.userLikes[currentUser.id]) || 0;
  const remaining = 3 - userLikeCount;

  const handleSaveEdit = () => {
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();
    if (!trimmedTitle || !trimmedContent) return alert("タイトルと内容は必須です。");

    const newSnapshot = {
      version: (idea.version ?? 1) + 1,
      title: trimmedTitle,
      content: trimmedContent,
      timestamp: new Date().toISOString(),
    };
    onEdit(idea.id, {
      title: trimmedTitle,
      content: trimmedContent,
      updatedAt: newSnapshot.timestamp,
      version: newSnapshot.version,
      historyEntry: newSnapshot,
    });
    setEditing(false);
    setShowHistory(true); // 編集後に履歴を見せる
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 transition-colors hover:border-indigo-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <User size={14} />
          <div>
            <div className="font-bold">{idea.author}</div>
            <div className="text-[11px]">{formatISO(idea.createdAt)}</div>
            {idea.updatedAt && <div className="text-[11px] text-slate-400">最終更新: {formatISO(idea.updatedAt)}</div>}
          </div>
        </div>

        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
          {idea.likes?.count ?? 0} 応援
        </div>
      </div>

      <h3 className="font-bold text-slate-900 mb-2">{idea.title}</h3>

      {!editing ? (
        <>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-3">
            {expanded ? idea.content : truncateText(idea.content, PREVIEW_LIMIT)}
          </p>

          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-500 hover:underline mb-2">
              {expanded ? "閉じる" : "続きを読む"}
            </button>
          )}
        </>
      ) : (
        <div className="mb-3">
          <input
            value={editTitle}
            maxLength={TITLE_LIMIT}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full p-2 rounded-md border bg-slate-50 mb-2"
          />
          <textarea
            value={editContent}
            maxLength={CONTENT_LIMIT}
            rows={6}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 rounded-md border bg-slate-50"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleSaveEdit} className="px-3 py-2 bg-indigo-500 text-white rounded-md">保存</button>
            <button onClick={() => { setEditing(false); setEditTitle(idea.title); setEditContent(idea.content); }} className="px-3 py-2 border rounded-md">取消</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onLike(idea.id)}
          disabled={remaining <= 0}
          title={remaining <= 0 ? "1投稿につき最大3いいねです" : `残り ${remaining} いいね`}
          className={`flex-1 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-bold flex items-center justify-center gap-2 ${remaining <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-50 hover:text-rose-500'}`}
        >
          <Heart size={16} /> 応援 {userLikeCount > 0 ? `(${userLikeCount})` : ""}
        </button>

        {isOwner && !editing && (
          <button onClick={() => setEditing(true)} className="flex-none px-3 py-2 rounded-xl border border-slate-200 text-sm flex items-center gap-2 hover:bg-indigo-50">
            <Edit2 size={16} /> 編集
          </button>
        )}

        {isOwner && (
          <button onClick={() => onDelete(idea.id)} className="flex-none px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center gap-2">
            <Trash2 size={16} /> 削除
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1 hover:underline">
          <FileText size={14} /> 履歴を見る
        </button>
        <div>{idea.version ? `v${idea.version}` : "v1"}</div>
      </div>

      {showHistory && (
        <div className="mt-3 bg-slate-50 p-3 rounded-md text-sm text-slate-700">
          <div className="font-bold mb-2">履歴</div>
          {Array.isArray(idea.history) && idea.history.length > 0 ? (
            idea.history.slice().reverse().map((h, idx) => (
              <div key={idx} className="mb-3 border-b last:border-b-0 pb-2">
                <div className="text-[12px] text-slate-500">v{h.version} — {formatISO(h.timestamp)}</div>
                <div className="font-semibold mt-1">{h.title}</div>
                <div className="text-slate-600 whitespace-pre-line">{truncateText(h.content, 300)}</div>
              </div>
            ))
          ) : (
            <div className="text-slate-500">履歴はありません。</div>
          )}
        </div>
      )}
    </div>
  );
};

/* ====== App (全体) ====== */
const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sortMode, setSortMode] = useState("new");
  const [ideas, setIdeas] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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

  /* データロード（タイムスタンプ対応） */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setIdeas(JSON.parse(raw));
    } else {
      // サンプル（createdAtを入れておく）
      const sample = [
        {
          id: 1,
          title: "音楽で料理が美味しくなるレシピアプリ",
          content: "料理の各プロセスに合わせて最適な音楽を流し、味覚体験を増幅するAIレシピアプリ。",
          author: "山田太郎",
          authorId: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          version: 1,
          history: [
            {
              version: 1,
              title: "音楽で料理が美味しくなるレシピアプリ",
              content: "料理の各プロセスに合わせて最適な音楽を流し、味覚体験を増幅するAIレシピアプリ。",
              timestamp: new Date().toISOString(),
            },
          ],
          likes: { count: 234, userLikes: {} },
        },
      ];
      setIdeas(sample);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    }
  }, []);

  const saveIdeas = (next) => {
    setIdeas(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  /* 投稿 */
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
      createdAt: now,
      updatedAt: null,
      version: 1,
      history: [
        { version: 1, title: title.trim(), content: content.trim(), timestamp: now },
      ],
      likes: { count: 0, userLikes: {} },
    };
    saveIdeas([newIdea, ...ideas]);
    setTitle("");
    setContent("");
    setActiveTab("home");
  };

  /* いいね（1ユーザー1投稿につき最大3回） */
  const handleLike = (id) => {
    const user = currentUser || JSON.parse(localStorage.getItem(USER_KEY));
    if (!user) return;
    const next = ideas.map((it) => {
      if (it.id !== id) return it;
      const userLikes = it.likes?.userLikes ? { ...it.likes.userLikes } : {};
      const cur = userLikes[user.id] ?? 0;
      if (cur >= 3) return it;
      userLikes[user.id] = cur + 1;
      return { ...it, likes: { count: (it.likes?.count ?? 0) + 1, userLikes } };
    });
    saveIdeas(next);
  };

  /* 編集（履歴を残す） */
  const handleEdit = (id, payload) => {
    // payload: { title, content, updatedAt, version, historyEntry }
    const next = ideas.map((it) => {
      if (it.id !== id) return it;
      const history = Array.isArray(it.history) ? [...it.history] : [];
      if (payload.historyEntry) history.push(payload.historyEntry);
      return {
        ...it,
        title: payload.title ?? it.title,
        content: payload.content ?? it.content,
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        version: payload.version ?? (it.version ? it.version + 1 : 2),
        history,
      };
    });
    saveIdeas(next);
  };

  /* 削除：削除ログに残してからリストから削除（内部保存のみ） */
  const handleDelete = (id) => {
    const user = currentUser || JSON.parse(localStorage.getItem(USER_KEY));
    const target = ideas.find((i) => i.id === id);
    if (!target) return;
    if (!target.authorId || !user || target.authorId !== user.id) {
      alert("この投稿はあなたの投稿ではないため削除できません。");
      return;
    }
    // 削除ログに追加
    const rawLog = localStorage.getItem(DELETED_LOG_KEY);
    const logs = rawLog ? JSON.parse(rawLog) : [];
    const deletedAt = new Date().toISOString();
    logs.push({
      id: target.id,
      deletedAt,
      deleterId: user.id,
      snapshot: target,
    });
    localStorage.setItem(DELETED_LOG_KEY, JSON.stringify(logs));

    // remove from ideas
    const next = ideas.filter((i) => i.id !== id);
    saveIdeas(next);
  };

  const sortedIdeas = [...ideas].sort((a, b) => (sortMode === "popular" ? (b.likes?.count ?? 0) - (a.likes?.count ?? 0) : b.id - a.id));

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="sticky top-0 z-10 bg-indigo-600 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare size={22} /> コトハジメ（証跡対応版）
          </h1>
          <div className="text-xs opacity-90">投稿の履歴とタイムスタンプを保存します</div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {activeTab === "home" ? (
          <>
            <div className="flex bg-white rounded-lg p-1 border">
              <button onClick={() => setSortMode("new")} className={`flex-1 py-2 text-sm font-bold rounded-md ${sortMode === "new" ? "bg-indigo-50 text-indigo-600" : "text-slate-400"}`}>
                <Clock size={14} /> 新着
              </button>
              <button onClick={() => setSortMode("popular")} className={`flex-1 py-2 text-sm font-bold rounded-md ${sortMode === "popular" ? "bg-indigo-50 text-indigo-600" : "text-slate-400"}`}>
                <TrendingUp size={14} /> 人気
              </button>
            </div>

            {sortedIdeas.length === 0 ? (
              <p className="text-center text-slate-400 mt-10">まだアイデアがありません 🌱</p>
            ) : (
              sortedIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))
            )}
          </>
        ) : (
          <div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-black mb-6 text-slate-800">アイデアを公開</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400">タイトル</label>
                <input value={title} maxLength={TITLE_LIMIT} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-400" placeholder="あなたの「もしも」を一言で..." />
                <p className="text-right text-xs text-slate-400">{title.length}/{TITLE_LIMIT}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">内容</label>
                <textarea rows={5} value={content} maxLength={CONTENT_LIMIT} onChange={(e) => setContent(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-400" placeholder="詳しく教えてください..." />
                <p className="text-right text-xs text-slate-400">{content.length}/{CONTENT_LIMIT}</p>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
                <Send size={18} /> アイデアを公開する
              </button>
            </form>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center gap-1 ${activeTab === "home" ? "text-indigo-500" : "text-slate-300"}`}>
          <Home size={24} /><span className="text-xs font-bold">ホーム</span>
        </button>
        <button onClick={() => setActiveTab("post")} className={`flex flex-col items-center gap-1 ${activeTab === "post" ? "text-indigo-500" : "text-slate-300"}`}>
          <PlusCircle size={24} /><span className="text-xs font-bold">投稿</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
