import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useUser } from '../../context/UserContext';

const getMessage = (notif) => {
  switch (notif.type) {
    case 'message': return 'sent you a message';
    case 'like': return 'liked your post';
    case 'comment': return 'commented on your post';
    case 'follow': return 'started following you';
    default: return 'interacted with you';
  }
};

export default function NotificationToast() {
  const { currentUser, getUserById } = useUser();
  const [toasts, setToasts] = useState([]);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'notifications'), where('toId', '==', currentUser.id));
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const notif = { id: change.doc.id, ...change.doc.data() };
          // Only toast for brand-new notifications, not the whole history on page load
          if (notif.timestamp > mountTime.current) {
            const from = await getUserById(notif.fromId);
            if (!from) return;
            const toastId = notif.id + '-' + Date.now();
            setToasts(t => [...t, { id: toastId, text: `${from.username} ${getMessage(notif)}` }]);
            setTimeout(() => setToasts(t => t.filter(x => x.id !== toastId)), 4000);
          }
        }
      });
    });
    return unsub;
  }, [currentUser]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-xs px-4">
      {toasts.map(t => (
        <div key={t.id} className="bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-fadeSlideIn">
          {t.text}
        </div>
      ))}
    </div>
  );
}
