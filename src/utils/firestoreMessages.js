import {
  collection, addDoc, getDocs, getDoc, query, where,
  doc, updateDoc, arrayUnion, onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

const convosRef = collection(db, 'conversations');

// Get all conversations a user is part of, newest activity first
export const getUserConversations = async (userId) => {
  const q = query(convosRef, where('participants', 'array-contains', userId));
  const snap = await getDocs(q);
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return all.sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0));
};

// Get a single conversation by id
export const getConversationById = async (conversationId) => {
  const snap = await getDoc(doc(db, 'conversations', conversationId));
  return snap.exists() ? { id: conversationId, ...snap.data() } : null;
};

// Listen live to a single conversation (messages update in real time, no refresh needed)
export const listenToConversation = (conversationId, callback) => {
  return onSnapshot(doc(db, 'conversations', conversationId), (snap) => {
    if (snap.exists()) callback({ id: conversationId, ...snap.data() });
  });
};

// Find an existing 1:1 conversation between two users, or create a new one
export const findOrCreateConversation = async (myId, otherId) => {
  const q = query(convosRef, where('participants', 'array-contains', myId));
  const snap = await getDocs(q);
  const existing = snap.docs.find(d => d.data().participants.includes(otherId));
  if (existing) return existing.id;

  const newConvo = {
    participants: [myId, otherId],
    messages: [],
    lastMessage: '',
    lastMessageFromId: null,
    lastTimestamp: Date.now(),
    lastReadBy: {},
  };
  const docRef = await addDoc(convosRef, newConvo);
  return docRef.id;
};

// Send a message in a conversation
export const sendMessage = async (conversationId, message) => {
  const convoRef = doc(db, 'conversations', conversationId);
  await updateDoc(convoRef, {
    messages: arrayUnion(message),
    lastMessage: message.text,
    lastMessageFromId: message.fromId,
    lastTimestamp: message.timestamp,
  });
};

// Mark a conversation as read by a user (call this whenever they open/view it)
export const markConversationRead = async (conversationId, userId) => {
  const convoRef = doc(db, 'conversations', conversationId);
  await updateDoc(convoRef, {
    [`lastReadBy.${userId}`]: Date.now(),
  });
};

// Count how many conversations have unread messages for a user
// (a conversation is "unread" if the last message wasn't sent by this user,
// and it arrived after the user's last recorded read time)
export const getUnreadConversationCount = async (userId) => {
  const convos = await getUserConversations(userId);
  return convos.filter(c => {
    if (c.lastMessageFromId === userId) return false; // their own message, not unread
    const lastRead = c.lastReadBy?.[userId] || 0;
    return (c.lastTimestamp || 0) > lastRead;
  }).length;
};

const isSameDay = (a, b) => {
  const d1 = new Date(a), d2 = new Date(b);
  return d1.toDateString() === d2.toDateString();
};

const isYesterday = (timestamp, now) => {
  const oneDayMs = 24 * 60 * 60 * 1000;
  return isSameDay(timestamp, now - oneDayMs);
};
// calls  this whenever a message is sent - updates or resets the streak
export const updateStreak = async (conversationId, convo) => {
  const now = Date.now();
  const lastActivity = convo.streakLastActive || 0;

  let newStreak;
  if (isSameDay(lastActivity, now)) {
    newStreak = convo.streak || 0; // already counted today, no change
  } else if (isYesterday(lastActivity, now)) {
    newStreak = (convo.streak || 0) + 1;// consecutive day, streak grows
  } else {
    newStreak = 1; // missed a day (or first message ever), streak restarts
  }
   
  await updateDoc(doc(db, 'conversations', conversationId), {
    streak: newStreak,
    streakLastActive: now,
  });
  return newStreak;
};
