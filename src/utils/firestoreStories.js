import {
  collection, addDoc, getDocs, query, where,
  doc, updateDoc, arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';

const storiesRef = collection(db, 'stories');
const DAY_MS = 24 * 60 * 60 * 1000;

// Get all stories from the last 24 hours (older ones are simply never returned —
// no cleanup job needed, they just age out of every query automatically)
export const getActiveStories = async () => {
  const cutoff = Date.now() - DAY_MS;
  const q = query(storiesRef, where('timestamp', '>', cutoff));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Create a new story
export const createStory = async (storyData) => {
  const docRef = await addDoc(storiesRef, {
    ...storyData,
    timestamp: Date.now(),
    viewers: [],
  });
  return docRef.id;
};

// Mark a story as viewed by a user
export const markStoryViewed = async (storyId, userId) => {
  await updateDoc(doc(db, 'stories', storyId), {
    viewers: arrayUnion(userId),
  });
};
