import { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { storage, KEYS } from '../utils/storage';
import { genId, fileToBase64 } from '../utils/helpers';

const STORY_COLORS = [
  '#7C3AED', '#2563EB', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#0891B2', '#7C3AED'
];

export default function NewStory({ navigate }) {
  const { currentUser } = useUser();
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [color, setColor] = useState(STORY_COLORS[0]);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setImage(base64);
  };

  const post = () => {
    if (!image && !caption.trim()) return alert('Add an image or text for your story.');
    setPosting(true);

    const newStory = {
      id: genId(),
      authorId: currentUser.id,
      image: image || null,
      caption: caption.trim(),
      color,
      timestamp: Date.now(),
      viewers: [],
    };

    const stories = storage.get(KEYS.STORIES) || [];
    storage.set(KEYS.STORIES, [newStory, ...stories]);

    setPosting(false);
    navigate('home');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button onClick={() => navigate('home')} className="text-white text-2xl">×</button>
        <h2 className="text-white font-bold font-poppins">New Story</h2>
        <button onClick={post} disabled={posting} className="text-blue-400 font-bold disabled:opacity-40">
          {posting ? '...' : 'Share'}
        </button>
      </div>

      {/* Preview */}
      <div
        className="flex-1 mx-4 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden cursor-pointer min-h-64"
        style={{ background: image ? '#000' : color }}
        onClick={() => fileRef.current?.click()}
      >
        {image
          ? <img src={image} alt="story preview" className="max-w-full max-h-full object-contain" />
          : (
            <div className="text-center px-6">
              <p className="text-6xl mb-4"></p>
              <p className="text-white font-semibold text-lg">Tap to add photo</p>
              <p className="text-white/60 text-sm mt-1">or use the color below</p>
            </div>
          )
        }
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* Caption input */}
      <div className="px-4 mt-4">
        <input
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="Add a caption..."
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-500"
        />
      </div>

      {/* Color picker */}
      {!image && (
        <div className="px-4 mt-4">
          <p className="text-gray-400 text-xs mb-2">Background Color</p>
          <div className="flex gap-3 flex-wrap">
            {STORY_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{ background: c, borderColor: color === c ? 'white' : 'transparent' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
