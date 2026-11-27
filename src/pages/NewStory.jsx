import { useRef, useState } from 'react';
import { useUser } from '../context/UserContext';
import { publishStory } from '../utils/supabaseMedia';

export default function NewStory({ navigate, goBack }) {
  const { currentUser } = useUser();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const selectFile = next => {
    if (!next) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setError('');
  };

  const share = async () => {
    if (!file) { setError('Choose a photo or video for your story.'); return; }
    setPosting(true); setError('');
    try {
      await publishStory({ userId: currentUser.id, file, caption });
      navigate('home');
    } catch (err) {
      console.error('Story upload failed:', err);
      setError(err.message || 'Could not publish your story.');
    } finally { setPosting(false); }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-950 pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-center justify-between px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <button onClick={goBack || (() => navigate('home'))} className="text-2xl text-white" aria-label="Close">×</button>
        <h2 className="font-bold text-white">New Story</h2>
        <button onClick={share} disabled={posting || !file} className="font-bold text-blue-400 disabled:opacity-40">{posting ? 'Sharing…' : 'Share'}</button>
      </header>
      <button type="button" onClick={() => inputRef.current?.click()} className="relative mx-4 flex min-h-[52vh] flex-1 items-center justify-center overflow-hidden rounded-2xl bg-slate-800 text-center text-white">
        {preview && file?.type.startsWith('video/') ? <video src={preview} controls playsInline className="max-h-full max-w-full" /> : preview ? <img src={preview} alt="Story preview" className="max-h-full max-w-full object-contain" /> : <span className="px-6"><span className="block text-5xl">＋</span><span className="mt-3 block font-semibold">Tap to choose a photo or video</span><span className="mt-1 block text-sm text-white/60">Visible for 24 hours</span></span>}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className="hidden" onChange={e => selectFile(e.target.files?.[0])} />
      <div className="px-4 pt-4">
        <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption…" className="w-full rounded-xl bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500" />
        {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
        <button onClick={() => inputRef.current?.click()} className="mt-3 w-full rounded-xl border border-white/15 py-3 text-sm font-semibold text-white">Choose media</button>
      </div>
    </div>
  );
}
