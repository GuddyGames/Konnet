import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { getActiveStories } from '../../utils/firestoreStories';
import Avatar from '../common/Avatar';
import StoryViewer from './StoryViewer';

export default function StoriesBar({ navigate }) {
  const { currentUser, getUserById } = useUser();
  const [byAuthor, setByAuthor] = useState({}); // { authorId: [stories] }
  const [authors, setAuthors] = useState({});   // { authorId: userProfile }
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const stories = await getActiveStories();

      // Group stories by author
      const grouped = stories.reduce((acc, s) => {
        if (!acc[s.authorId]) acc[s.authorId] = [];
        acc[s.authorId].push(s);
        return acc;
      }, {});
      setByAuthor(grouped);

      // Resolve each author's profile up front (async, can't do inline during render)
      const authorIds = Object.keys(grouped);
      const entries = await Promise.all(
        authorIds.map(async id => [id, await getUserById(id)])
      );
      setAuthors(Object.fromEntries(entries.filter(([, u]) => u)));
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (currentUser) load(); }, [currentUser]);

  if (loading || !currentUser) return null;

  const myStories = byAuthor[currentUser.id] || [];
  const hasMyStory = myStories.length > 0;
  const otherAuthorIds = Object.keys(byAuthor).filter(id => id !== currentUser.id);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 py-3">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4">
          {/* Your story */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={() => {
            if (hasMyStory) setActiveStory({ author: currentUser, stories: myStories });
            else navigate('new-story');
          }}>
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
          {otherAuthorIds.map(authorId => {
            const author = authors[authorId];
            if (!author) return null;
            const authorStories = byAuthor[authorId];
            const viewed = authorStories.every(s => s.viewers?.includes(currentUser.id));
            return (
              <div key={authorId} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={() => setActiveStory({ author, stories: authorStories })}>
                <div className={`rounded-full p-0.5 ${viewed ? 'border-2 border-gray-300 dark:border-gray-600' : 'story-ring'}`}>
                  <Avatar user={author} size={56} />
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300 max-w-14 text-center truncate">{author.username}</span>
              </div>
            );
          })}
        </div>
      </div>

      {activeStory && (
        <StoryViewer
          story={activeStory}
          onClose={() => { setActiveStory(null); load(); }}
        />
      )}
    </>
  );
}
