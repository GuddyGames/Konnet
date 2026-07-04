import { useState } from 'react';
import { getUnreadNotifCount } from '../../utils/storage';
import { useUser } from '../../context/UserContext';
import GuddyAiChat from '../common/GuddyAiChat';


export default function TopNav({ navigate }) {
  const { darkMode, toggleDarkMode, currentUser } = useUser();
  const [aiOpen, setAiOpen] = useState(false);
  const unreadNotifs = getUnreadNotifCount(currentUser?.id);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-2xl font-black font-poppins gradient-text tracking-tight">Konnet</h1>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          {/* Dark mode */}
          <button onClick={toggleDarkMode} className="text-xl">
            {darkMode ? '️' : ''}
          </button>

          {/* Notifications */}
          <button onClick={() => navigate('notifications')} className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-800 dark:text-gray-200">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}
            </svg>
          </button>

          {/* Messages */}
          <button onClick={() => navigate('messages')} className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-800 dark:text-gray-200">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </button>

          {/* GuddyAi badge */}
          <button
            onClick={() => setAiOpen(o => !o)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-bold font-poppins"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
          >
            <span>✦</span>
            <span>GuddyAi</span>
          </button>
        </div>
      </header>

      {aiOpen && <GuddyAiChat onClose={() => setAiOpen(false)} />}
    </>
  );
}
