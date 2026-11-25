import { useState, useEffect } from 'react';
import { startPresenceHeartbeat } from './utils/firestorePresence';
import { useUser } from './context/UserContext';

import Login from './pages/Login';
import UsernameOnboarding from './pages/UsernameOnboarding';
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
import NotificationToast from './components/common/NotificationToast';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import './styles/animations.css';

export default function App() {
  const { currentUser, darkMode, authLoading, profileSetupRequired } = useUser();
  const [page, setPage] = useState({ name: 'home', params: {} });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Keep the app's screen history in the browser history so Android and
  // iOS back gestures/buttons return to the previous Konnet screen.
  useEffect(() => {
    if (!window.history.state?.konnetPage) {
      window.history.replaceState({ konnetPage: page }, '', window.location.href);
    }

    const handlePopState = (event) => {
      const previousPage = event.state?.konnetPage;
      if (previousPage) {
        setPage(previousPage);
        setHistory((items) => items.slice(0, -1));
      } else {
        setPage({ name: 'home', params: {} });
        setHistory([]);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    const [name, ...rest] = path.split('/');
    const nextPage = { name, params: { id: rest.join('/') } };
    setHistory((items) => [...items, page]);
    window.history.pushState({ konnetPage: nextPage }, '', window.location.href);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const goBack = () => {
    if (history.length > 0) {
      window.history.back();
      return;
    }
    setPage({ name: 'home', params: {} });
  };

  useEffect(() => {
    if (!currentUser) return;
    return startPresenceHeartbeat(currentUser.id);
  }, [currentUser]);

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-white dark:bg-slate-900">
        <Loader isLoading={true} />
      </div>
    );
  }

  if (profileSetupRequired) return <UsernameOnboarding />;
  if (!currentUser) return <Login />;

  const { name, params } = page;

  return (
    <>
      <NotificationToast />
      <PWAInstallPrompt />
      <main className="app-shell animate-fadeSlideIn" key={name}>
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
      </main>
    </>
  );
}
