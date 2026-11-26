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
    } finally { setLoading(false); }
  };

  useEffect(() => { if (currentUser) load(); }, [currentUser]);

  if (loading || !currentUser) return null;
  const myStories = byAuthor[currentUser.id] || [];
  const otherIds = Object.keys(byAuthor).filter(id => id !== currentUser.id);

  return (
    <>
      <section aria-label="Stories" className="konnet-stories bg-white py-3 dark:bg-slate-950">
        <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide">
          <button type="button" aria-label={myStories.length ? 'View your story' : 'Add your first story'} className="flex w-[76px] shrink-0 flex-col items-center gap-1" onClick={() => myStories.length ? setActiveStory({ author: currentUser, stories: myStories }) : navigate('new-story')}>
            <span className={`relative grid h-[76px] w-[76px] place-items-center rounded-full p-[3px] ${myStories.length ? 'border-[2.5px] border-[#63CDB2]' : 'border-2 border-dashed border-[#63CDB2]'}`}>
              {myStories.length ? <Avatar user={currentUser} size={68} /> : <span className="text-4xl font-light leading-none text-[#315DB4] dark:text-[#C6D2FF]">+</span>}
            </span>
            <span className="max-w-full truncate text-[13px] font-semibold text-slate-900 dark:text-white">{myStories.length ? (currentUser.username || 'You') : 'Add story'}</span>
          </button>
          {otherIds.map(id => {
            const author = authors[id];
            if (!author) return null;
            const stories = byAuthor[id];
            const viewed = stories.every(story => story.viewers?.includes(currentUser.id));
            return (
              <button type="button" key={id} className="flex w-[76px] shrink-0 flex-col items-center gap-1" onClick={() => setActiveStory({ author, stories })}>
                <span className={`rounded-full p-[3px] ${viewed ? 'border-2 border-slate-300 dark:border-slate-600' : 'border-[2.5px] border-[#63CDB2]'}`}>
                  <Avatar user={author} size={68} />
                </span>
                <span className="max-w-full truncate text-[13px] font-semibold text-slate-900 dark:text-white">{author.name || author.username}</span>
              </button>
            );
          })}
        </div>
      </section>
      {activeStory && <StoryViewer story={activeStory} onClose={() => { setActiveStory(null); load(); }} />}
    </>
  );
}
