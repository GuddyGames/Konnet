import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getAllPosts } from '../utils/firestorePosts';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileGrid from '../components/profile/ProfileGrid';
import BottomNav from '../components/navigations/BottomNav';

export default function Profile({ username, navigate }) {
  const { currentUser, getUserByUsername } = useUser();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const u = await getUserByUsername(username || currentUser?.username);
    setUser(u);
    if (u) {
      const allPosts = await getAllPosts();
      const userPosts = allPosts.filter(p => p.authorId === u.id);
      setPosts(userPosts);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [username, currentUser]);

  const isMe = currentUser?.id === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2 className="font-bold font-poppins text-gray-900 dark:text-white">{user.username}</h2>

        {isMe && (
          <button onClick={() => navigate('settings')} className="ml-auto text-gray-800 dark:text-gray-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        )}
      </div>

      <ProfileHeader user={user} posts={posts} navigate={navigate} onUpdate={load} />

      <div className="border-b border-gray-200 dark:border-slate-700" />

      <div className="flex justify-center py-3 border-b border-gray-200 dark:border-slate-700">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      </div>

      <ProfileGrid posts={posts} navigate={navigate} />

      <BottomNav activePage="profile" navigate={navigate} />
    </div>
  );
}
