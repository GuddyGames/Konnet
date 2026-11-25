import { useUser } from '../../context/UserContext';

const NAV = [
  { id: 'home', label: 'Home', icon: (active) => <svg aria-hidden="true" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg> },
  { id: 'messages', label: 'Messages', icon: () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5.5A4.5 4.5 0 0 1 8.5 1h7A4.5 4.5 0 0 1 20 5.5v4a4.5 4.5 0 0 1-4.5 4.5h-4l-5 3v-3.8A4.5 4.5 0 0 1 4 9.5z"/><circle cx="6" cy="18" r="3" /></svg> },
  { id: 'new-post', label: 'Create', icon: () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg> },
  { id: 'profile', label: 'Profile', icon: (active) => <svg aria-hidden="true" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg> },
  { id: 'notifications', label: 'Alerts', icon: () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9ZM10 21h4a2 2 0 0 1-4 0Z"/></svg> },
];

export default function BottomNav({ activePage, navigate }) {
  const { currentUser } = useUser();
  return (
    <nav aria-label="Main navigation" className="app-bottom-nav konnet-reference-nav fixed bottom-0 z-40 grid grid-cols-5 items-center">
      {NAV.map(({ id, label, icon }) => {
        const isActive = activePage === id;
        const isCreate = id === 'new-post';
        return (
          <button key={id} type="button" aria-label={label} aria-current={isActive ? 'page' : undefined}
            onClick={() => navigate(id === 'profile' ? `profile/${currentUser?.username}` : id)}
            className="konnet-reference-nav-item relative flex flex-col items-center justify-center gap-1">
            <span className={isCreate ? 'konnet-reference-create' : 'konnet-reference-nav-icon'}>{icon(isActive)}</span>
            {!isCreate && <span className="sr-only">{label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
