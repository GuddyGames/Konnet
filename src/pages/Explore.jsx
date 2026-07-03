import { useState, useEffect } from 'react';
import { storage, KEYS } from '../utils/storage';
import { useUser } from '../context/UserContext';
import { getGradient } from '../utils/helpers';
import Avatar from '../components/common/Avatar';
import BottomNav from '../components/navigations/BottomNav';

export default function Explore({ navigate }) {
  const { currentUser, getUserById } = useUser();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('grid'); // 'grid' | 'people'

  useEffect(() => {
    const allPosts = storage.get(KEYS.POSTS) || [];
    setPosts(allPosts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)));

    const allUsers = storage.get(KEYS.USERS) || {};
    setUsers(Object.values(allUsers).filter(u => u.id !== currentUser?.id));
  }, []);

  const filteredUsers = users.filter(u =>
    u.username.includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPosts = posts.filter(p => {
    const author = getUserById(p.authorId);
    return p.caption?.toLowerCase().includes(search.toLowerCase()) ||
           author?.username?.includes(search.toLowerCase());
  });

  return (
    <div className="pb-20 min-h-screen bg-white dark:bg-slate-900">
      {/* Search bar */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl px-3 py-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search people, posts..."
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white outline-none placeholder-gray-400"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-3">
          {['grid', 'people'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm font-semibold pb-1 border-b-2 transition-colors capitalize ${
                tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'
              }`}
            >
              {t === 'grid' ? 'Posts' : 'People'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'grid' ? (
        <div className="grid grid-cols-3 gap-0.5">
          {filteredPosts.map((post, i) => (
            <div
              key={post.id}
              className="aspect-square cursor-pointer overflow-hidden relative"
              style={{ background: post.image ? undefined : getGradient(post.gradientIndex || i) }}
              onClick={() => navigate(`post/${post.id}`)}
            >
              {post.image && <img src={post.image} alt="post" className="w-full h-full object-cover" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
              onClick={() => navigate(`profile/${user.username}`)}
            >
              <Avatar user={user} size={48} />
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900 dark:text-white font-poppins">{user.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.name}</p>
                <p className="text-xs text-gray-400">{user.followers?.length || 0} followers</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav activePage="explore" navigate={navigate} />
    </div>
  );
}



