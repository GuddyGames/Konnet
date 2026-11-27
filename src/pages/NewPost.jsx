import { useRef, useState } from 'react';
import { useUser } from '../context/UserContext';
import { publishPostWithMedia } from '../utils/supabaseMedia';

const formats = [
  { key: 'reel', title: 'Reels', subtitle: 'Share video moments with your followers.', icon: '▶' },
  { key: 'story', title: 'Story', subtitle: 'Share content that disappears after 24 hours.', icon: '◉' },
  { key: 'photo', title: 'Post', subtitle: 'Share a moment with your followers.', icon: '▧' },
];

export default function NewPost({ goBack, navigate }) {
  const { currentUser } = useUser();
  const [stage, setStage] = useState('choose');
  const [selected, setSelected] = useState('photo');
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [audience, setAudience] = useState('Everyone');
  const fileRef = useRef(null);
  const previews = files.map(file => ({ file, url: URL.createObjectURL(file) }));

  const choose = key => {
    if (key === 'story') { navigate('new-story'); return; }
    setSelected(key);
    setStage('editor');
    setError('');
    window.setTimeout(() => fileRef.current?.click(), 80);
  };

  const selectFiles = event => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
    setError('');
    event.target.value = '';
  };

  const share = async () => {
    if (!files.length) { setError('Choose a photo or video first.'); return; }
    setPosting(true); setProgress(15); setError('');
    const timer = window.setInterval(() => setProgress(value => Math.min(value + 12, 90)), 350);
    try {
      await publishPostWithMedia({ userId: currentUser.id, files, caption, postType: selected });
      setProgress(100);
      setStage('complete');
      window.setTimeout(() => navigate('home'), 700);
    } catch (err) {
      console.error('Post upload failed:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally { window.clearInterval(timer); setPosting(false); }
  };

  return (
    <div className="konnet-create-page">
      <header className="konnet-create-header">
        <button type="button" onClick={stage === 'editor' ? () => setStage('choose') : goBack} aria-label="Back">‹</button>
        <span className="konnet-create-heading">{stage === 'editor' ? 'New Post' : 'Create'}</span>
        {stage === 'editor' ? <button type="button" onClick={share} disabled={posting || !files.length} className="konnet-share-link">{posting ? 'Sharing…' : 'Share'}</button> : <span />}
      </header>

      {stage === 'choose' && (
        <div className="konnet-create-sheet-wrap">
          <button type="button" className="konnet-create-backdrop" onClick={goBack} aria-label="Close create menu" />
          <section className="konnet-create-sheet">
            <div className="konnet-sheet-handle" />
            {formats.map(item => <button type="button" key={item.key} onClick={() => choose(item.key)} className="konnet-format-row">
              <span className="konnet-format-icon">{item.icon}</span>
              <span className="min-w-0 text-left"><strong>{item.title}</strong><small>{item.subtitle}</small></span>
            </button>)}
          </section>
        </div>
      )}

      {stage === 'editor' && (
        <div className="konnet-editor">
          <div className="konnet-editor-author">
            <span className="konnet-editor-avatar">{(currentUser?.username || 'K').slice(0,1).toUpperCase()}</span>
            <span>{currentUser?.name || currentUser?.username || 'Your profile'}</span>
          </div>
          <textarea value={caption} onChange={event => setCaption(event.target.value)} placeholder="Write a caption…" rows={2} className="konnet-editor-caption" />
          <button type="button" className="konnet-gallery-picker" onClick={() => fileRef.current?.click()}>
            {previews.length ? <div className="konnet-gallery-grid">{previews.map((item, index) => item.file.type.startsWith('video/') ? <video key={item.url} src={item.url} muted className="konnet-gallery-thumb" /> : <img key={item.url} src={item.url} alt={'Selected media ' + (index + 1)} className="konnet-gallery-thumb" />)}</div> : <span><b>＋</b><small>Choose photos or videos from gallery</small></span>}
          </button>
          <input ref={fileRef} type="file" accept={selected === 'reel' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,video/mp4,video/webm'} multiple={selected === 'photo'} onChange={selectFiles} className="hidden" />
          <div className="konnet-editor-tools">
            <button type="button" className="active">Description</button>
            <button type="button" onClick={() => setAudience(value => value === 'Everyone' ? 'Followers' : 'Everyone')}>Audience · {audience}</button>
            <button type="button" onClick={() => setError('Mention tagging will be available in a future update.')}>Mention</button>
            <button type="button" onClick={() => setError('Location tagging will be available in a future update.')}>Add location</button>
          </div>
          <div className="konnet-editor-bottom-tools"><span>▧</span><span>☺</span><span>＋</span><span>◎</span><span>See More ›</span></div>
          {error && <p role="alert" className="px-4 py-2 text-sm text-red-500">{error}</p>}
          {posting && <div className="konnet-upload-progress"><div><strong>Preparing your Post</strong><b>{progress}%</b></div><span><i style={{ width: progress + '%' }} /></span><small>Hang tight! We're getting your post ready to share.</small></div>}
          <button type="button" onClick={share} disabled={posting || !files.length} className="konnet-editor-publish">{posting ? 'Preparing…' : 'Share post'}</button>
        </div>
      )}
      {stage === 'complete' && <div className="konnet-upload-complete"><b>✓</b><h2>Post shared</h2><p>Your post is now on Konnet.</p></div>}
    </div>
  );
}
