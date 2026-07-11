import {
  collection, addDoc, getDocs, query, where,
  doc, updateDoc, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

const notifsRef = collection(db, 'notifications');

// Create a notification for a user (skips notifying yourself)
export const addNotification = async (toId, notif) => {
  if (toId === notif.fromId) return;
  await addDoc(notifsRef, {
    toId,
    read: false,
    timestamp: Date.now(),
    ...notif,
  });
};

// Get all notifications for a user, newest first
export const getUserNotifications = async (userId) => {
  const q = query(notifsRef, where('toId', '==', userId));
  const snap = await getDocs(q);
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return all.sort((a, b) => b.timestamp - a.timestamp);
};

// Mark all of a user's notifications as read (call this when they open the page)
export const markAllNotificationsRead = async (userId) => {
  const q = query(notifsRef, where('toId', '==', userId), where('read', '==', false));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(doc(db, 'notifications', d.id), { read: true }));
  await batch.commit();
};

// Get just the unread count (for the badge dot in TopNav)
export const getUnreadNotifCount = async (userId) => {
  const q = query(notifsRef, where('toId', '==', userId), where('read', '==', false));
  const snap = await getDocs(q);
  return snap.size;
};
