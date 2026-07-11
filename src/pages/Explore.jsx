import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { searchUsers } from '../utils/firestoreSearch';
import { getGradient } from '../utils/helpers';
import Avatar from '../components/common/Avatar';
import BottomNav from '../components/navigations/BottomNav';
import { getAllPosts } from '../utils/firestorePosts';

export default function Explore({ navigate }) {
  const { currentUser, getUserById } = useUser();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); 
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsloading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setPostsloading(true);
      try {
        const all = await getAllPosts();
        setPosts(all);
      } catch (err) {
        console.error('Failed to load explore postd:', err);
      } finally {
        setPostsloading(false);
      }
    };
    loadPosts();
  }, []);

  const handleSearch = async (value) => {
    setTerm(value);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const found = await searchUsers(value);
      setResults(found);
    }
    catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="pb-20 min-h-screen bg-white dark:bg-slate-900">
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
        <input
          value={term}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none"
        />
      </div>

      {/* Show search results when actively searching */}
      {term.trim() ? (
        loading ? (
          <div className="flex justify-center py-16 text-gray-400">Searching...</div>
        ) : searched && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-gray-500 font-semibold">No users found</p>
            <p className="text-gray-400 text-sm">Try a different username</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {results.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                onClick={() => navigate(`profile/${user.username}`)}
              >
                

              <Avatar user={user} size={48} />
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white font-poppins">{user.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.name}</p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Otherwise show the browsable post grid */
        postsLoading ? (
          <div className="flex justify-center py-16 text-gray-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="flex justify-center py-16 text-gray-400">No posts yet</div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map(post => (
              <div
                key={post.id}
                className="aspect-square cursor-pointer"
                onClick={() => navigate(`post/${post.id}`)}
              >
                {post.image ? (
                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-slate-700" />
                )}
              </div>
            ))}
          </div>
        )
      )}

      <BottomNav activePage="explore" navigate={navigate} />
    </div>
  );
}



