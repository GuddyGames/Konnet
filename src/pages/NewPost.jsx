import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { getPosts, savePosts, getUsers, saveUsers, addNotification } from '../utils/storage';
import { genId, fileToBase64 } from '../utils/helpers';
import ImageUpload from '../components/common/ImageUpload';
import Loader from '../components/common/Loader';

export default function NewPost({navigate, goBack, loading}) {
  const { currentUser } = useUser();
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState('');

  const handleShare = () => {
    if (!caption.trim() && !media) {
      alert('Please add a caption or image. ');
      return;
    }
    const newPost = {
      id: genId(),
      authorId: currentUser.id,
      image: media,
      caption,
      likes: [],
      comments: [],
      timestamp: Date.now(),
      gradientIndex: Math.floor(Math.random() * 6),
    };
    const posts = getPosts();
    posts.push(newPost);
    savePosts(posts);
    // update user's posts
    const users = getUsers();
    if (!Array.isArray(users[currentUser.username].posts)) {
      users[currentUser.username].posts = [];
    }
    users[currentUser.username].posts.push(newPost.id);
    saveUsers(users);

    navigate('home');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
      <h2 className="font-bold font-poppins text-gray-900 dark:text-white">New Post</h2>
        <button onClick={goBack} className=" text-gray-600 dark:text-gray-400 font-semibold">Cancel</button> 
        </div>
      <ImageUpload onUpload={setMedia} accept="image/*,video/*" />
      {media && <img src={media} alt="Preview" className="w-full max-h-96 object-contain my-4" />}
      <textarea
        value={caption}
        onChange={e => setCaption(e.target.value)}
        placeholder="Write a caption..."
        className="w-full bg-gray-800 p-2 rounded-lg focus:outline-none"
        rows="3"
      />
      <button
        onClick={handleShare}
        disabled={loading}
        className="w-full bg-blue-500 py-2 rounded-lg mt-4 font-semibold disabled:opacity-50"
      >
        {loading ? '...' : ' Share Post'}
      </button>
      </div>
      
  );
}