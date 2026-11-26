import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileGrid from '../components/profile/ProfileGrid';
import BottomNav from '../components/navigations/BottomNav';

export default function Profile({ username, navigate }) {
  const { currentUser, getUserByUsername } = useUser();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  const load = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const profile = await getUserByUsername(username || currentUser?.username);
      setUser(profile);
      if (!profile) { setPosts([]); return; }
      const { data, error } = await supabase.from('posts')
        .select('id, author_id, caption, created_at')
        .eq('author_id', profile.id).order('created_at', { ascending: false });
      if (error) throw error;
      setPosts((data || []).map(post => ({
        id: post.id, authorId: post.author_id, caption: post.caption || '',
        timestamp: post.created_at ? new Date(post.created_at).getTime() : Date.now(),
        image: null, gradientIndex: 0,
      })));
    } catch (error) {
      console.error('Could not load profile:', error);
      setLoadError('We couldn’t load this profile. Check your connection and try again.');
    } finally { setLoading(false); }
  }, [username, currentUser?.id, currentUser?.username, getUserByUsername]);

  useEffect(() => { load(); }, [load]);
  const isMe = currentUser?.id === user?.id;

  if (loading) return <div className="min-h-[100dvh] bg-white dark:bg-slate-950"><div className="h-16 bg-gradient-to-r from-[#315DB4] to-[#172B62]" /><div className="mx-auto flex max-w-md flex-col items-center px-6 pt-8"><div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800" /><div className="mt-5 h-5 w-36 rounded-full bg-slate-100 dark:bg-slate-800" /><div className="mt-3 h-3 w-24 rounded-full bg-slate-100 dark:bg-slate-800" /><p className="mt-6 text-xs text-slate-400">Loading profile…</p></div></div>;
  if (loadError) return <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-white px-6 text-center dark:bg-slate-950"><p className="text-sm text-slate-500">{loadError}</p><button type="button" onClick={load} className="rounded-xl bg-[#315DB4] px-5 py-3 text-sm font-semibold text-white">Try again</button></div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900"><p className="text-gray-500">User not found</p></div>;

  return (
    <div className="app-page-with-nav konnet-profile-page min-h-[100dvh] bg-white dark:bg-slate-950">
      <div className="konnet-profile-topbar sticky top-0 z-30 flex items-center justify-between px-5">
        <button type="button" onClick={() => navigate('home')} aria-label="Go back" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></button>
        <button type="button" onClick={() => navigate(isMe ? 'settings' : 'report')} aria-label="More profile options" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></button>
      </div>
      <ProfileHeader user={user} posts={posts} navigate={navigate} onUpdate={load} />
      <div className="konnet-profile-tabs grid grid-cols-2"><button type="button" onClick={() => setActiveTab('posts')} className={activeTab === 'posts' ? 'active' : ''}>Posts</button><button type="button" onClick={() => setActiveTab('tags')} className={activeTab === 'tags' ? 'active' : ''}>Tags</button></div>
      {activeTab === 'posts' ? <ProfileGrid posts={posts} navigate={navigate} /> : <div className="py-16 text-center text-sm text-slate-400">Tagged posts will appear here.</div>}
      <BottomNav activePage="profile" navigate={navigate} />
    </div>
  );
}
