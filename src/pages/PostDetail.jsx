import { useState, useEffect } from 'react';
import { storage, KEYS } from '../utils/storage';
import PostCard from '../components/feed/PostCard';

export default function PostDetail({ postId, navigate }) {
  const [post, setPost] = useState(null);

  useEffect(() => {
    const all = storage.get(KEYS.POSTS) || [];
    setPost(all.find(p => p.id === postId) || null);
  }, [postId]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2 className="font-bold font-poppins text-gray-900 dark:text-white">Post</h2>
      </div>

      {post
        ? <PostCard post={post} navigate={navigate} onUpdate={() => {
            const all = storage.get(KEYS.POSTS) || [];
            setPost(all.find(p => p.id === postId));
          }} />
        : <div className="flex items-center justify-center py-20"><p className="text-gray-500">Post not found</p></div>
      }
    </div>
  );
}
