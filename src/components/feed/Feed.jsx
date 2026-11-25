import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import PostCard from './PostCard';

export default function Feed({ navigate }) {
  const { currentUser } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    setError('');

    try {
      // Konnet's active database is Supabase. Do not query the old Firebase
      // collection after the fresh-start migration.
      const { data, error: queryError } = await supabase
        .from('posts')
        .select('id, author_id, caption, created_at, visibility')
        .order('created_at', { ascending: false })
        .limit(50);

      if (queryError) throw queryError;

      const mappedPosts = (data || []).map((post) => ({
        id: post.id,
        authorId: post.author_id,
        caption: post.caption || '',
        timestamp: post.created_at ? new Date(post.created_at).getTime() : Date.now(),
        image: null,
        likes: [],
        comments: [],
        gradientIndex: 0,
      }));

      setPosts(mappedPosts);
    } catch (err) {
      console.error('Failed to load Supabase posts:', err);
      setError('We couldn’t load the feed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [currentUser?.id]);

  if (loading) {
    return <div className="flex justify-center px-4 py-20 text-sm text-gray-400" role="status">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <button type="button" onClick={loadPosts} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Try again</button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-20">
        <p className="text-center font-semibold text-gray-500 dark:text-gray-400">
          Your feed is quiet for now.
        </p>
        <p className="text-center text-sm text-gray-400">Explore Konnet and find people to connect with.</p>
        <button type="button" onClick={() => navigate('explore')} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Explore people</button>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} navigate={navigate} onUpdate={loadPosts} />
      ))}
    </div>
  );
}
