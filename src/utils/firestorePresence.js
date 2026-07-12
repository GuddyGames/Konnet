import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const ONLINE_THRESHOLD_MS = 60000; // considered online if seen in the last 60s

// Call this once when the app mounts for a logged-in user — pings Firestore
// every 30s to say "I'm still here"
export const startPresenceHeartbeat = (userId) => {
  const ping = () => setDoc(doc(db, 'presence', userId), { lastActive: Date.now() }, { merge: true });
  ping();
  const interval = setInterval(ping, 30000);
  return () => clearInterval(interval);
};

// Live-subscribe to whether a specific user is online right now
export const listenToUserPresence = (userId, callback) => {
  return onSnapshot(doc(db, 'presence', userId), (snap) => {
    if (!snap.exists()) return callback(false);
    const isOnline = Date.now() - snap.data().lastActive < ONLINE_THRESHOLD_MS;
    callback(isOnline);
  });
};
