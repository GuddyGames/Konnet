import { useState, useEffect } from 'react';
import { listenToUserPresence } from '../../utils/firestorePresence';

// Drop this next to any <Avatar> to show a live "online now" green dot.
// The parent element needs className="relative" for positioning to work,
// e.g.: <div className="relative"><Avatar user={user} size={44} /><PresenceDot userId={user.id} /></div>
export default function PresenceDot({ userId }) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!userId) return;
    return listenToUserPresence(userId, setOnline);
  }, [userId]);

  if (!online) return null;

  return (
    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse-soft" />
  );
}
