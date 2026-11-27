import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import { getUnreadNotifCount } from '../../utils/supabaseNotifications';

const NAV = [
  { id: 'home', label: 'Home', icon: (active) => <svg aria-hidden="true" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg> },
  { id: 'explore', label: 'Search', icon: () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.8" cy="10.8" r="7.2"/><path d="m16.2 16.2 4.3 4.3"/></svg> },
  { id: 'messages', label: 'Messages', icon: () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.3 9.8 9.8 0 0 1-4-.8L3 21l1.5-4.1A8 8 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.3 8.4 8.4 0 0 1 9 8.3Z"/></svg> },
  { id: 'new-post', label: 'Create', icon: () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg> },
  { id: 'profile', label: 'Profile', icon: (active) => <svg aria-hidden="true" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg> },
];

export default function BottomNav({ activePage, navigate }) {
  const { currentUser } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (!currentUser?.id) { setUnreadCount(0); return undefined; }
    let active = true;
    const refresh = async () => {
      try { const count = await getUnreadNotifCount(currentUser.id); if (active) setUnreadCount(count); }
      catch (error) { console.error('Unread notification count failed:', error); }
    };
    refresh();
    const channel = supabase.channel('konnet-nav-notifications-' + currentUser.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: 'recipient_id=eq.' + currentUser.id }, refresh)
      .subscribe();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => { active = false; window.removeEventListener('focus', onFocus); supabase.removeChannel(channel); };
  }, [currentUser?.id]);
  return (
    <nav aria-label="Main navigation" className="app-bottom-nav konnet-reference-nav fixed bottom-0 z-40 grid grid-cols-5 items-center">
      {NAV.map(({ id, label, icon }) => {
        const isActive = activePage === id;
        const isCreate = id === 'new-post';
        return (
          <button key={id} type="button" aria-label={label} aria-current={isActive ? 'page' : undefined}
            onClick={() => navigate(id === 'profile' ? `profile/${currentUser?.username}` : id)}
            className="konnet-reference-nav-item relative flex flex-col items-center justify-center gap-1">
            <span className={isCreate ? 'konnet-reference-create' : 'konnet-reference-nav-icon'}>{icon(isActive)}{id === 'notifications' && unreadCount > 0 && <span aria-label={unreadCount + ' unread notifications'} className="absolute right-[calc(50%-20px)] top-1 h-[10px] w-[10px] rounded-full border-2 border-[#526FC5] bg-red-500 shadow-sm" />}</span>
            {!isCreate && <span className="konnet-reference-nav-label">{label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
