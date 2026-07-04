import { useUser} from '../../context/UserContext';
import { startConversation } from '../../utils/storage';
import Avatar from '../common/Avatar';


export default function ProfileHeader({ user, posts, navigate, onUpdate }) {
  const { currentUser, toggleFollow } = useUser();
  const isMe = currentUser?.id === user?.id;
  const isFollowing = currentUser?.following?.includes(user?.id);

  const handleFollow = () => {
    toggleFollow(user.id);
    onUpdate?.();
  };
  

  if (!user) return null;
 

  return (
    <div className="bg-white dark:bg-slate-900 px-4 pt-4 pb-2">
      {/* Top row */}
      <div className="flex items-center gap-6 mb-4">
        {/* Avatar */}
        <div className={`rounded-full ${posts.length > 0 ? 'story-ring p-0.5' : ''}`}>
          <Avatar user={user} size={80} />
        </div>

        {/* Stats */}
        <div className="flex gap-5 flex-1">
          {[
            { label: 'Posts', value: posts.length },
            { label: 'Followers', value: user.followers?.length || 0 },
            { label: 'Following', value: user.following?.length || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="font-bold text-base text-gray-900 dark:text-white font-poppins">{value}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="mb-3">
        <p className="font-bold text-sm text-gray-900 dark:text-white font-poppins">{user.name}</p>
        {user.bio && <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{user.bio}</p>}
      </div>

      {/* Action buttons */}
      {isMe ? (
        <div className="flex gap-2">
          <button
            onClick={() => navigate('edit-profile')}
            className="flex-1 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 text-sm font-semibold text-gray-800 dark:text-white"
          >
            Edit Profile
          </button>
          <button
            onClick={async () => {
              const url = `${window.location.origin}?profile=${user.username}`;
              if (navigator.share) await navigator.share({ title: `${user.username} on Konnet`, url });
              else { await navigator.clipboard.writeText(url); alert('Profile link copied!'); }
            }}
            className="flex-1 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 text-sm font-semibold text-gray-800 dark:text-white"
          >
            Share Profile
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleFollow}
            className={`flex-1 py-1.5 rounded-lg text-sm font-semibold ${
              isFollowing
                ? 'border border-gray-300 dark:border-slate-600 text-gray-800 dark:text-white'
                : 'text-white gradient-bg'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
            </button>
          <button   onClick={() => {
              const convoId = startConversation(currentUser.id, user.id);
              navigate(`chat/${convoId}`);
          }} className="flex-1 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 text-sm font-semibold text-gray-800 dark:text-white">
            Message
          </button>
        </div>
      )}
    </div>
  );
}







