import { useState } from 'react';
import { useUser } from '../context/UserContext';
import Loader from '../components/common/Loader';

export default function Login() {
  const { login, signup, loginWithgoogle } = useUser();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ username: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading ] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithgoogle();
    if (result.error) setError(result.error);
    setLoading(false);
  };

  const handle = async () => {
    setError('');
    setLoading(true);
    const result = mode === 'login'
      ? await login(form.username, form.password)
      : await signup(form.username, form.password, form.name);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-white dark:bg-slate-900">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black font-poppins gradient-text mb-2">Konnet</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Connect with the world, smarter.</p>
        <p className="text-xs mt-1" style={{ color: '#F59E0B' }}>✦ powered by GuddyAi</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-xs space-y-3">
        {mode === 'signup' && (
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-colors"
          />
        )}
        <input
          value={form.username}
          onChange={e => set('username', e.target.value)}
          placeholder="Username"
          autoCapitalize="none"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-colors"
        />
        <input
          value={form.password}
          onChange={e => set('password', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()}
          placeholder="Password"
          type="password"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-colors"
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={handle}
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm gradient-bg disabled:opacity-60"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6 w-full max-w-xs">
        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
        <span className="text-gray-400 text-xs font-semibold">OR</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
      </div>

      {/* Google Sign-In */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full max-w-xs flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 dark:border-slate-600 text-sm font-semibold text-gray-700 dark:text-white disabled:opacity-60">
        <svg width="18" height="18" viewBox="0 0 48 48">
  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.4 0-13.8 4.1-17.1 10.2z"/>
  <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.4 35.4 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.9 39.8 16.4 44 24 44z"/>
  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C40.9 36 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/>
</svg>
        Continue with Google
      </button>

      {/* Toggle mode */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-xl w-full max-w-xs p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-blue-600 font-semibold"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        <span className="font-mono">Guddie Technology</span>
      </p>
      <Loader isLoading={loading} />
    </div>
  );
}




