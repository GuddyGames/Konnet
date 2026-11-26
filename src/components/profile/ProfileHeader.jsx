import { useUser } from '../../context/UserContext';
import { findOrCreateConversation } from '../../utils/supabaseMessages';
import Avatar from '../common/Avatar';
import PresenceDot from '../common/PresenceDot';

export default function ProfileHeader({ user, posts, navigate, onUpdate }) {
  const { currentUser, toggleFollow } = useUser();
  const isMe = currentUser?.id === user?.id;
  const isFollowing = currentUser?.following?.includes(user?.id);
  if (!user) return null;

  const handleFollow = async () => {
    try { await toggleFollow(user.id); onUpdate?.(); }
    catch (error) { console.error('Follow update failed:', error); }
  };
  const shareProfile = async () => {
    const url = `${window.location.origin}?profile=${user.username}`;
    try {
      if (navigator.share) await navigator.share({ title: `${user.username} on Konnet`, url });
      else { await navigator.clipboard.writeText(url); alert('Profile link copied!'); }
    } catch (error) { console.error('Profile share failed:', error); }
  };
  const stats = [{ label: 'Posts', value: posts?.length || 0 }, { label: 'Followers', value: user.followers?.length || 0 }, { label: 'Following', value: user.following?.length || 0 }];

  return (
    <section className="konnet-profile-hero">
      <div className="konnet-profile-avatar"><div className="relative"><Avatar user={user} size={104} /><PresenceDot userId={user.id} /></div></div>
      <h1 className="font-poppins text-[23px] font-bold leading-tight text-white">{user.name || user.username}</h1>
      <p className="mt-1 text-sm font-medium text-[#E6DFFF]">@{user.username}</p>
      <div className="mx-auto mt-5 max-w-md rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left backdrop-blur-sm">
        {user.bio ? <p className="whitespace-pre-wrap break-words text-center text-sm leading-6 text-white">{user.bio}</p> : <p className="text-center text-sm text-white/65">{isMe ? 'Add a short bio so people can get to know you.' : 'This user hasn’t added a bio yet.'}</p>}
        {(user.location || user.profession || user.occupation) && <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/85">{user.location && <span>⌖ {user.location}</span>}{(user.profession || user.occupation) && <span>▣ {user.profession || user.occupation}</span>}</div>}
      </div>
      <div className="mx-auto mt-5 grid max-w-md grid-cols-3 divide-x divide-white/15 rounded-2xl bg-white/10 py-3">
        {stats.map(({ label, value }) => <div key={label} className="flex flex-col gap-1 text-center"><span className="font-poppins text-lg font-bold text-white">{value.toLocaleString()}</span><span className="text-xs font-medium text-white/75">{label}</span></div>)}
      </div>
      <div className="mx-auto mt-4 flex max-w-md gap-2">
        {isMe ? <><button type="button" onClick={() => navigate('edit-profile')} className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#263D78]">Edit profile</button><button type="button" onClick={() => navigate('settings')} className="flex-1 rounded-xl border border-white/40 px-4 py-3 text-sm font-semibold text-white">Settings</button></> : <><button type="button" onClick={handleFollow} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${isFollowing ? 'border border-white/40 text-white' : 'bg-white text-[#263D78]'}`}>{isFollowing ? 'Following' : 'Follow'}</button><button type="button" onClick={async () => { const convoId = await findOrCreateConversation(currentUser.id, user.id); navigate(`chat/${convoId}`); }} className="flex-1 rounded-xl border border-white/40 px-4 py-3 text-sm font-semibold text-white">Message</button></>}
      </div>
    </section>
  );
}
