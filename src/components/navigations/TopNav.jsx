import { useState, useEffect } from 'react';
import { getUnreadNotifCount } from '../../utils/firestoreNotifications';
import { useUser } from '../../context/UserContext';
import GuddyAiChat from '../common/GuddyAiChat';

export default function TopNav({ navigate }) {
  const { currentUser } = useUser();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    getUnreadNotifCount(currentUser.id).then(setUnreadNotifs).catch(() => setUnreadNotifs(0));
  }, [currentUser]);

  return (
    <>
      <header className="konnet-home-header sticky top-0 z-40 flex items-center justify-between px-4">
        <button type="button" onClick={() => setAiOpen(true)} aria-label="Open G^_^E Ai" className="konnet-header-action flex items-center gap-1.5 !w-auto px-2">
          <span className="font-poppins text-sm font-extrabold tracking-tight text-[#315DB4] dark:text-[#C6D2FF]">Ai</span>
        </button>
        <h1 className="font-poppins text-[21px] font-bold tracking-tight text-slate-900 dark:text-white">Explore</h1>
        <button type="button" onClick={() => navigate('explore')} aria-label="Search Konnet" className="konnet-header-action relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg>
        </button>
      </header>
      {aiOpen && <GuddyAiChat onClose={() => setAiOpen(false)} />}
    </>
  );
}
