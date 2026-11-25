import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function Login() {
  const { login, signup, loginWithGoogle } = useUser();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (key, value) => setForm(previous => ({ ...previous, [key]: value }));

  const handle = async () => {
    setError(''); setLoading(true);
    try {
      const result = mode === 'login' ? await login(form.username, form.password) : await signup(form.username, form.password, form.name);
      if (result.error) setError(result.error);
    } catch (err) { setError(err.message || 'Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };
  const handleGoogle = async () => {
    setError(''); setLoading(true);
    try { const result = await loginWithGoogle(); if (result.error) setError(result.error); }
    catch (err) { setError(err.message || 'Google sign-in failed.'); }
    finally { setLoading(false); }
  };

  return (
    <main className="konnet-auth-page min-h-[100dvh]">
      <section className="konnet-auth-art" aria-label="Konnet welcome">
        <div className="konnet-auth-orb orb-one"/><div className="konnet-auth-orb orb-two"/><div className="konnet-auth-orb orb-three"/><div className="konnet-auth-orb orb-four"/>
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/40 bg-white/15 text-3xl font-extrabold text-white shadow-xl backdrop-blur">K</div>
          <h1 className="font-poppins text-4xl font-extrabold tracking-tight text-white">Konnet</h1>
          <p className="mt-2 text-sm font-medium text-white/85">Your world, connected.</p>
        </div>
      </section>
      <section className="konnet-auth-panel">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-6 text-center">
            <h2 className="font-poppins text-[25px] font-bold text-[#315DB4]">{mode === 'login' ? 'Welcome!' : 'Get Started!'}</h2>
            <p className="mt-1 text-xs text-slate-500">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="font-semibold text-[#315DB4]">{mode === 'login' ? 'Sign Up' : 'Login'}</button>
            </p>
          </div>
          <div className="space-y-3">
            {mode === 'signup' && <label className="konnet-auth-field"><span>Full Name</span><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter Full Name" autoComplete="name"/></label>}
            <label className="konnet-auth-field"><span>Username</span><input value={form.username} onChange={e => set('username', e.target.value)} placeholder="Enter Username" autoCapitalize="none" autoComplete="username"/></label>
            <label className="konnet-auth-field"><span>Password</span><input value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} placeholder="Enter Password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/></label>
          </div>
          {error && <p role="alert" className="mt-3 text-center text-sm text-red-500">{error}</p>}
          <button type="button" onClick={handle} disabled={loading} className="konnet-auth-submit mt-5">{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}</button>
          <div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200"/><span className="text-[11px] font-medium text-slate-400">OR CONTINUE WITH</span><span className="h-px flex-1 bg-slate-200"/></div>
          <button type="button" onClick={handleGoogle} disabled={loading} className="konnet-google-button"><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.4 0-13.8 4.1-17.1 10.2z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.4 35.4 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.9 39.8 16.4 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C40.9 36 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>Continue with Google</button>
          <p className="mt-6 text-center text-[11px] text-slate-400">By continuing, you agree to Konnet's community guidelines.</p>
        </div>
      </section>
    </main>
  );
}
