import { useUser } from '../../context/UserContext';

const NAV = [
  { id: 'home', label: 'Home', icon: (active) => (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>
  )},
  { id: 'explore', label: 'Explore', icon: () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.8" cy="10.8" r="7.3"/><path d="m16.2 16.2 4.3 4.3"/></svg>
  )},
  { id: 'new-post', label: 'Create', icon: () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
  )},
  { id: 'reels', label: 'Reels', icon: () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="m10 8 6 4-6 4zM3 8h18"/></svg>
  )},
  { id: 'profile', label: 'Profile', icon: (active) => (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>
  )},
];

export default function BottomNav({ activePage, navigate }) {
  const { currentUser } = useUser();

  return (
    <nav aria-label="Main navigation" className="app-bottom-nav fixed bottom-0 z-40 grid grid-cols-5 items-center border-t backdrop-blur-2xl">
      {NAV.map(({ id, label, icon }) => {
        const isActive = activePage === id;
        const isCreate = id === 'new-post';
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => navigate(id === 'profile' ? `profile/${currentUser?.username}` : id)}
            className={`konnet-nav-item relative flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors ${isActive ? '' : ''}`}
          >
            {isCreate ? (
              <span className="konnet-nav-create">{icon(false)}</span>
            ) : (
              <span className="konnet-nav-icon">{icon(isActive)}</span>
            )}
            <span>{label}</span>
            {isActive && !isCreate && <span className="absolute bottom-0 h-1 w-1 rounded-full bg-current" />}
          </button>
        );
      })}
    </nav>
  );
}
