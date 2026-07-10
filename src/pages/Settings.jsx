import { useUser } from '../context/UserContext';

export default function Settings({ navigate, goBack }) {
  const { currentUser, darkMode, toggleDarkMode, logout } = useUser();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={goBack || (() => navigate('profile/' + currentUser?.username))} className="text-gray-600 dark:text-gray-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 className="font-bold font-poppins text-gray-900 dark:text-white">Settings</h2>
      </div>
      <div className="p-4 space-y-2">
        <button onClick={() => navigate('edit-profile')} className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-white font-medium">
          Edit Profile
        </button>
        <button onClick={toggleDarkMode} className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-white font-medium flex justify-between items-center">
          Dark Mode <span>{darkMode ? 'On' : 'Off'}</span>
        </button>
        <button onClick={logout} className="w-full text-left px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 font-semibold">
          Log Out
        </button>
      </div>
    </div>
  );
}
