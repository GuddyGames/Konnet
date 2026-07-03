import { useUser } from '../../context/UserContext';

const NAV = [
  { id: 'home', icon: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#2563EB' : 'none'} stroke={active ? '#2563EB' : 'currentColor'} strokeWidth="1.8">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
    </svg>
  )},
  { id: 'explore', icon: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : 'currentColor'} strokeWidth="1.8">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )},
  { id: 'new-post', icon: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  )},
  { id: 'reels', icon: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : 'currentColor'} strokeWidth="1.8">
      <rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="12" cy="12" r="3"/><line x1="2" y1="7" x2="22" y2="7"/>
    </svg>
  )},
  { id: 'profile', icon: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#2563EB' : 'none'} stroke={active ? '#2563EB' : 'currentColor'} strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )},
];

export default function BottomNav({ activePage, navigate }) {
  const { currentUser } = useUser();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 flex justify-around items-center py-2 pb-3 z-40">
      {NAV.map(({ id, icon }) => {
        const isActive = activePage === id;
        return (
          <button
            key={id}
            onClick={() => navigate(id === 'profile' ? `profile/${currentUser?.username}` : id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            } text-gray-600 dark:text-gray-400`}
          >
            {icon(isActive)}
          </button>
        );
      })}
    </nav>
  );
}
