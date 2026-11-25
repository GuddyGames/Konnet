import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { getAvatarColor } from '../utils/helpers';
import Avatar from '../components/common/Avatar';
import BottomNav from '../components/navigations/BottomNav';

const mapProfile = (profile) => ({
  id: profile.id,
  username: profile.username,
  name: profile.display_name || profile.username,
  avatarImage: profile.avatar_url || null,
  avatarColor: getAvatarColor(profile.username || 'konnet'),
});

export default function Explore({ navigate }) {
  const { currentUser } = useUser();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const findPeople = async (searchTerm = '') => {
    setLoading(true);
    setError('');
    try {
      let query = supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .neq('id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(40);

      const cleanTerm = searchTerm.trim().replace(/[,%()]/g, '');
      if (cleanTerm) {
        query = query.ilike('username', '%' + cleanTerm + '%');
      }

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      setResults((data || []).map(mapProfile));
    } catch (err) {
      console.error('Could not discover Konnet accounts:', err);
      setError('We couldn’t find accounts right now. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) findPeople();
  }, [currentUser?.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (currentUser?.id) findPeople(term);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [term, currentUser?.id]);

  return (
    <div className="app-page-with-nav min-h-[100dvh] bg-[#F5F7FB] dark:bg-[#0B1020]">
      <div className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
        <h1 className="mb-4 font-poppins text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Discover people</h1>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
          </svg>
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search by username..."
            aria-label="Search accounts by username"
            className="min-w-0 flex-1 bg-transparent py-3 text-base text-gray-900 outline-none dark:text-white"
          />
          {term && <button type="button" onClick={() => setTerm('')} className="p-2 text-sm text-blue-600">Clear</button>}
        </div>
      </div>

      <section className="px-4 py-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
          {term ? 'Search results' : 'People on Konnet'}
        </h2>
        {loading ? (
          <div className="py-14 text-center text-sm text-gray-400" role="status">Finding accounts...</div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <button type="button" onClick={() => findPeople(term)} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Try again</button>
          </div>
        ) : results.length === 0 ? (
          <div className="py-14 text-center">
            <p className="font-semibold text-gray-700 dark:text-gray-200">No accounts found</p>
            <p className="mt-1 text-sm text-gray-400">Try another username or invite someone to join Konnet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[22px] border border-slate-100 bg-white px-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {results.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => navigate('profile/' + user.username)}
                className="flex w-full items-center gap-3 rounded-xl py-3 text-left active:bg-slate-50 dark:active:bg-slate-800"
              >
                <Avatar user={user} size={48} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{user.username}</span>
                  <span className="block truncate text-sm text-gray-500 dark:text-gray-400">{user.name}</span>
                </span>
                <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">View</span>
              </button>
            ))}
          </div>
        )}
      </section>
      <BottomNav activePage="explore" navigate={navigate} />
    </div>
  );
}
