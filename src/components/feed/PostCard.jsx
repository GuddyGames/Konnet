import { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { formatTime, getGradient, genId } from '../../utils/helpers';
import { toggleLikePost, addCommentToPost } from '../../utils/firestorePosts';
import { addNotification } from '../../utils/firestoreNotifications';
import Avatar from '../common/Avatar';

const Icon = ({ children }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{children}</svg>;

export default function PostCard({ post, navigate, onUpdate }) {
  const { currentUser, getUserById } = useUser();
  const [author, setAuthor] = useState(null);
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?.id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [commentAuthors, setCommentAuthors] = useState({});
  const [saved, setSaved] = useState(false);
  const lastTap = useRef(0);

  useEffect(() => {
    let active = true;
    getUserById(post.authorId).then(u => { if (active) setAuthor(u); });
    return () => { active = false; };
  }, [post.authorId]);

  useEffect(() => {
    let active = true;
    const loadCommentAuthors = async () => {
      const uniqueIds = [...new Set(comments.map(c => c.authorId))];
      const entries = await Promise.all(uniqueIds.map(async id => [id, await getUserById(id)]));
      if (active) setCommentAuthors(Object.fromEntries(entries));
    };
    if (comments.length > 0) loadCommentAuthors();
    return () => { active = false; };
  }, [comments]);

  const toggleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    try {
      await toggleLikePost(post.id, currentUser.id, wasLiked);
      if (!wasLiked && author) await addNotification(author.id, { type: 'like', fromId: currentUser.id, postId: post.id });
      onUpdate?.();
    } catch (err) {
      console.error('Failed to toggle like:', err);
      setLiked(wasLiked);
      setLikeCount(c => wasLiked ? c + 1 : c - 1);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) toggleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTap.current = now;
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    const newComment = { id: genId(), authorId: currentUser.id, text: commentText.trim(), timestamp: Date.now() };
    try {
      await addCommentToPost(post.id, newComment);
      if (author) await addNotification(author.id, { type: 'comment', fromId: currentUser.id, postId: post.id, text: newComment.text });
      setComments(c => [...c, newComment]);
      setCommentText('');
      onUpdate?.();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}?post=${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Check out this post on Konnet', url });
      else { await navigator.clipboard.writeText(url); alert('Link copied!'); }
    } catch (err) { console.error('Share failed:', err); }
  };

  if (!author) return null;

  return (
    <article className="konnet-post-card animate-fadeSlideIn">
      <div className="konnet-post-media relative w-full cursor-pointer overflow-hidden" onClick={handleDoubleTap}>
        {post.image
          ? <img src={post.image} alt="Post by user" className="h-full w-full object-cover" onError={event => { event.currentTarget.style.display = 'none'; }} />
          : <div className="konnet-post-image-fallback" />}
        {showHeart && <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"><span className="text-8xl">❤️</span></div>}
        <div className="konnet-post-shade" />
        <div className="konnet-post-author">
          <button type="button" onClick={event => { event.stopPropagation(); navigate(`profile/${author.username}`); }} className="shrink-0">
            <Avatar user={author} size={48} />
          </button>
          <button type="button" onClick={event => { event.stopPropagation(); navigate(`profile/${author.username}`); }} className="min-w-0 text-left">
            <span className="block truncate font-poppins text-[15px] font-bold leading-5">{author.name || author.username}</span>
            <span className="block truncate text-xs opacity-80">@{author.username}</span>
          </button>
          <span className="konnet-post-time">{formatTime(post.timestamp)}</span>
        </div>
        {post.caption && <p className="konnet-post-caption">{post.caption}</p>}
        <div className="konnet-post-overlay">
          <button type="button" onClick={event => { event.stopPropagation(); toggleLike(); }} aria-label={liked ? 'Unlike post' : 'Like post'}>
            <Icon><path fill={liked ? 'currentColor' : 'none'} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></Icon><span>{likeCount}</span>
          </button>
          <button type="button" onClick={event => { event.stopPropagation(); handleShare(); }} aria-label="Share post">
            <Icon><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/></Icon><span>Share</span>
          </button>
          <button type="button" onClick={event => { event.stopPropagation(); setShowComments(value => !value); }} aria-label="Comments">
            <Icon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Icon><span>{comments.length}</span>
          </button>
        </div>
      </div>
      {showComments && (
        <div className="px-3 pb-3 pt-2">
          {comments.map(comment => <p key={comment.id} className="py-1 text-sm"><strong>{commentAuthors[comment.authorId]?.username || 'user'}</strong> {comment.text}</p>)}
          <div className="mt-2 flex items-center gap-2 border-t border-slate-200 pt-2">
            <Avatar user={currentUser} size={28}/>
            <input value={commentText} onChange={event => setCommentText(event.target.value)} onKeyDown={event => event.key === 'Enter' && addComment()} placeholder="Add a comment…" className="min-w-0 flex-1 bg-transparent text-sm outline-none"/>
            {commentText.trim() && <button type="button" onClick={addComment} className="text-sm font-semibold text-[#315DB4]">Post</button>}
          </div>
        </div>
      )}
    </article>
  );
}
