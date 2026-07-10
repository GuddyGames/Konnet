import { useState, useEffect } from 'react';
import { useUser } from './context/UserContext';
import { seedData } from './utils/seed';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import NewPost from './pages/NewPost';
import NewStory from './pages/NewStory';
import PostDetail from './pages/PostDetail';
import Reels from './pages/Reels';
import Settings from './pages/Settings';
import Loader from './components/common/Loader';

// Seed initial demo data (stories/notifications/conversations placeholders — not yet migrated to Firestore)
seedData();

export default function App() {
  const { currentUser, darkMode, authLoading } = useUser();
  const [page, setPage] = useState({ name: 'home', params: {} });
  const [history, setHistory] = useState([]);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Navigate to a new page, remembering where we came from
  // Usage: navigate('home') | navigate('profile/username') | navigate('post/postId')
  const navigate = (path) => {
    setHistory(h => [...h, page]);
    const [name, ...rest] = path.split('/');
    setPage({ name, params: { id: rest.join('/') } });
    window.scrollTo(0, 0);
  };

  // Go back to the previous page in history
  const goBack = () => {
    setHistory(h => {
      if (h.length === 0) {
        setPage({ name: 'home', params: {} });
        return h;
      }
      setPage(h[h.length - 1]);
      return h.slice(0, -1);
    });
    window.scrollTo(0, 0);
  };

  // IMPORTANT: all hooks above this line, all conditional returns below.
  // Firebase needs a moment on first load to check if a session already exists.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <Loader isLoading={true} />
      </div>
    );
  }

  if (!currentUser) return <Login />;

  const { name, params } = page;

  return (
    <div className="max-w-sm mx-auto min-h-screen relative bg-white dark:bg-slate-900 animate-fadeSlideIn" key={name}>
      {name === 'home' && <Home navigate={navigate} />}
      {name === 'explore' && <Explore navigate={navigate} />}
      {name === 'new-post' && <NewPost navigate={navigate} goBack={goBack} />}
      {name === 'reels' && <Reels navigate={navigate} />}
      {name === 'profile' && <Profile username={params.id} navigate={navigate} />}
      {name === 'edit-profile' && <EditProfile navigate={navigate} goBack={goBack} />}
      {name === 'messages' && <Messages navigate={navigate} />}
      {name === 'chat' && <Chat conversationId={params.id} navigate={navigate} />}
      {name === 'notifications' && <Notifications navigate={navigate} />}
      {name === 'post' && <PostDetail postId={params.id} navigate={navigate} />}
      {name === 'new-story' && <NewStory navigate={navigate} goBack={goBack} />}
      {name === 'settings' && <Settings navigate={navigate} goBack={goBack} />}
    </div>
  );
}
