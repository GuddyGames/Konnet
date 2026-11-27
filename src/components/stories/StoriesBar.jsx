import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import Avatar from '../common/Avatar';
import StoryViewer from './StoryViewer';

export default function StoriesBar({ navigate }) {
  const { currentUser, getUserById } = useUser();
  const [stories, setStories] = useState([]);
  const [authors, setAuthors] = useState({});
  const [activeStory, setActiveStory] = useState(null);
  useEffect(() => {
    if (!currentUser?.id) return;
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from('stories')
        .select('id, author_id, media_path, media_type, caption, created_at, expires_at')
        .gt('expires_at', new Date().toISOString()).order('created_at', { ascending: true });
      if (error) { console.error('Could not load stories:', error); return; }
      const hydrated = await Promise.all((data || []).map(async story => {
        const { data: signed } = await supabase.storage.from('story-media').createSignedUrl(story.media_path, 60 * 60);
        return { ...story, image: signed?.signedUrl || null, viewers: [] };
      }));
      const ids = [...new Set((hydrated || []).map(story => story.author_id))];
      const users = await Promise.all(ids.map(async id => [id, await getUserById(id)]));
      if (active) {
        setStories(hydrated || []);
        setAuthors(Object.fromEntries(users.filter(([, user]) => user)));
      }
    };
    load();
    const channel = supabase.channel('home-stories-' + currentUser.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, load).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [currentUser?.id]);

  if (!currentUser) return null;
  const ownStories = stories.filter(story => story.author_id === currentUser.id);
  const others = [...new Set(stories.filter(story => story.author_id !== currentUser.id).map(story => story.author_id))];
  return (
    <section aria-label="Stories" className="konnet-stories">
      <div className="konnet-stories-track">
        <button type="button" className="konnet-story-item" onClick={() => ownStories.length ? setActiveStory({ author: currentUser, stories: ownStories }) : navigate('new-story')} aria-label="Add story">
          <span className={ownStories.length ? 'konnet-story-ring has-story' : 'konnet-story-ring add-story'}>{ownStories.length ? <Avatar user={currentUser} size={66}/> : <b>＋</b>}</span>
          <span>{ownStories.length ? 'Your story' : 'Add story'}</span>
        </button>
        {others.map(id => {
          const author = authors[id];
          if (!author) return null;
          return <button type="button" key={id} className="konnet-story-item" onClick={() => setActiveStory({ author, stories: stories.filter(story => story.author_id === id) })}>
            <span className="konnet-story-ring has-story"><Avatar user={author} size={66}/></span>
            <span>{author.username || author.name}</span>
          </button>;
        })}
      </div>
      {activeStory && <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />}
    </section>
  );
}
