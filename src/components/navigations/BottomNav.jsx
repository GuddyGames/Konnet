import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import { getUnreadNotifCount } from '../../utils/supabaseNotifications';

const NAV = [
  { id: 'home', label: 'Home', icon: active => <svg aria-hidden="true" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg> },
  { id: 'explore', label: 'Search', icon: () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.8" cy="10.8" r="7.2"/><path d="m16.2 16.2 4.3 4.3"/></svg> },
  { id: 'messages', label: 'Messages', icon: () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.3 9.8 9.8 0 0 1-4-.8L3 21l1.5-4.1A8 8 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.3 8.4 8.4 0 0 1 9 8.3Z"/></svg> },
  { id: 'profile', label: 'Profile', icon: active => <svg aria-hidden="true" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg> },
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

  const isProfile = activePage === 'profile' || String(activePage || '').startsWith('profile/');
  return (
    <nav aria-label="Main navigation" className="app-bottom-nav konnet-reference-nav fixed bottom-0 z-40">
      {NAV.slice(0, 2).map(({ id, label, icon }) => (
        <button key={id} type="button" aria-label={label} aria-current={activePage === id ? 'page' : undefined}
          onClick={() => navigate(id)} className="konnet-reference-nav-item">
          <span className="konnet-reference-nav-icon">{icon(activePage === id)}</span>
          <span className="konnet-reference-nav-label">{label}</span>
        </button>
      ))}

      <div className="konnet-reference-center">
        <button type="button" aria-label="Upload a post" onClick={() => navigate('new-post')} className="konnet-reference-create">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <button type="button" aria-label="Open Reels" aria-current={activePage === 'reels' ? 'page' : undefined}
          onClick={() => navigate('reels')} className={'konnet-reference-reels' + (activePage === 'reels' ? ' active' : '')}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="m10 8 6 4-6 4z"/></svg>
          <span>Reels</span>
        </button>
      </div>

      {NAV.slice(2).map(({ id, label, icon }) => {
        const active = id === 'profile' ? isProfile : activePage === id;
        return (
          <button key={id} type="button" aria-label={label} aria-current={active ? 'page' : undefined}
            onClick={() => navigate(id === 'profile' ? `profile/${currentUser?.username}` : id)}
            className="konnet-reference-nav-item">
            <span className="konnet-reference-nav-icon">
              {icon(active)}
              {id === 'notifications' && unreadCount > 0 && <span aria-label={unreadCount + ' unread notifications'} className="absolute right-0 top-0 h-[9px] w-[9px] rounded-full bg-red-500" />}
            </span>
            <span className="konnet-reference-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
