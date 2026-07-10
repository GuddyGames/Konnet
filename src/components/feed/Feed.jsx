import { useState, useEffect } from 'react';
import { getAllPosts } from '../../utils/firestorePosts';
import { useUser } from '../../context/UserContext';
import PostCard from './PostCard';

export default function Feed({ navigate }) {
  const { currentUser } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const all = await getAllPosts();
      const filtered = all.filter(p =>
        p.authorId === currentUser?.id ||
        currentUser?.following?.includes(p.authorId)
      );
      setPosts(filtered.length > 0 ? filtered : all);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, [currentUser]);

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Loading posts...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
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
