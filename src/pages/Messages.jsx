import { useState, useEffect, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { getUserConversations } from '../utils/supabaseMessages';
import { formatTime } from '../utils/helpers';
import Avatar from '../components/common/Avatar';
import PresenceDot from '../components/common/PresenceDot';

export default function Messages({ navigate }) {
  const { currentUser } = useUser();
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!currentUser?.id) { setLoading(false); return; }
      setLoading(true); setError('');
      try {
        const rows = await getUserConversations(currentUser.id);
        if (active) setConvos(rows);
      } catch (err) {
        console.error('Failed to load Supabase conversations:', err);
        if (active) setError('Could not load your messages. Please try again.');
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [currentUser?.id]);

  const filtered = useMemo(() => convos.filter(convo =>
    (convo.other?.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (convo.lastMessage || '').toLowerCase().includes(search.toLowerCase())
  ), [convos, search]);

  return (
    <main className="konnet-messages-page min-h-[100dvh] pb-[env(safe-area-inset-bottom)]">
      <header className="konnet-messages-header sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <h1 className="font-poppins text-[25px] font-bold tracking-tight">Chat</h1>
          <label className="konnet-chat-search flex min-w-0 flex-1 items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.8" cy="10.8" r="7.3"/><path d="m16.2 16.2 4.3 4.3"/></svg>
            <input aria-label="Search conversations" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" />
          </label>
          <button type="button" onClick={() => navigate('explore')} className="konnet-chat-add" aria-label="Start a new chat">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </header>

      {loading ? <div className="py-20 text-center text-sm text-slate-400">Loading messages...</div>
      : error ? <div className="flex flex-col items-center gap-3 py-20"><p className="text-sm text-red-500">{error}</p><button onClick={() => window.location.reload()} className="font-semibold text-blue-600">Retry</button></div>
      : filtered.length === 0 ? <div className="flex flex-col items-center gap-3 px-8 py-24 text-center"><div className="konnet-chat-empty-icon">✉</div><p className="font-semibold text-slate-700 dark:text-white">{search ? 'No matching conversations' : 'No messages yet'}</p><p className="text-sm text-slate-400">{search ? 'Try another name or keyword.' : "Visit someone's profile and tap Message to start a conversation."}</p>{!search && <button onClick={() => navigate('explore')} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Find people</button>}</div>
      : <section className="konnet-conversation-list" aria-label="Conversations">
          {filtered.map(convo => (
            <button type="button" key={convo.id} className="konnet-conversation-row" onClick={() => navigate(`chat/${convo.id}`)}>
              <span className="relative shrink-0"><Avatar user={convo.other} size={54}/><PresenceDot userId={convo.other.id}/></span>
              <span className="min-w-0 flex-1 text-left">
                <span className="flex items-center justify-between gap-2"><strong className="truncate text-[15px] font-semibold text-slate-900 dark:text-white">{convo.other.username}</strong><time className="shrink-0 text-[11px] text-slate-400">{formatTime(convo.lastTimestamp)}</time></span>
                <span className="mt-1 block truncate text-[13px] text-slate-500 dark:text-slate-400">{convo.lastMessage || 'Start a conversation'}</span>
              </span>
            </button>
          ))}
        </section>}
    </main>
  );
}
