import { supabase } from '../lib/supabase';

export async function findOrCreateConversation(myId, otherId) {
  if (!myId || !otherId || myId === otherId) throw new Error('A valid recipient is required.');
  const { data, error } = await supabase.rpc('create_direct_conversation', { other_user_id: otherId });
  if (error) throw error;
  const conversationId = typeof data === 'string' ? data : data?.id || data?.conversation_id;
  if (!conversationId) throw new Error('The conversation could not be created.');
  return conversationId;
}

export async function getUserConversations(userId) {
  const { data: memberships, error: membershipError } = await supabase
    .from('conversation_members')
    .select('conversation_id,last_read_at')
    .eq('user_id', userId);
  if (membershipError) throw membershipError;
  const ids = (memberships || []).map(row => row.conversation_id);
  if (!ids.length) return [];

  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('id,conversation_type,created_at,last_message_at,direct_user_one,direct_user_two')
    .in('id', ids)
    .order('last_message_at', { ascending: false, nullsFirst: false });
  if (error) throw error;

  const results = await Promise.all((conversations || []).map(async conversation => {
    const otherId = conversation.direct_user_one === userId
      ? conversation.direct_user_two : conversation.direct_user_one;
    const [{ data: profile, error: profileError }, { data: latest, error: messageError }] = await Promise.all([
      supabase.from('profiles').select('id,username,display_name,bio,avatar_url,is_private,created_at').eq('id', otherId).maybeSingle(),
      supabase.from('messages').select('id,content,created_at,sender_id').eq('conversation_id', conversation.id).is('deleted_at', null).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (profileError) throw profileError;
    if (messageError) throw messageError;
    return {
      ...conversation,
      other: profile ? {
        id: profile.id, username: profile.username, name: profile.display_name || profile.username,
        bio: profile.bio || '', avatarImage: profile.avatar_url || null,
        isPrivate: Boolean(profile.is_private),
      } : null,
      lastMessage: latest?.content || 'Start a conversation',
      lastTimestamp: latest?.created_at || conversation.last_message_at || conversation.created_at,
    };
  }));
  return results.filter(item => item.other);
}

export async function getConversation(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id,conversation_id,sender_id,content,created_at,edited_at,deleted_at')
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(message => ({
    id: message.id, fromId: message.sender_id, text: message.content,
    timestamp: message.created_at, editedAt: message.edited_at,
  }));
}

export async function sendSupabaseMessage(conversationId, senderId, content) {
  const { data, error } = await supabase.from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select('id,conversation_id,sender_id,content,created_at')
    .single();
  if (error) throw error;
  const { error: updateError } = await supabase.from('conversations')
    .update({ last_message_at: data.created_at })
    .eq('id', conversationId);
  if (updateError) throw updateError;
  return { id: data.id, fromId: data.sender_id, text: data.content, timestamp: data.created_at };
}

export async function markConversationRead(conversationId, userId) {
  const { error } = await supabase.from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId).eq('user_id', userId);
  if (error) throw error;
}

export function subscribeToConversation(conversationId, onMessage) {
  const channel = supabase.channel(`conversation-${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, payload => onMessage(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}
