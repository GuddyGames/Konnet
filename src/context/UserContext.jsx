import { createContext, useContext, useState } from 'react';
import { storage, KEYS, addNotification } from '../utils/storage';
import { genId, getAvatarColor } from '../utils/helpers';
import Loader from '../components/common/Loader';

const UserContext = createContext(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => storage.get(KEYS.CURRENT_USER));
  const [darkMode, setDarkMode] = useState(() => storage.get(KEYS.DARK_MODE) || false);

  // Sign up — creates a new account
  const signup = (username, password, name) => {
    if (!username.trim() || !password.trim() || !name.trim()) {
      return { error: 'Please fill in all fields.' };
    }
    const normalizedUsername = username.trim().toLowerCase();
    const users = storage.get(KEYS.USERS) || {};
    if (users[normalizedUsername]) return { error: 'Username already taken.' };

    const newUser = {
      id: genId(),
      username: normalizedUsername,
      password,
      name: name.trim(),
      bio: '',
      avatarColor: getAvatarColor(username),
      avatarImage: null,
      followers: [],
      following: [],
      timestamp: Date.now(),
    };
    users[normalizedUsername] = newUser;
    storage.set(KEYS.USERS, users);

    // Auto login after signup
    const safeUser = { ...newUser };
    delete safeUser.password;
    setCurrentUser(safeUser);
    storage.set(KEYS.CURRENT_USER, safeUser);
    return { success: true };
  };

  // Login — checks credentials
  const login = (username, password) => {
    const users = storage.get(KEYS.USERS) || {};
    const user = users[username.trim().toLowerCase()];
    if (!user || user.password !== password) {
      return { error: 'Invalid username or password.' };
    }
    const safeUser = { ...user };
    delete safeUser.password;
    setCurrentUser(safeUser);
    storage.set(KEYS.CURRENT_USER, safeUser);
    return { success: true };
  };


  // Logout
  const logout = () => {
    setCurrentUser(null);
    storage.remove(KEYS.CURRENT_USER);
  };
  
  // Update profile (name, bio, avatarImage)
  const updateProfile = (updates) => {
    const users = storage.get(KEYS.USERS) || {};
    const user = users[currentUser.username];
    if (!user) return { error: 'User not found.' };

    const updatedUser = { ...user, ...updates };
    users[currentUser.username] = updatedUser;
    storage.set(KEYS.USERS, users);

    const safeUser = { ...updatedUser };
    delete safeUser.password;
    setCurrentUser(safeUser);
    storage.set(KEYS.CURRENT_USER, safeUser);
    return { success: true };
  };

  // Follow / unfollow a user
  const toggleFollow = (targetUserId) => {
    const users = storage.get(KEYS.USERS) || {};
    const me = users[currentUser.username];
    const targetEntry = Object.values(users).find(u => u.id === targetUserId);
    if (!me || !targetEntry) return;

    const isFollowing = me.following.includes(targetUserId);
    if (isFollowing) {
      me.following = me.following.filter(id => id !== targetUserId);
      targetEntry.followers = targetEntry.followers.filter(id => id !== me.id);
    } else {
      me.following.push(targetUserId);
      addNotification(targetEntry.id, { type: 'follow', fromId: me.id });
      targetEntry.followers.push(me.id);
    }
    users[me.username] = me;
    users[targetEntry.username] = targetEntry;
    storage.set(KEYS.USERS, users);

    const safeUser = { ...me };
    delete safeUser.password;
    setCurrentUser(safeUser);
    storage.set(KEYS.CURRENT_USER, safeUser);
  };

  // Get user by id or username
  const getUserById = (id) => {
    const users = storage.get(KEYS.USERS) || {};
    return Object.values(users).find(u => u.id === id) || null;
  };

  const getUserByUsername = (username) => {
    const users = storage.get(KEYS.USERS) || {};
    return users[username.toLowerCase()] || null;
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    storage.set(KEYS.DARK_MODE, next);
    document.documentElement.classList.toggle('dark', next);
  };

    return (
  


    <UserContext.Provider value={{
      currentUser, darkMode,
      signup, login, logout, updateProfile, toggleFollow,
      getUserById, getUserByUsername, toggleDarkMode,
    }}>
      {children}
    </UserContext.Provider>  

  );
};
