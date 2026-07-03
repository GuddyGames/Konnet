import { getGradient } from '../../utils/helpers';

export default function ProfileGrid({ posts, navigate }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="text-5xl"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">No Posts Yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((post, i) => (
        <div
          key={post.id}
          className="aspect-square cursor-pointer relative overflow-hidden"
          onClick={() => navigate(`post/${post.id}`)}
          style={{ background: post.image ? undefined : getGradient(post.gradientIndex || i) }}
        >
          {post.image && (
            <img src={post.image} alt="post" className="w-full h-full object-cover" />
          )}
        </div>
      ))}
    </div>
  );
}







