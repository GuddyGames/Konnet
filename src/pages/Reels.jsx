import { useState } from 'react';
import BottomNav from '../components/navigations/BottomNav';

const REELS = [
  { id: 1, user: 'amara.osei', caption: 'Building in public ', color: 'linear-gradient(135deg, #1a1a2e, #533483)', likes: 1240, comments: 89 },
  { id: 2, user: 'lena.dev', caption: 'Design tip of the day ', color: 'linear-gradient(135deg, #2d6a4f, #95d5b2)', likes: 892, comments: 43 },
  { id: 3, user: 'karanbuilds', caption: 'GuddyAi in action ✦', color: 'linear-gradient(135deg, #370617, #d62828)', likes: 3140, comments: 201 },
];

export default function Reels({ navigate }) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const reel = REELS[index];

  const next = () => {
    setLiked(false);
    setIndex(i => (i + 1) % REELS.length);
  };

  return (
    <div className="fixed inset-0 bg-black" onClick={next}>
      <div className="w-full h-full flex items-end pb-24" style={{ background: reel.color }}>
        {/* Right actions */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center" onClick={e => e.stopPropagation()}>
          <button onClick={() => setLiked(l => !l)} className="flex flex-col items-center gap-1">
            <span className="text-3xl">{liked ? '️' : ''}</span>
            <span className="text-white text-xs">{(reel.likes + (liked ? 1 : 0)).toLocaleString()}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <span className="text-3xl"></span>
            <span className="text-white text-xs">{reel.comments}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <span className="text-3xl">↗️</span>
            <span className="text-white text-xs">Share</span>
          </button>
        </div>

        {/* Bottom info */}
        <div className="px-4 pb-6">
          <p className="text-white font-bold font-poppins">@{reel.user}</p>
          <p className="text-white/90 text-sm mt-1">{reel.caption}</p>
          <p className="text-white/50 text-xs mt-2">Tap to next reel →</p>
        </div>
      </div>

      <BottomNav activePage="reels" navigate={navigate} />
    </div>
  );
}
