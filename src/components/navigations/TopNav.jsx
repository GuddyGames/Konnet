import { useState, useEffect } from 'react';
import { getUnreadNotifCount } from '../../utils/firestoreNotifications';
import { useUser } from '../../context/UserContext';

export default function TopNav({ navigate }) {
  const { currentUser } = useUser();
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    getUnreadNotifCount(currentUser.id).then(setUnreadNotifs).catch(() => setUnreadNotifs(0));
  }, [currentUser]);

  return (
    <header className="konnet-home-header sticky top-0 z-40 flex items-center justify-between px-4">
      <button type="button" onClick={() => navigate('new-story')} aria-label="Create a story" className="konnet-header-action">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.3-2h4.4l1.3 2h2A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.2"/></svg>
      </button>
      <h1 className="font-poppins text-[21px] font-bold tracking-tight text-slate-900 dark:text-white">Explore</h1>
      <button type="button" onClick={() => navigate('explore')} aria-label="Search Konnet" className="konnet-header-action relative">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg>
      </button>
    </header>
  );
}
