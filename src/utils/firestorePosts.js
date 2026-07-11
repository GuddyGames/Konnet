import {
  collection, addDoc, getDocs, getDoc, query, orderBy,
  doc, updateDoc, deleteDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';

const postsRef = collection(db, 'posts');

// Get all posts, newest first
export const getAllPosts = async () => {
  const q = query(postsRef, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Create a new post
export const createPost = async (postData) => {
  const docRef = await addDoc(postsRef, {
    ...postData,
    likes: [],
    comments: [],
    timestamp: Date.now(),
  });
  return docRef.id;
};

// Delete a post
export const deletePost = async (postId) => {
  await deleteDoc(doc(db, 'posts', postId));
};

// Like / unlike a post
export const toggleLikePost = async (postId, userId, isLiked) => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
};

// Add a comment to a post
export const addCommentToPost = async (postId, comment) => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    comments: arrayUnion(comment),
  });
};

// Get Post
export const getPostById = async (postId) => {
  const snap = await getDoc(doc(db, 'posts', postId));
  return snap.exists() ? { id: postId, ...snap.data() } : null;
};