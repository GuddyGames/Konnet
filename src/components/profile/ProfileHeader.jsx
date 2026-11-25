import { useUser } from '../../context/UserContext';
import { findOrCreateConversation } from '../../utils/supabaseMessages';
import Avatar from '../common/Avatar';
import PresenceDot from '../common/PresenceDot';

export default function ProfileHeader({ user, posts, navigate, onUpdate }) {
  const { currentUser, toggleFollow } = useUser();
  const isMe = currentUser?.id === user?.id;
  const isFollowing = currentUser?.following?.includes(user?.id);
  if (!user) return null;

  const handleFollow = () => {
    toggleFollow(user.id);
    onUpdate?.();
  };

  const shareProfile = async () => {
    const url = `${window.location.origin}?profile=${user.username}`;
    try {
      if (navigator.share) await navigator.share({ title: `${user.username} on Konnet`, url });
      else { await navigator.clipboard.writeText(url); alert('Profile link copied!'); }
    } catch (error) { console.error('Profile share failed:', error); }
  };

  return (
    <section className="konnet-profile-hero">
      <div className="konnet-profile-avatar">
        <div className="relative">
          <Avatar user={user} size={104} />
          <PresenceDot userId={user.id} />
        </div>
      </div>
      <h1 className="font-poppins text-[23px] font-bold leading-tight text-white">{user.name || user.username}</h1>
      <p className="mt-1 text-sm font-medium text-fuchsia-300">@{user.username}</p>
      {(user.location || user.profession || user.occupation) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/85">
          {user.location && <span className="flex items-center gap-1.5"><span>⌖</span>{user.location}</span>}
          {(user.profession || user.occupation) && <span className="flex items-center gap-1.5"><span>▣</span>{user.profession || user.occupation}</span>}
        </div>
      )}
      {user.bio && <p className="mx-auto mt-3 max-w-[300px] text-center text-sm leading-5 text-white/80">{user.bio}</p>}
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Posts', value: posts.length },
          { label: 'Followers', value: user.followers?.length || 0 },
          { label: 'Following', value: user.following?.length || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="font-poppins text-lg font-bold text-white">{value.toLocaleString()}</span>
            <span className="text-xs font-medium text-white/75">{label}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        {isMe ? (
          <>
            <button type="button" onClick={() => navigate('edit-profile')} className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#352B62]">Edit profile</button>
            <button type="button" onClick={shareProfile} className="flex-1 rounded-xl border border-white/35 px-4 py-2.5 text-sm font-semibold text-white">Share profile</button>
          </>
        ) : (
          <>
            <button type="button" onClick={handleFollow} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold ${isFollowing ? 'border border-white/40 text-white' : 'bg-white text-[#352B62]'}`}>{isFollowing ? 'Following' : 'Follow'}</button>
            <button type="button" onClick={async () => { const convoId = await findOrCreateConversation(currentUser.id, user.id); navigate(`chat/${convoId}`); }} className="flex-1 rounded-xl border border-white/40 px-4 py-2.5 text-sm font-semibold text-white">Message</button>
          </>
        )}
      </div>
    </section>
  );
}
