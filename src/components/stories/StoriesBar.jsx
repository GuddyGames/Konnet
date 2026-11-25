import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { getActiveStories } from '../../utils/firestoreStories';
import Avatar from '../common/Avatar';
import StoryViewer from './StoryViewer';

export default function StoriesBar({ navigate }) {
  const { currentUser, getUserById } = useUser();
  const [byAuthor, setByAuthor] = useState({});
  const [authors, setAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const stories = await getActiveStories();
      const grouped = stories.reduce((acc, story) => {
        if (!acc[story.authorId]) acc[story.authorId] = [];
        acc[story.authorId].push(story);
        return acc;
      }, {});
      setByAuthor(grouped);
      const entries = await Promise.all(Object.keys(grouped).map(async id => [id, await getUserById(id)]));
      setAuthors(Object.fromEntries(entries.filter(([, user]) => user)));
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (currentUser) load(); }, [currentUser]);

  if (loading || !currentUser) return null;
  const myStories = byAuthor[currentUser.id] || [];
  const otherIds = Object.keys(byAuthor).filter(id => id !== currentUser.id);

  return (
    <>
      <section aria-label="Stories" className="konnet-stories border-b border-slate-100/80 bg-white py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide">
          <button type="button" className="flex w-[68px] shrink-0 flex-col items-center gap-1" onClick={() => myStories.length ? setActiveStory({ author: currentUser, stories: myStories }) : navigate('new-story')}>
            <span className="relative rounded-full border-2 border-[#63CDB2] p-[3px]">
              <Avatar user={currentUser} size={58} />
              {!myStories.length && <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/15 text-3xl font-light text-white">+</span>}
            </span>
            <span className="max-w-full truncate text-[12px] font-semibold text-slate-900 dark:text-white">You</span>
          </button>
          {otherIds.map(id => {
            const author = authors[id];
            if (!author) return null;
            const stories = byAuthor[id];
            const viewed = stories.every(story => story.viewers?.includes(currentUser.id));
            return (
              <button type="button" key={id} className="flex w-[68px] shrink-0 flex-col items-center gap-1" onClick={() => setActiveStory({ author, stories })}>
                <span className={`rounded-full p-[3px] ${viewed ? 'border-2 border-slate-300 dark:border-slate-600' : 'border-2 border-[#63CDB2]'}`}>
                  <Avatar user={author} size={58} />
                </span>
                <span className="max-w-full truncate text-[12px] font-semibold text-slate-900 dark:text-white">{author.username}</span>
              </button>
            );
          })}
        </div>
      </section>
      {activeStory && <StoryViewer story={activeStory} onClose={() => { setActiveStory(null); load(); }} />}
    </>
  );
}
