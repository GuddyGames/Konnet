import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getUserConversations } from '../utils/firestoreMessages';
import { formatTime } from '../utils/helpers';
import Avatar from '../components/common/Avatar';
import PresenceDot from '../components/common/PresenceDot';

export default function Messages({ navigate }) {
  const { currentUser, getUserById } = useUser();
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const all = await getUserConversations(currentUser.id);
        // Resolve the "other" participant for each conversation up front,
        // since getUserById is async and can't be awaited inline during render.
        const withOthers = await Promise.all(all.map(async (c) => {
          const otherId = c.participants.find(id => id !== currentUser.id);
          const other = await getUserById(otherId);
          return { ...c, other };
        }));
        setConvos(withOthers.filter(c => c.other));
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2 className="font-bold font-poppins text-gray-900 dark:text-white flex-1">{currentUser?.username}</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">Loading...</div>
      ) : convos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-gray-500 font-semibold">No messages yet</p>
          <p className="text-gray-400 text-sm text-center">Start conversations with people you follow</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {convos.map(convo => (
            <div
              key={convo.id}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => navigate(`chat/${convo.id}`)}
            >
               <div className="relative">
                                  <Avatar user={convo.other} size={52} />
                                  <PresenceDot userId={convo.other.id} />
                      </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white font-poppins">{convo.other.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{convo.lastMessage}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(convo.lastTimestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
