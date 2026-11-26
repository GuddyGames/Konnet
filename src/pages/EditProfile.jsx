import { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { fileToBase64 } from '../utils/helpers';
import Avatar from '../components/common/Avatar';

export default function EditProfile({ navigate, goBack }) {
  const { currentUser, updateProfile } = useUser();
  const [form, setForm] = useState({ name: currentUser?.name || '', bio: currentUser?.bio || '', avatarImage: currentUser?.avatarImage || null });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();
  const back = () => goBack ? goBack() : navigate(`profile/${currentUser?.username}`);

  const handleAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { const image = await fileToBase64(file); setForm(value => ({ ...value, avatarImage: image })); }
    catch { alert('Failed to load image.'); }
  };
  const save = async () => {
    if (!form.name.trim()) return alert('Name cannot be empty.');
    setSaving(true);
    try {
      const result = await updateProfile({ name: form.name.trim(), bio: form.bio.trim(), avatarImage: form.avatarImage });
      if (result?.error) throw new Error(result.error);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); navigate(`profile/${currentUser.username}`); }, 700);
    } catch (error) { alert(error.message || 'Could not update profile.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F5F6FB] pb-[calc(2rem+env(safe-area-inset-bottom))] dark:bg-[#0D1425]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E6EAF3] bg-white/95 px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-xl dark:border-slate-700 dark:bg-[#111B30]/95">
        <button type="button" onClick={back} className="text-sm font-semibold text-slate-500">Cancel</button>
        <h1 className="font-poppins text-lg font-bold text-[#172B62] dark:text-white">Edit profile</h1>
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-gradient-to-r from-[#315DB4] to-[#536FC4] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : success ? 'Saved ✓' : 'Save'}</button>
      </header>
      <div className="mx-auto max-w-xl px-4 pt-6">
        <section className="rounded-3xl bg-gradient-to-br from-[#315DB4] to-[#172B62] px-5 py-7 text-center text-white shadow-lg shadow-blue-900/10">
          <div className="relative mx-auto h-28 w-28 cursor-pointer" onClick={() => fileRef.current?.click()}>
            <Avatar user={{ ...currentUser, avatarImage: form.avatarImage }} size={112} />
            <span className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full border-2 border-[#315DB4] bg-white text-lg text-[#315DB4]">＋</span>
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 text-sm font-semibold text-white underline underline-offset-4">Change profile photo</button>
          <p className="mt-2 text-xs text-white/70">Choose a clear photo so people can recognise you.</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </section>
        <section className="mt-5 space-y-5 rounded-3xl border border-[#E6EAF3] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#15213A]">
          <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7181A6]">Display name</label><input value={form.name} onChange={event => setForm(value => ({ ...value, name: event.target.value }))} maxLength={40} className="w-full rounded-xl border border-[#E0E5F0] bg-[#F8F9FC] px-4 py-3 text-base text-slate-900 outline-none focus:border-[#5274C8] dark:border-slate-600 dark:bg-[#0D172B] dark:text-white" placeholder="Your name" /></div>
          <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7181A6]">Username</label><div className="rounded-xl border border-[#E8EBF2] bg-[#F4F6FA] px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-[#0D172B]">@{currentUser?.username} <span className="float-right text-xs">Not editable</span></div></div>
          <div><div className="mb-2 flex items-center justify-between"><label className="text-xs font-bold uppercase tracking-wider text-[#7181A6]">Bio</label><span className="text-xs text-slate-400">{form.bio.length}/150</span></div><textarea value={form.bio} onChange={event => setForm(value => ({ ...value, bio: event.target.value }))} rows={4} maxLength={150} className="w-full resize-none rounded-xl border border-[#E0E5F0] bg-[#F8F9FC] px-4 py-3 text-base text-slate-900 outline-none focus:border-[#5274C8] dark:border-slate-600 dark:bg-[#0D172B] dark:text-white" placeholder="Tell people a little about yourself…" /></div>
        </section>
      </div>
    </div>
  );
}
