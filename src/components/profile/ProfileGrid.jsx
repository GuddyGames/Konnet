export default function ProfileGrid({ posts, navigate }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="text-5xl">▧</div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No Posts Yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {posts.map(post => {
        const firstMedia = post.media?.[0];
        const image = firstMedia?.media_type === 'image' ? firstMedia.url : post.image;
        const video = firstMedia?.media_type === 'video' ? firstMedia.url : post.video;
        return (
          <button
            type="button"
            key={post.id}
            className="relative aspect-square cursor-pointer overflow-hidden bg-slate-100 text-left dark:bg-slate-800"
            onClick={() => navigate(`post/${post.id}`)}
            aria-label={video ? 'Open video post' : 'Open photo post'}
          >
            {image && <img src={image} alt="Post" loading="lazy" className="h-full w-full object-cover" />}
            {video && <video src={video} muted playsInline preload="metadata" className="h-full w-full object-cover" />}
            {!image && !video && <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />}
            {video && <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-sm text-white" aria-hidden="true">▶</span>}
            {(post.media?.length || 0) > 1 && <span className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-1 text-xs text-white">▧ {post.media.length}</span>}
          </button>
        );
      })}
    </div>
  );
}
