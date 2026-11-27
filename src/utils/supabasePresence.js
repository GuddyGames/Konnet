import { supabase } from '../lib/supabase';

const CHANNEL = 'konnet-presence';

export const startPresenceHeartbeat = (userId) => {
  if (!userId) return () => {};
  const channel = supabase.channel(CHANNEL, { config: { presence: { key: userId } } });
  let active = true;
  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED' && active) {
      await channel.track({ user_id: userId, online_at: new Date().toISOString() });
    }
  });
  const onVisibility = async () => {
    if (!active) return;
    if (document.visibilityState === 'visible') {
      await channel.track({ user_id: userId, online_at: new Date().toISOString() });
    } else {
      await channel.untrack();
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    active = false;
    document.removeEventListener('visibilitychange', onVisibility);
    channel.untrack();
    supabase.removeChannel(channel);
  };
};

export const listenToUserPresence = (userId, callback) => {
  if (!userId) { callback(false); return () => {}; }
  const channel = supabase.channel(CHANNEL, { config: { presence: { key: userId } } });
  const update = () => {
    const state = channel.presenceState();
    callback(Boolean(state[userId]?.length));
  };
  channel.on('presence', { event: 'sync' }, update)
    .on('presence', { event: 'join' }, update)
    .on('presence', { event: 'leave' }, update)
    .subscribe((status) => { if (status === 'SUBSCRIBED') update(); });
  return () => supabase.removeChannel(channel);
};
