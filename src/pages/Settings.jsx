import { useUser } from '../context/UserContext';

const sections = [
  { title: 'Your account', items: [{ icon: '✎', label: 'Edit profile', detail: 'Name, photo and bio', route: 'edit-profile' }, { icon: '⇄', label: 'Switch account', detail: 'Add or change an account', coming: true }, { icon: '🔒', label: 'Privacy and security', detail: 'Private account, blocked users and controls', coming: true }] },
  { title: 'Preferences', items: [{ icon: '◐', label: 'Appearance', detail: 'Choose light or dark theme', theme: true }, { icon: '♧', label: 'Notifications', detail: 'Manage alerts and activity', coming: true }, { icon: '◎', label: 'Language and region', detail: 'App language and regional preferences', coming: true }] },
  { title: 'Your activity', items: [{ icon: '▣', label: 'Saved posts', detail: 'Posts you have bookmarked', coming: true }, { icon: '◷', label: 'Archive', detail: 'Stories and posts you have archived', coming: true }, { icon: '⌕', label: 'Your activity', detail: 'Likes, comments and interactions', coming: true }] },
  { title: 'Support', items: [{ icon: '?', label: 'Help centre', detail: 'Get help using Konnet', coming: true }, { icon: '♧', label: 'Community guidelines', detail: 'How we keep Konnet welcoming', coming: true }, { icon: 'ⓘ', label: 'About Konnet', detail: 'Version and legal information', coming: true }] },
];

export default function Settings({ navigate, goBack }) {
  const { currentUser, darkMode, toggleDarkMode, logout } = useUser();
  return (
    <div className="min-h-[100dvh] bg-[#F5F6FB] pb-10 dark:bg-[#0D1425]">
      <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[#E7EAF2] bg-white/95 px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-xl dark:border-slate-700 dark:bg-[#111B30]/95">
        <button type="button" onClick={goBack || (() => navigate('profile/' + currentUser?.username))} aria-label="Go back" className="grid h-10 w-10 place-items-center rounded-full bg-[#EEF1FA] text-[#315DB4] dark:bg-slate-800 dark:text-white"><span className="text-xl">‹</span></button>
        <div><h1 className="font-poppins text-lg font-bold text-[#172B62] dark:text-white">Settings & activity</h1><p className="text-xs text-slate-500 dark:text-slate-400">Make Konnet yours</p></div>
      </header>
      <div className="mx-auto max-w-xl px-4 pt-5">
        <button type="button" onClick={() => navigate('profile/' + currentUser?.username)} className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-[#E6EAF3] bg-white p-4 text-left shadow-sm dark:border-slate-700 dark:bg-[#15213A]">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#315DB4] to-[#8A8ED5] text-lg font-bold text-white">{(currentUser?.name || currentUser?.username || 'K').slice(0,1).toUpperCase()}</div>
          <div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900 dark:text-white">{currentUser?.name || currentUser?.username}</p><p className="truncate text-sm text-slate-500">@{currentUser?.username}</p></div><span className="text-xl text-[#536FC4]">›</span>
        </button>
        {sections.map(section => <section key={section.title} className="mb-5">
          <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-[.12em] text-[#64749A]">{section.title}</h2>
          <div className="overflow-hidden rounded-2xl border border-[#E6EAF3] bg-white shadow-sm dark:border-slate-700 dark:bg-[#15213A]">
            {section.items.map(item => <button key={item.label} type="button" disabled={item.coming} onClick={() => { if (item.route) navigate(item.route); if (item.theme) toggleDarkMode(); }} className="flex w-full items-center gap-3 border-b border-[#EEF0F5] px-4 py-4 text-left last:border-0 disabled:cursor-default dark:border-slate-700">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EEF1FF] text-lg text-[#315DB4] dark:bg-[#25345A] dark:text-[#B9C8FF]">{item.icon}</span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{item.label}</span><span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{item.theme ? (darkMode ? 'Dark theme is on' : 'Light theme is on') : item.detail}</span></span>
              {item.theme ? <span className={`relative h-6 w-11 rounded-full transition-colors ${darkMode ? 'bg-[#315DB4]' : 'bg-slate-200'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${darkMode ? 'left-6' : 'left-1'}`} /></span> : item.coming ? <span className="text-[10px] font-semibold text-[#8994AB]">COMING SOON</span> : <span className="text-xl text-slate-400">›</span>}
            </button>)}
          </div>
        </section>)}
        <button type="button" onClick={logout} className="mt-1 w-full rounded-2xl border border-red-100 bg-white px-4 py-4 text-left font-semibold text-red-600 shadow-sm dark:border-red-900/40 dark:bg-[#15213A] dark:text-red-400">Log out</button>
        <p className="mt-5 text-center text-xs text-slate-400">Konnet · Your space to connect</p>
      </div>
    </div>
  );
}
