import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function UsernameOnboarding() {
  const { completeProfile, logout } = useUser();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await completeProfile(username);
    if (result?.error) setError(result.error);
    setLoading(false);
  };

  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-white dark:bg-slate-900">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-black font-poppins gradient-text">Welcome to Konnet</h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Choose a unique username to finish setting up your account.</p>
        </div>
        <div>
          <label htmlFor="konnet-username" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Your username</label>
          <div className="flex items-center rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4">
            <span className="text-gray-400">@</span>
            <input
              id="konnet-username"
              value={username}
              onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              minLength={3}
              maxLength={20}
              autoCapitalize="none"
              autoComplete="username"
              placeholder="yourname"
              className="w-full bg-transparent px-2 py-3 text-gray-900 dark:text-white outline-none"
              required
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">3–20 characters. Letters, numbers and underscores only.</p>
        </div>
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading || username.length < 3} className="w-full rounded-xl py-3 font-semibold text-white gradient-bg disabled:opacity-60">
          {loading ? 'Setting up...' : 'Finish setup'}
        </button>
        <button type="button" onClick={logout} className="w-full py-2 text-sm text-gray-500">Sign out</button>
      </form>
    </main>
  );
}
