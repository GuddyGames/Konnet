import { supabase } from '../lib/supabase';

// One shared channel per browser tab. Multiple PresenceDot components subscribe
// to this manager instead of opening duplicate channels with the same topic.
const CHANNEL = 'konnet-presence';
let channel = null;
let activeUserId = null;
let subscribed = false;
const listeners = new Map();
let visibilityHandler = null;

const notifyListeners = () => {
  if (!channel) return;
  const state = channel.presenceState();
  listeners.forEach((callbacks, userId) => {
    const online = Boolean(state[userId]?.length);
    callbacks.forEach(callback => callback(online));
  });
};

const ensureChannel = () => {
  if (channel) return channel;
  channel = supabase.channel(CHANNEL, { config: { presence: { key: 'konnet-tab-' + Math.random().toString(36).slice(2) } } });
  channel.on('presence', { event: 'sync' }, notifyListeners)
    .on('presence', { event: 'join' }, notifyListeners)
    .on('presence', { event: 'leave' }, notifyListeners);
  channel.subscribe(async status => {
    subscribed = status === 'SUBSCRIBED';
    if (subscribed && activeUserId && document.visibilityState === 'visible') {
      await channel.track({ user_id: activeUserId, online_at: new Date().toISOString() });
    }
    notifyListeners();
  });
  return channel;
};

export const startPresenceHeartbeat = userId => {
  if (!userId) return () => {};
  activeUserId = userId;
  const shared = ensureChannel();

  if (!visibilityHandler) {
    visibilityHandler = async () => {
      if (!channel || !subscribed || !activeUserId) return;
      if (document.visibilityState === 'visible') {
        await channel.track({ user_id: activeUserId, online_at: new Date().toISOString() });
      } else {
        await channel.untrack();
      }
      notifyListeners();
    };
    document.addEventListener('visibilitychange', visibilityHandler);
  }

  if (subscribed && document.visibilityState === 'visible') {
    shared.track({ user_id: userId, online_at: new Date().toISOString() });
  }

  return () => {
    if (activeUserId !== userId) return;
    activeUserId = null;
    if (channel) channel.untrack();
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = null;
    }
    if (channel) {
      const old = channel;
      channel = null;
      subscribed = false;
      supabase.removeChannel(old);
    }
  };
};

export const listenToUserPresence = (userId, callback) => {
  if (!userId) { callback(false); return () => {}; }
  const callbacks = listeners.get(userId) || new Set();
  callbacks.add(callback);
  listeners.set(userId, callbacks);
  ensureChannel();
  notifyListeners();
  return () => {
    const current = listeners.get(userId);
    if (!current) return;
    current.delete(callback);
    if (!current.size) listeners.delete(userId);
  };
};
