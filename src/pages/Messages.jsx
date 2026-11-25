import { useState, useEffect } from 'react';
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

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!currentUser?.id) { setLoading(false); return; }
      setLoading(true);
      setError('');
      try {
        const rows = await getUserConversations(currentUser.id);
        if (active) setConvos(rows);
      } catch (err) {
        console.error('Failed to load Supabase conversations:', err);
        if (active) setError('Could not load your messages. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [currentUser?.id]);

  return (
    <div className="min-h-[100dvh] bg-[#F5F7FB] pb-[env(safe-area-inset-bottom)] dark:bg-[#0B1020]">
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-100 bg-white/95 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
        <button onClick={() => navigate('home')} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 className="flex-1 font-poppins text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{currentUser?.username}</h2>
      </div>
      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">Loading messages...</div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-3"><p className="text-sm text-red-500">{error}</p><button onClick={() => window.location.reload()} className="text-blue-600 font-semibold">Retry</button></div>
      ) : convos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-gray-500 font-semibold">No messages yet</p>
          <p className="text-gray-400 text-sm text-center">Visit someone's profile and tap Message to start a conversation.</p>
        </div>
      ) : (
        <div className="mx-3 mt-3 overflow-hidden rounded-[22px] border border-slate-100 bg-white px-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {convos.map(convo => (
            <div key={convo.id} className="flex w-full items-center gap-3 rounded-xl px-1 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => navigate(`chat/${convo.id}`)}>
              <div className="relative"><Avatar user={convo.other} size={52}/><PresenceDot userId={convo.other.id}/></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] text-slate-900 dark:text-white font-poppins">{convo.other.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{convo.lastMessage}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(convo.lastTimestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
