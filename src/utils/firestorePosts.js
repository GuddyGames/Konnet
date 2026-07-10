import {
    collection, addDoc, getDocs, query, orderBy,
    doc, updateDoc, deleteDoc, arrayUnion, arrayRemove,
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  const postsRef = collection(db, 'posts');
  
  export const getAllPosts = async () => {
    const q = query(postsRef, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  };
  
  export const createPost = async (postData) => {
    const docRef = await addDoc(postsRef, {
      ...postData,
      likes: [],
      comments: [],
      timestamp: Date.now(),
    });
    return docRef.id;
  };
  
  export const deletePost = async (postId) => {
    await deleteDoc(doc(db, 'posts', postId));
  };
  
  export const toggleLikePost = async (postId, userId, isLiked) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
    });
  };
  
  export const addCommentToPost = async (postId, comment) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion(comment),
    });
  };
  