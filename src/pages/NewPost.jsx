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

  const handleShare = async () => {
    if (!caption.trim() && !media) {
      alert('Please add a caption or image.');
      return;
    }
    setLoading(true);
    try {
      await createPost({
        authorId: currentUser.id,
        image: media || null,
        caption: caption.trim(),
        gradientIndex: Math.floor(Math.random() * 6),
      });
      navigate('home');
    } catch (err) {
      console.error('Failed to create post:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#F7F8FC] px-4 pt-[env(safe-area-inset-top)] pb-[calc(1.5rem+env(safe-area-inset-bottom))] dark:bg-[#0B1020]">
      <div className="sticky top-0 z-30 -mx-4 mb-5 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
        <h2 className="font-bold font-poppins text-gray-900 dark:text-white">New Post</h2>
        <button onClick={goBack} className="text-gray-600 dark:text-gray-400 font-semibold">Cancel</button>
      </div>

      <ImageUpload onImageSelect={(file, preview) => setMedia(preview)} accept="image/*,video/*" />
      {media && <img src={media} alt="Preview" className="w-full max-h-96 object-contain my-4" />}

      <textarea
        value={caption}
        onChange={e => setCaption(e.target.value)}
        placeholder="Write a caption..."
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        rows="3"
      />

      <button
        onClick={handleShare}
        disabled={loading}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 disabled:opacity-50"
      >
        {loading ? '...' : 'Share Post'}
      </button>

      <Loader isLoading={loading} />
    </div>
  );
}
