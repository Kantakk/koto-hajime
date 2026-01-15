import {
  Clock,
  Heart,
  Home,
  MessageSquare,
  PlusCircle,
  Send,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

/* ====== 定数 ====== */
const TITLE_LIMIT = 40;
const CONTENT_LIMIT = 500;
const PREVIEW_LIMIT = 120;

/* ====== Utility ====== */
const truncateText = (text, limit) =>
  text.length <= limit ? text : text.slice(0, limit) + "…";

/* ====== Idea Card ====== */
const IdeaCard = ({ idea, onLike }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = idea.content.length > PREVIEW_LIMIT;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 transition-colors hover:border-indigo-200">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <User size={14} />
          {idea.author}・{idea.date}
        </div>
        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
          {idea.likes} 応援
        </div>
      </div>

      <h3 className="font-bold text-slate-900 mb-1">{idea.title}</h3>

      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
  {expanded
    ? idea.content
    : truncateText(idea.content, PREVIEW_LIMIT)}
</p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-indigo-500 hover:underline"
        >
          {expanded ? "閉じる" : "続きを読む"}
        </button>
      )}

      <button
        onClick={() => onLike(idea.id)}
        className="mt-4 w-full py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95"
      >
        <Heart size={16} />
        このアイデアを応援する
      </button>
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

  useEffect(() => {
    const saved = localStorage.getItem("kotohajime-ideas");
    if (saved) setIdeas(JSON.parse(saved));
  }, []);

  const saveIdeas = (data) => {
    setIdeas(data);
    localStorage.setItem("kotohajime-ideas", JSON.stringify(data));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newIdea = {
      id: Date.now(),
      title,
      content,
      author: "あなた",
      date: new Date().toLocaleDateString(),
      likes: 0,
    };

    saveIdeas([newIdea, ...ideas]);
    setTitle("");
    setContent("");
    setActiveTab("home");
  };

  const handleLike = (id) => {
    saveIdeas(
      ideas.map((i) =>
        i.id === id ? { ...i, likes: i.likes + 1 } : i
      )
    );
  };

  const sortedIdeas = [...ideas].sort((a, b) =>
    sortMode === "popular" ? b.likes - a.likes : b.id - a.id
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-indigo-500 text-white p-4 shadow-md">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <MessageSquare size={22} /> コトハジメ
        </h1>
      </header>

      {/* Main */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {activeTab === "home" ? (
          <>
            {/* Sort */}
            <div className="flex bg-white rounded-lg p-1 border">
              <button
                onClick={() => setSortMode("new")}
                className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-1 ${
                  sortMode === "new"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-400"
                }`}
              >
                <Clock size={14} /> 新着
              </button>
              <button
                onClick={() => setSortMode("popular")}
                className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-1 ${
                  sortMode === "popular"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-400"
                }`}
              >
                <TrendingUp size={14} /> 人気
              </button>
            </div>

            {sortedIdeas.length === 0 ? (
              <p className="text-center text-slate-400 mt-10">
                まだアイデアがありません 🌱
              </p>
            ) : (
              sortedIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onLike={handleLike}
                />
              ))
            )}
          </>
        ) : (
          /* Post */
          <div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-black mb-6 text-slate-800">
              アイデアを公開
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400">
                  タイトル
                </label>
                <input
                  value={title}
                  maxLength={TITLE_LIMIT}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <p className="text-right text-xs text-slate-400">
                  {title.length}/{TITLE_LIMIT}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">
                  内容
                </label>
                <textarea
                  rows={5}
                  value={content}
                  maxLength={CONTENT_LIMIT}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <p className="text-right text-xs text-slate-400">
                  {content.length}/{CONTENT_LIMIT}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <Send size={18} />
                アイデアを公開する
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3">
        <button
          onClick={() => setActiveTab("home")}
          className={activeTab === "home" ? "text-indigo-500" : "text-slate-300"}
        >
          <Home size={26} />
        </button>
        <button
          onClick={() => setActiveTab("post")}
          className={activeTab === "post" ? "text-indigo-500" : "text-slate-300"}
        >
          <PlusCircle size={26} />
        </button>
      </nav>
    </div>
  );
};

export default App;
