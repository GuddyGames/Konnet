import { storage, KEYS } from './storage';
import { genId, getAvatarColor } from './helpers';

const SEED_USERS = [
  { id: 'u1', username: 'amara.osei', password: 'amara123', name: 'Amara Osei', bio: 'Developer & creator ', avatarColor: '#7C3AED', followers: ['u2', 'u3'], following: ['u2'], posts: 0 },
  { id: 'u2', username: 'lena.dev', password: 'lena123', name: 'Lena Müller', bio: 'Design systems & UI ', avatarColor: '#2563EB', followers: ['u1'], following: ['u1', 'u3'], posts: 0 },
  { id: 'u3', username: 'karanbuilds', password: 'karan123', name: 'Karan Mehta', bio: 'Building cool things ✨', avatarColor: '#EC4899', followers: ['u1', 'u2'], following: ['u1'], posts: 0 },
  { id: 'u4', username: 'zaracreates', password: 'zara123', name: 'Zara Collins', bio: 'Photography & art ', avatarColor: '#10B981', followers: ['u1'], following: ['u2'], posts: 0 },
];

const SEED_POSTS = [
  { id: 'p1', authorId: 'u1', image: null, caption: 'Just shipped my first React Native app  The grind never stops!', likes: ['u2', 'u3'], comments: [{ id: 'c1', authorId: 'u2', text: 'Congrats! ', timestamp: Date.now() - 300000 }], timestamp: Date.now() - 600000, gradientIndex: 0 },
  { id: 'p2', authorId: 'u2', image: null, caption: 'Design systems save more time than they cost  Three months in, velocity up 40%', likes: ['u1'], comments: [], timestamp: Date.now() - 3600000, gradientIndex: 1 },
  { id: 'p3', authorId: 'u3', image: null, caption: 'Asked GuddyAi to help me write my bio and it nailed it  This AI thing is wild.', likes: ['u1', 'u2', 'u4'], comments: [{ id: 'c2', authorId: 'u1', text: 'GuddyAi is ', timestamp: Date.now() - 7200000 }], timestamp: Date.now() - 10800000, gradientIndex: 2 },
  { id: 'p4', authorId: 'u4', image: null, caption: 'New photography drop  Sometimes you just have to disconnect to reconnect.', likes: ['u1', 'u2'], comments: [], timestamp: Date.now() - 86400000, gradientIndex: 3 },
];

const SEED_STORIES = [
  { id: 's1', authorId: 'u2', color: '#2563EB', timestamp: Date.now() - 3600000, viewers: [] },
  { id: 's2', authorId: 'u3', color: '#EC4899', timestamp: Date.now() - 7200000, viewers: [] },
  { id: 's3', authorId: 'u4', color: '#10B981', timestamp: Date.now() - 10800000, viewers: [] },
];

const SEED_NOTIFICATIONS = [
  { id: 'n1', toId: 'u1', type: 'like', fromId: 'u2', postId: 'p1', timestamp: Date.now() - 120000, read: false },
  { id: 'n2', toId: 'u1', type: 'follow', fromId: 'u3', timestamp: Date.now() - 3600000, read: false },
  { id: 'n3', toId: 'u1', type: 'comment', fromId: 'u1', postId: 'p2', text: 'Great point!', timestamp: Date.now() - 7200000, read: true },
];

const SEED_CONVERSATIONS = [
  { id: 'cv1', participants: ['u1', 'u2'], messages: [{ id: 'm1', fromId: 'u2', text: 'Hey, loved your post!', timestamp: Date.now() - 600000 }], lastMessage: 'Hey, loved your post!', lastTimestamp: Date.now() - 600000 },
  { id: 'cv2', participants: ['u1', 'u3'], messages: [{ id: 'm2', fromId: 'u3', text: "Let's collab on something!", timestamp: Date.now() - 3600000 }], lastMessage: "Let's collab on something!", lastTimestamp: Date.now() - 3600000 },
];

export const seedData = () => {
  if (storage.get(KEYS.SEEDED)) return;

  // Seed users (as a map: id -> user)
  const usersMap = {};
  SEED_USERS.forEach(u => { usersMap[u.username] = u; });
  storage.set(KEYS.USERS, usersMap);

  storage.set(KEYS.POSTS, SEED_POSTS);
  storage.set(KEYS.STORIES, SEED_STORIES);
  storage.set(KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  storage.set(KEYS.CONVERSATIONS, SEED_CONVERSATIONS);
  storage.set(KEYS.SEEDED, true);
};

export { SEED_USERS };
