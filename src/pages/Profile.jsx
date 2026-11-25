import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getAllPosts } from '../utils/firestorePosts';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileGrid from '../components/profile/ProfileGrid';
import BottomNav from '../components/navigations/BottomNav';

export default function Profile({ username, navigate }) {
  const { currentUser, getUserByUsername } = useUser();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  const load = async () => {
    setLoading(true);
    const u = await getUserByUsername(username || currentUser?.username);
    setUser(u);
    if (u) {
      const allPosts = await getAllPosts();
      setPosts(allPosts.filter(p => p.authorId === u.id));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [username, currentUser]);
  const isMe = currentUser?.id === user?.id;

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900"><p className="text-gray-500">Loading...</p></div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900"><p className="text-gray-500">User not found</p></div>;

  return (
    <div className="app-page-with-nav konnet-profile-page min-h-[100dvh] bg-white dark:bg-slate-950">
      <div className="konnet-profile-topbar sticky top-0 z-30 flex items-center justify-between px-5">
        <button type="button" onClick={() => navigate('home')} aria-label="Go back" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button type="button" onClick={() => navigate(isMe ? 'settings' : 'report')} aria-label="More profile options" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>
        </button>
      </div>
      <ProfileHeader user={user} posts={posts} navigate={navigate} onUpdate={load} />
      <div className="konnet-profile-tabs grid grid-cols-2">
        <button type="button" onClick={() => setActiveTab('posts')} className={activeTab === 'posts' ? 'active' : ''}>Posts</button>
        <button type="button" onClick={() => setActiveTab('tags')} className={activeTab === 'tags' ? 'active' : ''}>Tags</button>
      </div>
      {activeTab === 'posts' ? <ProfileGrid posts={posts} navigate={navigate} /> : <div className="py-16 text-center text-sm text-slate-400">Tagged posts will appear here.</div>}
      <BottomNav activePage="profile" navigate={navigate} />
    </div>
  );
}
