import { genId } from "./helpers";
// Keys for localStorage
export const KEYS = {
  USERS: 'konnet_users',
  CURRENT_USER: 'konnet_current_user',
  POSTS: 'konnet_posts',
  STORIES: 'konnet_stories',
  NOTIFICATIONS: 'konnet_notifications',
  CONVERSATIONS: 'konnet_conversations',
  DARK_MODE: 'konnet_darkmode',
  SEEDED: 'konnet_seeded',
};

// Simple localStorage wrapper
export const storage = {
  get: (key) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { console.error('Storage error:', e); }
  },
  remove: (key) => localStorage.removeItem(key),
};


export const getPosts = () => {
    return storage.get(KEYS.POSTS) || [];
};

export const savePosts = (post) => {
    const posts = getPosts();
    const newPost = {
        id: genId(),
        createdAt: new Date().toISOString(),
        ...post,
    };
    posts.unshift(newPost);
    storage.set(KEYS.POSTS, posts);
    return newPost;
}

export const deletePost = (id) => {
    const posts = getPosts().filter((p) => p.id !== id);
    storage.sets(KEYS.POSTS, posts);
    return posts;
};

export const getUsers = () => {
    return storage.get(KEYS.USERS) || [];
};

export const saveUsers = (users) => {
  storage.set(KEYS.USERS, users);
  return users;
};

export const getConversations = () => storage.get(KEYS.CONVERSATIONS) || [];
export const saveConversations = (convos) => storage.set(KEYS.CONVERSATIONS, convos); 

export const searchUsers = (query) => {
  const users = storage.get(KEYS.USERS) || {};
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return Object.values(users).filter(
    u => u.username.includes(q) || u.name.toLowerCase().includes(q)
  );
};


export const startConversation = (myId, otherId) => {
  const all = getConversations();
  const existing = all.find(
    c => c.participants.includes(myId) && c.participants.includes(otherId)
  );
  if (existing) return existing.id;

  const newConvo = {
    id: genId(),
    participants: [myId, otherId],
    messages: [],
    lastMessage: '',
    lastTimestamp: Date.now(),
  };
  storage.set(KEYS.CONVERSATIONS, [...all, newConvo]);
  return newConvo.id;
};

export const addNotification = (toId, notif) => {
  if (toId === notif.fromId) return;
  const all = storage.get(KEYS.NOTIFICATIONS) || [];
  const newNotif = { id: genId(), toId, read: false, timestamp: Date.now(), ...notif };
  storage.set(KEYS.NOTIFICATIONS, [newNotif, ...all]);
};

export const getUnreadNotifCount = (userId) => {
  const all = storage.get(KEYS.NOTIFICATIONS) || [];
  return all.filter(n => n.toId === userId && !n.read).length;
};

export const getUnreadMessageCount = (userId) => {
  const all = storage.get(KEYS.NOTIFICATIONS) || [];
  return all.filter(c => c.participants.includes(userId) && c.lastReadBy?.[userId] !== c.lastTimestamp).length;
};


