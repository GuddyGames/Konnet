import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs,
  arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { getAvatarColor } from '../utils/helpers';
import { addNotification } from '../utils/firestoreNotifications';

const UserContext = createContext(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
};

// Firebase Auth requires an email, so we turn usernames into a fake internal
// email address behind the scenes. The user never sees or types this.
const usernameToEmail = (username) => `${username.trim().toLowerCase()}@konnet.app`;

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('konnet_darkmode') === 'true');

  // Watch Firebase auth state; load the matching Firestore profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setCurrentUser({ id: firebaseUser.uid, ...userDoc.data() });
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Sign up — creates a Firebase Auth account + Firestore profile
  const signup = async (username, password, name) => {
    if (!username.trim() || !password.trim() || !name.trim()) {
      return { error: 'Please fill in all fields.' };
    }
    const normalizedUsername = username.trim().toLowerCase();

    // Check username isn't already taken
    const existing = await getDocs(query(collection(db, 'users'), where('username', '==', normalizedUsername)));
    if (!existing.empty) return { error: 'Username already taken.' };

    try {
      const cred = await createUserWithEmailAndPassword(auth, usernameToEmail(normalizedUsername), password);
      const newUser = {
        username: normalizedUsername,
        name: name.trim(),
        bio: '',
        avatarColor: getAvatarColor(username),
        avatarImage: null,
        followers: [],
        following: [],
        timestamp: Date.now(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), newUser);
      setCurrentUser({ id: cred.user.uid, ...newUser });
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  // Login with username + password
  const login = async (username, password) => {
    try {
      await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
      return { success: true };
    } catch (err) {
      return { error: 'Invalid username or password.' };
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      const existing = await getDoc(userRef);

      if (!existing.exists()) {
        // First-time Google sign-in: create a Firestore profile
        const baseUsername = (result.user.email || 'user').split('@')[0].toLowerCase();
        const newUser = {
          username: baseUsername,
          name: result.user.displayName || baseUsername,
          bio: '',
          avatarColor: getAvatarColor(baseUsername),
          avatarImage: result.user.photoURL || null,
          followers: [],
          following: [],
          timestamp: Date.now(),
        };
        await setDoc(userRef, newUser);
      }
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  const logout = () => signOut(auth);

  const updateProfile = async (updates) => {
    if (!currentUser) return { error: 'Not logged in.' };
    await updateDoc(doc(db, 'users', currentUser.id), updates);
    setCurrentUser(prev => ({ ...prev, ...updates }));
    return { success: true };
  };

  const toggleFollow = async (targetUserId) => {
    if (!currentUser) return;
    const isFollowing = currentUser.following?.includes(targetUserId);
    const meRef = doc(db, 'users', currentUser.id);
    const targetRef = doc(db, 'users', targetUserId);

    if (isFollowing) {
      await updateDoc(meRef, { following: arrayRemove(targetUserId) });
      await updateDoc(targetRef, { followers: arrayRemove(currentUser.id) });
      setCurrentUser(prev => ({ ...prev, following: prev.following.filter(id => id !== targetUserId) }));
    } else {
      await updateDoc(meRef, { following: arrayUnion(targetUserId) });
      await updateDoc(targetRef, { followers: arrayUnion(currentUser.id) });
      setCurrentUser(prev => ({ ...prev, following: [...(prev.following || []), targetUserId] }));
      await addNotification(targetUserId, { type: 'follow', fromId: currentUser.id });
    }
  };

  const getUserById = async (id) => {
    if (!id) return null;
    const snap = await getDoc(doc(db, 'users', id));
    return snap.exists() ? { id, ...snap.data() } : null;
  };

  const getUserByUsername = async (username) => {
    if (!username) return null;
    const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('konnet_darkmode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <UserContext.Provider value={{
      currentUser, darkMode, authLoading,
      signup, login, loginWithGoogle, logout, updateProfile, toggleFollow,
      getUserById, getUserByUsername, toggleDarkMode,
    }}>
      {children}
    </UserContext.Provider>
  );
};
