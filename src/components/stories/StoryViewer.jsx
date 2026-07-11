import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { markStoryViewed } from '../../utils/firestoreStories';
import Avatar from '../common/Avatar';

export default function StoryViewer({ story, onClose }) {
  const { author, stories } = story;
  const { currentUser } = useUser();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const current = stories[index];

  // Mark as viewed
  useEffect(() => {
    if (!currentUser || !current) return;
    if (!current.viewers?.includes(currentUser.id)) {
      markStoryViewed(current.id, currentUser.id).catch(err =>
        console.error('Failed to mark story viewed:', err)
      );
    }
  }, [index]);

  // Progress bar timer
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          if (index < stories.length - 1) setIndex(i => i + 1);
          else onClose();
          return 100;
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [index]);

  const handleTap = (e) => {
    const mid = window.innerWidth / 2;
    if (e.clientX < mid) {
      if (index > 0) setIndex(i => i - 1);
    } else {
      if (index < stories.length - 1) setIndex(i => i + 1);
      else onClose();
    }
  };

  return (
    <div
      className="animate-fadeIn fixed inset-0 z-50 flex flex-col cursor-pointer"
      style={{ background: current.image ? '#000' : current.color || 'linear-gradient(135deg, #1a1a2e, #533483)' }}
      onClick={handleTap}
    >
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-4 pb-2">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: i < index ? '100%' : i === index ? `${progress}%` : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Author info */}
      <div className="flex items-center gap-2 px-4 py-2">
        <Avatar user={author} size={36} />
        <span className="text-white font-semibold text-sm font-poppins">{author.username}</span>
        <button onClick={e => { e.stopPropagation(); onClose(); }} className="ml-auto text-white text-2xl leading-none opacity-80">&times;</button>
      </div>

      {/* Story content */}
      <div className="flex-1 flex items-center justify-center">
        {current.image
          ? <img src={current.image} alt="story" className="max-w-full max-h-full object-contain" />
          : <p className="text-white text-xl font-bold text-center px-8">{current.caption || `${author.name}'s Story`}</p>
        }
      </div>
    </div>
  );
}
