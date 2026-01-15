import {
  Home,
  MessageSquare,
  PlusCircle,
  Send,
  Star
} from 'lucide-react';
import { useEffect, useState } from 'react';

/* ===== ユーティリティ ===== */
const generateId = () =>
  crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const generateProofHash = (title, content, createdAt) =>
  btoa(unescape(encodeURIComponent(title + content + createdAt))).slice(0, 32);

/* ===== メイン ===== */
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [mode, setMode] = useState('creator'); // creator | business
  const [ideas, setIdeas] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  /* ===== 初期ロード ===== */
  useEffect(() => {
    setIdeas(JSON.parse(localStorage.getItem('ideas-v3') || '[]'));
    setFavorites(JSON.parse(localStorage.getItem('favorites-v1') || '[]'));
  }, []);

  useEffect(() => {
    localStorage.setItem('ideas-v3', JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    localStorage.setItem('favorites-v1', JSON.stringify(favorites));
  }, [favorites]);

  /* ===== 投稿 ===== */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) return;

    const createdAt = new Date().toISOString();
    const idea = {
      id: generateId(),
      title,
      content: content.slice(0, 300),
      author: 'あなた',
      createdAt,
      proofHash: generateProofHash(title, content, createdAt),
      likes: 0
    };

    setIdeas([idea, ...ideas]);
    setTitle('');
    setContent('');
    setActiveTab('home');
  };

  /* ===== いいね（3回制限） ===== */
  const handleLike = (id) => {
    setIdeas(ideas.map(i =>
      i.id === id && i.likes < 3 ? { ...i, likes: i.likes + 1 } : i
    ));
  };

  /* ===== お気に入り（企業） ===== */
  const toggleFavorite = (idea) => {
    setFavorites(prev =>
      prev.some(f => f.id === idea.id)
        ? prev.filter(f => f.id !== idea.id)
        : [...prev, idea]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* ===== ヘッダー ===== */}
      <header className="bg-indigo-100 p-4 flex justify-between items-center">
        <h1 className="font-bold flex gap-2 items-center text-indigo-700">
          <MessageSquare /> コトハジメ
        </h1>
        <button
          onClick={() => setMode(mode === 'creator' ? 'business' : 'creator')}
          className="text-xs px-3 py-1 rounded-full bg-white border"
        >
          {mode === 'creator' ? 'クリエイター' : 'ビジネス'}モード
        </button>
      </header>

      {/* ===== 注意文 ===== */}
      <p className="text-xs text-center text-slate-400 mt-2">
        ※現在β版です。投稿されたアイデアは予告なく削除・変更される可能性があります。
      </p>

      {/* ===== メイン ===== */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {activeTab === 'home' && ideas.map(idea => (
          <div key={idea.id} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{idea.author}</span>
              <span>{new Date(idea.createdAt).toLocaleString()}</span>
            </div>

            <h3 className="font-bold">{idea.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{idea.content}</p>

            {/* 証跡 */}
            <p className="text-[10px] text-slate-400 mt-2">
              証跡ID：{idea.proofHash}
            </p>

            {/* アクション */}
            <div className="flex gap-2 mt-3">
              {mode === 'creator' && (
                <button
                  onClick={() => handleLike(idea.id)}
                  className="flex-1 text-xs py-2 rounded bg-slate-100"
                >
                  ❤️ 応援 ({idea.likes}/3)
                </button>
              )}

              {mode === 'business' && (
                <button
                  onClick={() => toggleFavorite(idea)}
                  className="flex-1 text-xs py-2 rounded bg-amber-50"
                >
                  ⭐ お気に入り
                </button>
              )}
            </div>
          </div>
        ))}

        {/* ===== お気に入り一覧 ===== */}
        {activeTab === 'favorites' && (
          favorites.length === 0
            ? <p className="text-center text-slate-400">お気に入りなし</p>
            : favorites.map(f => (
              <div key={f.id} className="bg-white p-4 rounded-xl">
                <h3 className="font-bold">{f.title}</h3>
                <p className="text-sm">{f.content}</p>
              </div>
            ))
        )}

        {/* ===== 投稿 ===== */}
        {activeTab === 'post' && mode === 'creator' && (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl space-y-3">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="アイデアタイトル"
              className="w-full p-2 border rounded"
            />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="300文字以内"
              className="w-full p-2 border rounded"
            />
            <button className="w-full bg-indigo-600 text-white py-2 rounded">
              <Send size={16} className="inline mr-1" />
              アイデアを公開
            </button>
          </form>
        )}
      </main>

      {/* ===== ナビ ===== */}
      <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around p-3">
        <button onClick={() => setActiveTab('home')}><Home /></button>
        {mode === 'creator' && <button onClick={() => setActiveTab('post')}><PlusCircle /></button>}
        {mode === 'business' && <button onClick={() => setActiveTab('favorites')}><Star /></button>}
      </nav>
    </div>
  );
}
