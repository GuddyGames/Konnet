import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { getPosts, savePosts, getUsers, saveUsers, genId } from '../utils/storage';
import ImageUpload from '../components/common/ImageUpload';
import Loader from '../components/common/Loader';

export default function NewPost() {
  const { user, addPost } = useUser();
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState('');

  const handleShare = () => {
    if (!media) return;
    const newPost = {
      id: genId(),
      author: user.username,
      media,
      caption,
      likes: [],
      comments: [],
      timestamp: Date.now()
    };
    const posts = getPosts();
    posts[newPost.id] = newPost;
    savePosts(posts);
    // update user's posts
    const users = getUsers();
    users[user.username].posts.push(newPost.id);
    saveUsers(users);
    addPost(newPost);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-6 mb-4"></div>
      <h2 className="text-xl font-bold mb-4">New Post</h2>
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
        disabled={!media}
        className="w-full bg-blue-500 py-2 rounded-lg mt-4 font-semibold disabled:opacity-50"
      >
        Share Post
      </button>
    </div>
  );
}