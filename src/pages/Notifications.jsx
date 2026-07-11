import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getUserNotifications, markAllNotificationsRead } from '../utils/firestoreNotifications';
import { formatTime } from '../utils/helpers';
import Avatar from '../components/common/Avatar';

export default function Notifications({ navigate }) {
  const { currentUser, getUserById } = useUser();
  const [notifs, setNotifs] = useState([]);
  const [fromUsers, setFromUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const all = await getUserNotifications(currentUser.id);
        setNotifs(all);

        // Resolve each notification's sender up front (async, can't await during render)
        const uniqueIds = [...new Set(all.map(n => n.fromId))];
        const entries = await Promise.all(
          uniqueIds.map(async id => [id, await getUserById(id)])
        );
        setFromUsers(Object.fromEntries(entries));

        // Mark everything as read now that they've opened the page
        await markAllNotificationsRead(currentUser.id);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const getIcon = (type) => {
    switch (type) {
      case 'like': return '\u2764\uFE0F';
      case 'comment': return '\uD83D\uDCAC';
      case 'follow': return '\uD83D\uDC64';
      case 'message': return '\u2709\uFE0F';
      default: return '\uD83D\uDD14';
    }
  };

  const getText = (notif) => {
    switch (notif.type) {
      case 'like': return 'liked your post';
      case 'comment': return `commented: "${notif.text}"`;
      case 'follow': return 'started following you';
      case 'message': return 'sent you a message';
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

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">Loading...</div>
      ) : notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-gray-500 font-semibold">No notifications yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {notifs.map(notif => {
            const from = fromUsers[notif.fromId];
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
                    <span className="font-semibold">{from.username}</span> {getText(notif)}
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
