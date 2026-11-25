import { useState, useEffect } from 'react';
import { getUnreadNotifCount } from '../../utils/firestoreNotifications';
import { getUnreadConversationCount } from '../../utils/firestoreMessages';
import { useUser } from '../../context/UserContext';
import GuddyAiChat from '../common/GuddyAiChat';

function IconButton({ label, onClick, children, count }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="konnet-icon-button relative">
      {children}
      {count > 0 && <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-bold text-white dark:border-slate-950">{count > 9 ? '9+' : count}</span>}
    </button>
  );
}

export default function TopNav({ navigate }) {
  const { currentUser } = useUser();
  const [aiOpen, setAiOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    getUnreadNotifCount(currentUser.id).then(setUnreadNotifs).catch(() => setUnreadNotifs(0));
    getUnreadConversationCount(currentUser.id).then(setUnreadMessages).catch(() => setUnreadMessages(0));
  }, [currentUser]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-100/80 bg-white/90 px-4 pb-3 pt-[calc(.75rem+env(safe-area-inset-top))] backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-black text-white shadow-md shadow-blue-600/20">K</div>
          <div className="min-w-0">
            <h1 className="font-poppins text-[21px] font-extrabold leading-6 tracking-tight text-slate-900 dark:text-white">Konnet</h1>
            <p className="text-[10px] font-medium tracking-wide text-slate-400">YOUR WORLD, CONNECTED</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="Notifications" onClick={() => navigate('notifications')} count={unreadNotifs}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10 21h4"/></svg>
          </IconButton>
          <IconButton label="Messages" onClick={() => navigate('messages')} count={unreadMessages}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-2 2V11.5A7.5 7.5 0 0 1 10.5 4H12a8 8 0 0 1 8 7.5z"/></svg>
          </IconButton>
          <button type="button" onClick={() => setAiOpen(true)} className="flex h-10 items-center gap-1.5 rounded-[14px] bg-gradient-to-br from-blue-600 to-violet-600 px-3 text-xs font-bold text-white shadow-md shadow-blue-600/20" aria-label="Open Guddy AI">
            <span className="text-sm">✦</span><span>AI</span>
          </button>
        </div>
      </header>
      {aiOpen && <GuddyAiChat onClose={() => setAiOpen(false)} />}
    </>
  );
}
