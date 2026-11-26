import { useState } from 'react';

const mediaOptions = [
  { key: 'photo', icon: '▧', title: 'Post', subtitle: 'Photos for your feed', description: 'Share a moment with your followers.' },
  { key: 'story', icon: '◉', title: 'Story', subtitle: 'Moments that last 24 hours', description: 'Share an everyday moment that disappears after 24 hours.' },
  { key: 'reel', icon: '▶', title: 'Reel', subtitle: 'Short vertical videos', description: 'Create short videos people can discover and enjoy.' },
  { key: 'video', icon: '▣', title: 'Video', subtitle: 'Share a video post', description: 'Post a video with a caption for your followers.' },
];

export default function NewPost({ goBack }) {
  const [selected, setSelected] = useState('photo');
  const option = mediaOptions.find(item => item.key === selected);

  return (
    <div className="min-h-[100dvh] bg-[#F5F6FB] px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] dark:bg-[#0D1425]">
      <header className="-mx-4 mb-6 flex items-center justify-between border-b border-[#E6EAF3] bg-white px-4 py-4 dark:border-slate-800 dark:bg-[#111B30]">
        <button type="button" onClick={goBack} className="text-sm font-semibold text-slate-500">Cancel</button>
        <h1 className="font-poppins text-lg font-bold text-[#172B62] dark:text-white">Create</h1>
        <span className="w-12"/>
      </header>
      <div className="mx-auto max-w-xl">
        <div className="mb-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#7181A6]">Make something memorable</p><h2 className="mt-1 font-poppins text-2xl font-bold text-[#172B62] dark:text-white">What would you like to share?</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Choose a format to start creating on Konnet.</p></div>
        <div className="grid grid-cols-2 gap-3">
          {mediaOptions.map((item, index) => <button key={item.key} type="button" onClick={() => setSelected(item.key)} className={`relative overflow-hidden rounded-3xl border p-4 text-left transition-all ${selected === item.key ? 'border-[#5274C8] bg-[#E9EDFF] shadow-md shadow-blue-900/5 ring-2 ring-[#5274C8]/15 dark:bg-[#1D2C4C]' : 'border-[#E4E8F1] bg-white dark:border-slate-700 dark:bg-[#15213A]'}`}><span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl text-white shadow-sm ${index % 2 === 0 ? 'bg-gradient-to-br from-[#315DB4] to-[#6C83D1]' : 'bg-gradient-to-br from-[#596DC0] to-[#A18AD9]'}`}>{item.icon}</span><span className="mt-4 block text-base font-bold text-slate-800 dark:text-white">{item.title}</span><span className="mt-1 block text-[11px] font-medium text-[#536FC4] dark:text-[#B9C8FF]">{item.subtitle}</span><span className="mt-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</span>{selected === item.key && <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-[#315DB4] text-xs font-bold text-white">✓</span>}</button>)}
        </div>
        <div className="mt-5 overflow-hidden rounded-3xl border border-[#E3E8F3] bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#15213A]">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#8794B1]">Selected format</p><h3 className="mt-1 font-poppins text-lg font-bold text-[#172B62] dark:text-white">{option.title}</h3></div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E9EDFF] text-xl text-[#315DB4] dark:bg-[#25365B] dark:text-[#C6D2FF]">{option.icon}</span></div>
          <div className="mt-4 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-[#C8D3EB] bg-[#F7F8FC] px-5 text-center dark:border-slate-600 dark:bg-[#0D172B]"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl text-[#5274C8] shadow-sm dark:bg-[#1B2944]">{option.icon}</span><p className="mt-3 text-sm font-semibold text-[#35466D] dark:text-slate-200">{option.title} preview</p><p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">Your gallery selection, editing tools and preview will appear here.</p><span className="mt-3 rounded-full bg-[#E9EDFF] px-4 py-2 text-xs font-bold text-[#315DB4] dark:bg-[#25365B] dark:text-[#C6D2FF]">Gallery & editor · Coming soon</span></div>
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#F7F8FC] p-3 dark:bg-[#0D172B]"><span className="text-lg text-[#536FC4]">✎</span><span className="text-sm text-slate-400">Add a caption…</span></div>
        </div>
        <button type="button" disabled className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#315DB4] to-[#536FC4] py-4 text-sm font-bold text-white opacity-55">Continue · Coming soon</button>
        <p className="mt-3 text-center text-xs leading-5 text-slate-400">This is a design preview. Uploading, editing and publishing remain disabled until you approve the screens.</p>
      </div>
    </div>
  );
}
