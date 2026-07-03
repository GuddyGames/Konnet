import { useState, useEffect } from 'react';
import { storage, KEYS } from '../../utils/storage';
import { useUser } from '../../context/UserContext';
import Avatar from '../common/Avatar';
import StoryViewer from './StoryViewer';

export default function StoriesBar({ navigate }) {
  const { currentUser, getUserById } = useUser();
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);

  useEffect(() => {
    const all = storage.get(KEYS.STORIES) || [];
    // Only show stories from last 24h
    const recent = all.filter(s => Date.now() - s.timestamp < 86400000);
    setStories(recent);
  }, []);

  // Group stories by author
  const byAuthor = stories.reduce((acc, s) => {
    if (!acc[s.authorId]) acc[s.authorId] = [];
    acc[s.authorId].push(s);
    return acc;
  }, {});

  const authorIds = Object.keys(byAuthor).filter(id => id !== currentUser?.id);
  const myStories = byAuthor[currentUser?.id] || [];
  const hasMyStory = myStories.length > 0;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 py-3">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4">
          {/* Your Story */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={() => navigate('new-story')}>
            <div className="relative">
              <div className={`rounded-full p-0.5 ${hasMyStory ? 'story-ring' : 'border-2 border-dashed border-gray-300 dark:border-gray-600'}`}>
                <Avatar user={currentUser} size={56} />
              </div>
              {!hasMyStory && (
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 max-w-14 text-center truncate">Your story</span>
          </div>

          {/* Others' stories */}
          {authorIds.map(authorId => {
            const author = getUserById(authorId);
            if (!author) return null;
            const viewed = byAuthor[authorId].every(s => s.viewers?.includes(currentUser?.id));
            return (
              <div key={authorId} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={() => setActiveStory({ author, stories: byAuthor[authorId] })}>
                <div className={`rounded-full p-0.5 ${viewed ? 'border-2 border-gray-300' : 'story-ring'}`}>
                  <Avatar user={author} size={56} />
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300 max-w-14 text-center truncate">{author.username}</span>
              </div>
            );
          })}
        </div>
      </div>

      {activeStory && <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />}
    </>
  );
}







