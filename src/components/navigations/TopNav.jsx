import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import Avatar from '../common/Avatar';
import GuddyAiChat from '../common/GuddyAiChat';

export default function TopNav({ navigate }) {
  const { currentUser } = useUser();
  const [aiOpen, setAiOpen] = useState(false);
  return (
    <>
      <header className="konnet-home-header flex items-center justify-between px-5">
        <button type="button" onClick={() => navigate('profile/' + currentUser?.username)} aria-label="Open profile" className="rounded-full">
          <Avatar user={currentUser} size={52} />
        </button>
        <button type="button" onClick={() => navigate('notifications')} aria-label="Notifications" className="konnet-home-bell">
          <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9ZM10 21h4a2 2 0 0 1-4 0Z"/></svg>
        </button>
        <button type="button" onClick={() => setAiOpen(true)} className="sr-only">Open Ai</button>
      </header>
      {aiOpen && <GuddyAiChat onClose={() => setAiOpen(false)} />}
    </>
  );
}
