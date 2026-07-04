import { useState, useEffect } from 'react';
import { storage, KEYS } from '../utils/storage';
import { useUser } from '../context/UserContext';
import { formatTime } from '../utils/helpers';
import Avatar from '../components/common/Avatar';

export default function Notifications({ navigate }) {
  const { currentUser, getUserById } = useUser();
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    const all = storage.get(KEYS.NOTIFICATIONS) || [];
    const mine = all.filter(n => n.toId === currentUser?.id);
    setNotifs(mine.sort((a, b) => b.timestamp - a.timestamp));

    // Mark all as read
    const updated = all.map(n => ({ ...n, read: true }));
    storage.set(KEYS.NOTIFICATIONS, updated);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'like': return '️';
      case 'comment': return '';
      case 'follow': return '';
      default: return '';
    }
  };

  const getText = (notif) => {
    switch (notif.type) {
      case 'like': return 'liked your post';
      case 'comment': return `commented: "${notif.text}"`;
      case 'follow': return 'started following you';
      default: return 'interacted with you';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2 className="font-bold font-poppins text-gray-900 dark:text-white">Notifications</h2>
      </div>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-5xl"></div>
          <p className="text-gray-500 font-semibold">No notifications yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {notifs.map(notif => {
            const from = getUserById(notif.fromId);
            if (!from) return null;
            return (
              <div
                key={notif.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  !notif.read ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => {
                  if (notif.type === 'follow') navigate(`profile/${from.username}`);
                  else if (notif.postId) navigate(`post/${notif.postId}`);
                }}
              >
                <div className="relative">
                  <Avatar user={from} size={44} />
                  <span className="absolute -bottom-1 -right-1 text-base">{getIcon(notif.type)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-semibold">{from.username}</span>{' '}{getText(notif)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatTime(notif.timestamp)}</p>
                </div>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
