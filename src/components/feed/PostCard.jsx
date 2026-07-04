import { useState, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { storage, KEYS, addNotification } from '../../utils/storage';
import { formatTime, getGradient, genId } from '../../utils/helpers';
import Avatar from '../common/Avatar';

export default function PostCard({ post, navigate, onUpdate }) {
  const { currentUser, getUserById } = useUser();
  const author = getUserById(post.authorId);
  const isLiked = post.likes?.includes(currentUser?.id);
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [saved, setSaved] = useState(false);
  const lastTap = useRef(0);

  const toggleLike = () => {
    const posts = storage.get(KEYS.POSTS) || [];
    const updated = posts.map(p => {
      if (p.id !== post.id) return p;
      const newLikes = liked
        ? (p.likes || []).filter(id => id !== currentUser.id)
        : [...(p.likes || []), currentUser.id];
      return { ...p, likes: newLikes };
    });
    storage.set(KEYS.POSTS, updated);
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);
    onUpdate?.();
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) { toggleLike(); }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTap.current = now;
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    addNotification(author.id, { type: 'comment', fromID: currentUser.id, postId: post.id, text: newComment.text });
    const newComment = { id: genId(), authorId: currentUser.id, text: commentText.trim(), timestamp: Date.now() };
    const posts = storage.get(KEYS.POSTS) || [];
    const updated = posts.map(p =>
      p.id === post.id ? { ...p, comments: [...(p.comments || []), newComment] } : p
    );
    storage.set(KEYS.POSTS, updated);
    setComments(c => [...c, newComment]);
    setCommentText('');
    onUpdate?.();
  };

  if (!author) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 animate-fadeSlideIn">
      {/* Header */}
      <div className="flex items-center px-3 py-2.5 gap-2.5">
        <div className="cursor-pointer" onClick={() => navigate(`profile/${author.username}`)}>
          <div className="story-ring p-0.5 rounded-full">
            <Avatar user={author} size={34} />
          </div>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900 dark:text-white font-poppins cursor-pointer" onClick={() => navigate(`profile/${author.username}`)}>{author.username}</p>
          <p className="text-xs text-gray-400">{formatTime(post.timestamp)}</p>
        </div>
        <button className="text-gray-500">•••</button>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-square cursor-pointer" onClick={handleDoubleTap}>
        {post.image
          ? <img src={post.image} alt="post" className="w-full h-full object-cover" />
          : <div className="w-full h-full" style={{ background: getGradient(post.gradientIndex || 0) }} />
        }
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center animate-heartPop pointer-events-none">
            <span className="text-8xl">️</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 py-2">
        <div className="flex items-center mb-2">
          <div className="flex gap-4 flex-1">
            <button onClick={toggleLike} className="transition-transform active:scale-90">
              {liked
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              }
            </button>
            <button onClick={() => setShowComments(s => !s)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </button>
            <button onClick={async () => {
              const url = `${window.location.origin}?post=${post.id} `;
              try {
                if (navigator.share) {
                  await navigator.share({ title: `Check out this post on Konnet`, url });
                } else {
                  await navigator.clipboard.writeText(url);
                  alert('Link copied!');
                }
              } catch (err) {
                console.error('Share failed: ', err);
              }
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <button onClick={() => setSaved(s => !s)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          </button>
        </div>

        {/* Likes */}
        <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{likeCount.toLocaleString()} likes</p>

        {/* Caption */}
        <p className="text-sm text-gray-900 dark:text-white">
          <span className="font-semibold mr-1 cursor-pointer" onClick={() => navigate(`profile/${author.username}`)}>{author.username}</span>
          {post.caption}
        </p>

        {/* View comments */}
        {comments.length > 0 && (
          <button className="text-sm text-gray-400 mt-1" onClick={() => setShowComments(s => !s)}>
            View all {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </button>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="mt-2 space-y-1.5 animate-fadeSlideIn">
            {comments.map(c => {
              const cAuthor = getUserById(c.authorId);
              return (
                <p key={c.id} className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-semibold">{cAuthor?.username || 'user'}</span>{' '}{c.text}
                </p>
              );
            })}
          </div>
        )}

        {/* Comment input */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-slate-800">
          <Avatar user={currentUser} size={24} />
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addComment()}
            placeholder="Add a comment..."
            className="flex-1 text-sm text-gray-800 dark:text-white bg-transparent outline-none placeholder-gray-400"
          />
          {commentText.trim() && (
            <button onClick={addComment} className="text-blue-600 font-semibold text-sm">Post</button>
          )}
        </div>
      </div>
    </div>
  );
}







