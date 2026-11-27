import { useRef, useState } from 'react';
import { useUser } from '../context/UserContext';
import { publishPostWithMedia } from '../utils/supabaseMedia';

const options = [
  { key: 'photo', icon: '▧', title: 'Post', subtitle: 'Photos for your feed', accept: 'image/*', multiple: true },
  { key: 'story', icon: '◉', title: 'Story', subtitle: 'Moments that last 24 hours' },
  { key: 'reel', icon: '▶', title: 'Reel', subtitle: 'Short vertical videos', accept: 'video/*' },
  { key: 'video', icon: '▣', title: 'Video', subtitle: 'Share a video post', accept: 'video/*' },
];

export default function NewPost({ goBack, navigate }) {
  const { currentUser } = useUser();
  const [selected, setSelected] = useState('photo');
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const option = options.find(item => item.key === selected);

  const choose = key => {
    if (key === 'story') { navigate('new-story'); return; }
    setSelected(key);
    setFiles([]);
    setError('');
    window.setTimeout(() => fileRef.current?.click(), 0);
  };

  const submit = async () => {
    if (!files.length) { setError('Choose at least one file first.'); return; }
    setPosting(true); setError('');
    try {
      await publishPostWithMedia({ userId: currentUser.id, files, caption, postType: selected });
      navigate('home');
    } catch (err) {
      console.error('Post upload failed:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally { setPosting(false); }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F5F6FB] px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] dark:bg-[#0D1425]">
      <header className="-mx-4 mb-6 flex items-center justify-between border-b border-[#E6EAF3] bg-white px-4 py-4 dark:border-slate-800 dark:bg-[#111B30]">
        <button type="button" onClick={goBack} className="text-sm font-semibold text-slate-500">Cancel</button>
        <h1 className="font-poppins text-lg font-bold text-[#172B62] dark:text-white">Create</h1>
        <button type="button" onClick={submit} disabled={posting || !files.length} className="text-sm font-bold text-[#315DB4] disabled:opacity-40">{posting ? 'Sharing…' : 'Share'}</button>
      </header>
      <div className="mx-auto max-w-xl">
        <h2 className="font-poppins text-2xl font-bold text-[#172B62] dark:text-white">What would you like to share?</h2>
        <p className="mb-5 mt-2 text-sm text-slate-500 dark:text-slate-400">Choose a format to start creating on Konnet.</p>
        <div className="grid grid-cols-2 gap-3">
          {options.map((item, index) => <button key={item.key} type="button" onClick={() => choose(item.key)} className={`rounded-3xl border p-4 text-left transition-all ${selected === item.key ? 'border-[#5274C8] bg-[#E9EDFF] ring-2 ring-[#5274C8]/15 dark:bg-[#1D2C4C]' : 'border-[#E4E8F1] bg-white dark:border-slate-700 dark:bg-[#15213A]'}`}>
            <span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl text-white ${index % 2 ? 'bg-gradient-to-br from-[#596DC0] to-[#A18AD9]' : 'bg-gradient-to-br from-[#315DB4] to-[#6C83D1]'}`}>{item.icon}</span>
            <span className="mt-4 block font-bold text-slate-800 dark:text-white">{item.title}</span>
            <span className="mt-1 block text-xs text-[#536FC4] dark:text-[#B9C8FF]">{item.subtitle}</span>
          </button>)}
        </div>
        <input ref={fileRef} type="file" accept={option.accept || 'image/*'} multiple={Boolean(option.multiple)} className="hidden" onChange={e => { setFiles(Array.from(e.target.files || [])); setError(''); }} />
        <div className="mt-5 rounded-3xl border border-[#E3E8F3] bg-white p-4 dark:border-slate-700 dark:bg-[#15213A]">
          <button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#C8D3EB] bg-[#F7F8FC] px-5 text-center dark:border-slate-600 dark:bg-[#0D172B]">
            <span className="text-3xl text-[#5274C8]">＋</span>
            <span className="mt-2 text-sm font-semibold text-[#35466D] dark:text-slate-200">{files.length ? `${files.length} file(s) selected` : `Choose ${option.title.toLowerCase()} from gallery`}</span>
            <span className="mt-1 text-xs text-slate-500">Images and videos up to 50 MB each</span>
          </button>
          {files.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{files.map((file, i) => <span key={file.name + i} className="max-w-full truncate rounded-full bg-[#E9EDFF] px-3 py-1.5 text-xs text-[#315DB4]">{file.name}</span>)}</div>}
          <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={3} placeholder="Write a caption…" className="mt-4 w-full resize-none rounded-xl bg-[#F7F8FC] p-3 text-sm outline-none dark:bg-[#0D172B] dark:text-white" />
          {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
          <button type="button" onClick={submit} disabled={posting || !files.length} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#315DB4] to-[#536FC4] py-4 text-sm font-bold text-white disabled:opacity-50">{posting ? 'Uploading…' : 'Publish'}</button>
        </div>
      </div>
    </div>
  );
}
