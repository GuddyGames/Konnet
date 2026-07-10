import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function Login() {
  const { login, signup, loginWithGoogle } = useUser();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ username: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    setError('');
    setLoading(true);
    const result = mode === 'login'
      ? await login(form.username, form.password)
      : await signup(form.username, form.password, form.name);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle();
    if (result.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-white dark:bg-slate-900">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black font-poppins gradient-text mb-2">Konnet</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Connect with the world, smarter.</p>
        <p className="text-xs mt-1" style={{ color: '#F59E0B' }}>&#10022; powered by GuddyAi</p>
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
        className="w-full max-w-xs flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 dark:border-slate-600 text-sm font-semibold text-gray-700 dark:text-white disabled:opacity-60"
      >
        <span className="w-[18px] h-[18px] rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs font-bold text-blue-600">G</span>
        Continue with Google
      </button>

      {/* Toggle mode */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-xl w-full max-w-xs p-4 text-center mt-6">
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
    </div>
  );
}
