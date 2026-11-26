import { useState } from 'react';
import { createPost } from '../utils/firestorePosts';
import { useUser } from '../context/UserContext';
import ImageUpload from '../components/common/ImageUpload';
import Loader from '../components/common/Loader';

export default function NewPost({ navigate, goBack }) {
  const { currentUser } = useUser();
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState('photo');
  const handleShare = async () => {
    if (!caption.trim() && !media) { alert('Please add a caption or image.'); return; }
    setLoading(true);
    try { await createPost({ authorId: currentUser.id, image: media || null, caption: caption.trim(), gradientIndex: Math.floor(Math.random() * 6) }); navigate('home'); }
    catch (err) { console.error('Failed to create post:', err); alert('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-[100dvh] w-full bg-[#F5F6FB] px-4 pt-[env(safe-area-inset-top)] pb-[calc(1.5rem+env(safe-area-inset-bottom))] dark:bg-[#0D1425]">
      <div className="sticky top-0 z-30 -mx-4 mb-5 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
        <button type="button" onClick={goBack} className="text-sm font-semibold text-slate-500">Cancel</button><h2 className="font-bold font-poppins text-[#172B62] dark:text-white">Create post</h2><button type="button" onClick={handleShare} disabled={loading} className="rounded-full bg-gradient-to-r from-[#315DB4] to-[#536FC4] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? 'Sharing…' : 'Share'}</button>
      </div>
      <div className="mx-auto max-w-xl">
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#E9EDFF] p-1 dark:bg-[#1A2948]">
          <button type="button" onClick={() => setMediaType('photo')} className={`rounded-xl py-3 text-sm font-semibold ${mediaType === 'photo' ? 'bg-white text-[#315DB4] shadow-sm dark:bg-[#263A66]' : 'text-slate-500'}`}>Photo</button>
          <button type="button" onClick={() => setMediaType('video')} className={`rounded-xl py-3 text-sm font-semibold ${mediaType === 'video' ? 'bg-white text-[#315DB4] shadow-sm dark:bg-[#263A66]' : 'text-slate-500'}`}>Video</button>
        </div>
        <div className="rounded-3xl border border-dashed border-[#AAB9E2] bg-white p-4 dark:border-slate-600 dark:bg-[#15213A]">
          <ImageUpload onImageSelect={(file, preview) => setMedia(preview)} accept={mediaType === 'video' ? 'video/*' : 'image/*'} />
          {media && (mediaType === 'video' ? <video src={media} controls playsInline className="mt-4 max-h-80 w-full rounded-2xl bg-black object-contain" /> : <img src={media} alt="Post preview" className="mt-4 max-h-80 w-full rounded-2xl object-contain" />)}
        </div>
        <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="What would you like to share?" className="mt-4 w-full rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white" rows="3" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => navigate('new-story')} className="rounded-2xl border border-[#DCE3F5] bg-white p-4 text-left dark:border-slate-700 dark:bg-[#15213A]"><span className="text-2xl">◉</span><span className="mt-2 block text-sm font-bold text-slate-800 dark:text-white">Create story</span><span className="mt-1 block text-xs text-slate-500">Share a moment for 24 hours</span></button>
          <button type="button" disabled className="rounded-2xl border border-[#DCE3F5] bg-white p-4 text-left opacity-70 dark:border-slate-700 dark:bg-[#15213A]"><span className="text-2xl">▶</span><span className="mt-2 block text-sm font-bold text-slate-800 dark:text-white">Create reel</span><span className="mt-1 block text-xs text-slate-500">Short videos · Coming soon</span></button>
        </div>
      </div><Loader isLoading={loading} />
    </div>
  );
}
