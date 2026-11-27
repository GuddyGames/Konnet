import { supabase } from '../lib/supabase';

export const getUserNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, recipient_id, actor_id, type, post_id, comment_id, read_at, created_at')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const markAllNotificationsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .is('read_at', null);
  if (error) throw error;
};

export const getUnreadNotifCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .is('read_at', null);
  if (error) throw error;
  return count || 0;
};

export const addNotification = async (recipientId, actorId, type, postId = null, commentId = null) => {
  if (!recipientId || !actorId || recipientId === actorId) return;
  const { error } = await supabase.from('notifications').insert({
    recipient_id: recipientId, actor_id: actorId, type, post_id: postId, comment_id: commentId,
  });
  if (error) throw error;
};
