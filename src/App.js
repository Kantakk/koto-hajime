import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
// アイコンのインポート（npm install lucide-react が必要です）
import { Briefcase, Heart, Home, Lightbulb, MessageSquare, Palette, PlusCircle, Search, Send, Trash2 } from 'lucide-react';

function App() {
  const [ideas, setIdeas] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('その他');
  const [mode, setMode] = useState('creator'); // 'creator' or 'business'
  const [showModal, setShowModal] = useState(false);

  // 1. データを読み込む機能
  const fetchIdeas = async () => {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('エラー:', error);
    else setIdeas(data);
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  // 2. データを保存する機能
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('ideas')
      .insert([{ title, content, categories: category, author: 'あなた' }]);

    if (error) {
      alert('エラー: ' + error.message);
    } else {
      setTitle('');
      setContent('');
      setShowModal(false);
      fetchIdeas();
    }
  };

  // 3. データを削除する機能
  const deleteIdea = async (id) => {
    const { error } = await supabase.from('ideas').delete().eq('id', id);
    if (error) console.error(error);
    else fetchIdeas();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24">
      {/* ヘッダー：アイデアギッシュなイエロー */}
      <header className="bg-yellow-400 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-xl shadow-sm">
              <Lightbulb className="text-yellow-500 fill-yellow-500" size={20} />
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tighter">コトハジメ</h1>
          </div>

          {/* モード切替：以前のデザインのアイコンを追加 */}
          <div className="bg-yellow-500/20 p-1 rounded-full flex gap-1 border border-yellow-500/10">
            <button
              onClick={() => setMode('creator')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                mode === 'creator' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Palette size={14} />
              クリエイター
            </button>
            <button
              onClick={() => setMode('business')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                mode === 'business' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Briefcase size={14} />
              ビジネス
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 mt-4">
        {/* 検索バー */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="何か新しいコト、探す？"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none bg-white text-sm"
          />
        </div>

        {/* 投稿一覧 */}
        <div className="space-y-6">
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative group">
               <div className="flex items-center gap-2 mb-3">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {idea.categories || 'その他'}
                  </span>
                  <span className="text-gray-300 text-[10px] italic">#{idea.id}</span>
               </div>
               <h3 className="text-lg font-bold mb-2 text-gray-800 leading-tight">{idea.title}</h3>
               <p className="text-gray-500 text-sm leading-relaxed mb-6">{idea.content}</p>
               
               <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex gap-4">
                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors group">
                      <Heart size={18} className="group-hover:fill-red-400" />
                      <span className="text-xs font-bold">応援</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-yellow-500 transition-colors">
                      <MessageSquare size={18} />
                      <span className="text-xs font-bold">貢献</span>
                    </button>
                  </div>
                  <button onClick={() => deleteIdea(idea.id)} className="text-gray-200 hover:text-red-400 p-1">
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </main>

      {/* 投稿用ボタン（右下固定） */}
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-6 bg-yellow-400 text-gray-900 p-4 rounded-2xl shadow-xl hover:scale-110 transition-transform z-20 border-2 border-white"
      >
        <PlusCircle size={28} />
      </button>

      {/* 投稿モーダル（簡易版） */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Send className="text-yellow-500" />
              アイデアを放つ
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400" 
                placeholder="タイトル" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
              <textarea 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400 h-32" 
                placeholder="どんなコトをはじめる？" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                required 
              />
              <div className="flex gap-2 flex-wrap">
                {['AI', 'ビジネス', 'その他'].map(cat => (
                  <button 
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold ${category === cat ? 'bg-yellow-400' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-yellow-400 py-4 rounded-2xl font-black hover:bg-yellow-500 transition-colors">公開する</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-4 text-gray-400 font-bold">やめる</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 下部ナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-8 py-3 flex justify-around items-center z-10">
        <button className="flex flex-col items-center gap-1 text-yellow-500">
          <Home size={22} />
          <span className="text-[10px] font-black">HOME</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-300 hover:text-yellow-500 transition-colors">
          <Search size={22} />
          <span className="text-[10px] font-black">EXPLORE</span>
        </button>
      </nav>
    </div>
  );
}

export default App;