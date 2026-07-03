import { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { fileToBase64 } from '../utils/helpers';
import Avatar from '../components/common/Avatar';

export default function EditProfile({ navigate }) {
  const { currentUser, updateProfile } = useUser();
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    avatarImage: currentUser?.avatarImage || null,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setForm(f => ({ ...f, avatarImage: base64 }));
    } catch { alert('Failed to load image.'); }
  };

  const save = () => {
    if (!form.name.trim()) return alert('Name cannot be empty.');
    setSaving(true);
    updateProfile({ name: form.name.trim(), bio: form.bio.trim(), avatarImage: form.avatarImage });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); navigate(`profile/${currentUser.username}`); }, 1000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(`profile/${currentUser?.username}`)} className="text-gray-600 dark:text-gray-400 font-semibold">Cancel</button>
        <h2 className="font-bold font-poppins text-gray-900 dark:text-white">Edit Profile</h2>
        <button onClick={save} disabled={saving} className="text-blue-600 font-bold disabled:opacity-40">
          {saving ? '...' : success ? '✓' : 'Save'}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative cursor-pointer" onClick={() => fileRef.current?.click()}>
            <Avatar user={{ ...currentUser, avatarImage: form.avatarImage }} size={96} />
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>
          <button onClick={() => fileRef.current?.click()} className="text-blue-600 font-semibold text-sm">Change Profile Photo</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full mt-1 px-0 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-white outline-none text-sm"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Username</label>
            <p className="mt-1 py-2 text-gray-400 text-sm border-b border-gray-200 dark:border-slate-700">@{currentUser?.username} (can't be changed)</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              maxLength={150}
              className="w-full mt-1 px-0 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-white outline-none text-sm resize-none"
              placeholder="Tell people about yourself..."
            />
            <p className="text-xs text-gray-400 text-right">{form.bio.length}/150</p>
          </div>
        </div>
      </div>
    </div>
  );
}


