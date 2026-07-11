import {
  collection, addDoc, getDocs, getDoc, query, where,
  doc, updateDoc, arrayUnion, onSnapshot, orderBy,
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
    lastTimestamp: Date.now(),
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
    lastTimestamp: message.timestamp,
  });
};
