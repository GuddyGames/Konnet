import { useState } from 'react';

const mediaOptions = [
  { key: 'photo', icon: '▧', title: 'Photo', description: 'Share a moment from your gallery' },
  { key: 'video', icon: '▶', title: 'Video', description: 'Share a video with your followers' },
  { key: 'story', icon: '◉', title: 'Story', description: 'A moment that lasts 24 hours' },
  { key: 'reel', icon: '▣', title: 'Reel', description: 'Short-form video for discovery' },
];

export default function NewPost({ goBack }) {
  const [selected, setSelected] = useState('photo');
  const option = mediaOptions.find(item => item.key === selected);

  return (
    <div className="min-h-[100dvh] bg-[#F5F6FB] px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] dark:bg-[#0D1425]">
      <header className="-mx-4 mb-6 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4 dark:border-slate-800 dark:bg-[#111B30]">
        <button type="button" onClick={goBack} className="text-sm font-semibold text-slate-500">Cancel</button>
        <h1 className="font-poppins text-lg font-bold text-[#172B62] dark:text-white">Create</h1>
        <span className="w-12" />
      </header>
      <div className="mx-auto max-w-xl">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#7181A6]">Create something</p>
          <h2 className="mt-1 font-poppins text-2xl font-bold text-[#172B62] dark:text-white">Share your moment</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose the format that fits what you want to share.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {mediaOptions.map(item => (
            <button key={item.key} type="button" onClick={() => setSelected(item.key)} className={`rounded-2xl border p-4 text-left transition-colors ${selected === item.key ? 'border-[#5274C8] bg-[#E9EDFF] ring-2 ring-[#5274C8]/15 dark:bg-[#1D2C4C]' : 'border-[#E4E8F1] bg-white dark:border-slate-700 dark:bg-[#15213A]'}`}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#315DB4] to-[#8A8ED5] text-xl text-white">{item.icon}</span>
              <span className="mt-3 block text-sm font-bold text-slate-800 dark:text-white">{item.title}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 overflow-hidden rounded-3xl border border-dashed border-[#AAB9E2] bg-white p-5 dark:border-slate-600 dark:bg-[#15213A]">
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-[#F2F4FB] px-5 text-center dark:bg-[#0D172B]">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#E3E9FF] text-3xl text-[#315DB4] dark:bg-[#263A66]">{option.icon}</span>
            <h3 className="mt-4 text-base font-bold text-[#172B62] dark:text-white">{option.title} preview</h3>
            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">Your media preview and editing tools will appear here.</p>
            <button type="button" disabled className="mt-4 rounded-full bg-gradient-to-r from-[#315DB4] to-[#536FC4] px-5 py-2.5 text-sm font-semibold text-white opacity-60">Choose from gallery · Coming soon</button>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#F7F8FC] p-3 dark:bg-[#0D172B]">
            <span className="text-lg text-[#536FC4]">✎</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Add a caption…</span>
          </div>
        </div>
        <button type="button" disabled className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#315DB4] to-[#536FC4] py-4 text-sm font-bold text-white opacity-55">Continue · Coming soon</button>
        <p className="mt-3 text-center text-xs text-slate-400">Media creation is a preview. Uploading and publishing will be enabled after approval.</p>
      </div>
    </div>
  );
}
