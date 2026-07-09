import { useState, useEffect } from 'react';
import { storage, KEYS } from '../../utils/storage';
import { useUser } from '../../context/UserContext';
import PostCard from './PostCard';

export default function Feed({ navigate }) {
  const { currentUser } = useUser();
  const [posts, setPosts] = useState([]);

  const loadPosts = () => {
    const all = storage.get(KEYS.POSTS) || [];
    console.log('ALL POSTS', all.length, all);
    console.log('CURRENT USER ID:', currentUser?.id);
    // Show posts from people you follow + your own, newest first
    const filtered = all.filter(p =>
      p.authorId === currentUser?.id ||
      currentUser?.following?.includes(p.authorId)
    );
    console.log('FILTERED:', filtered.length, filtered);
    // If following nobody, show all posts
    const toShow = filtered.length > 0 ? filtered : all;
    console.log('TO SHOW:', toShow.length);
    setPosts([...toShow].sort((a, b) => b.timestamp - a.timestamp));
  };

  useEffect(() => { loadPosts(); }, []);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-5xl"></div>
        <p className="text-gray-500 dark:text-gray-400 font-semibold text-center">
          No posts yet.<br />
          <span className="text-blue-500 cursor-pointer" onClick={() => navigate('explore')}>Explore</span> to find people to follow.
        </p>
      </div>
    );
  }

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} navigate={navigate} onUpdate={loadPosts} />
      ))}
    </div>
  );
}







