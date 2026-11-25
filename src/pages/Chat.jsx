import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { getConversation, sendSupabaseMessage, markConversationRead, subscribeToConversation } from '../utils/supabaseMessages';
import { supabase } from '../lib/supabase';
import { formatTime } from '../utils/helpers';
import Avatar from '../components/common/Avatar';
import PresenceDot from '../components/common/PresenceDot';

export default function Chat({ conversationId, navigate }) {
  const { currentUser } = useUser();
  const [messages, setMessages] = useState([]);
  const [other, setOther] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => document.documentElement.style.setProperty('--keyboard-inset', Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) + 'px');
    update(); viewport.addEventListener('resize', update); viewport.addEventListener('scroll', update); window.addEventListener('orientationchange', update);
    return () => { viewport.removeEventListener('resize', update); viewport.removeEventListener('scroll', update); window.removeEventListener('orientationchange', update); document.documentElement.style.removeProperty('--keyboard-inset'); };
  }, []);

  useEffect(() => {
    if (!conversationId || !currentUser?.id) return;
    let active = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const { data: conversation, error: conversationError } = await supabase.from('conversations').select('id,direct_user_one,direct_user_two').eq('id', conversationId).single();
        if (conversationError) throw conversationError;
        const otherId = conversation.direct_user_one === currentUser.id ? conversation.direct_user_two : conversation.direct_user_one;
        const [{ data: profile, error: profileError }, initialMessages] = await Promise.all([
          supabase.from('profiles').select('id,username,display_name,bio,avatar_url,is_private,created_at').eq('id', otherId).maybeSingle(),
          getConversation(conversationId),
        ]);
        if (profileError) throw profileError;
        if (!profile) throw new Error('This conversation participant is unavailable.');
        if (!active) return;
        setOther({ id: profile.id, username: profile.username, name: profile.display_name || profile.username, bio: profile.bio || '', avatarImage: profile.avatar_url || null, isPrivate: Boolean(profile.is_private) });
        setMessages(initialMessages);
        await markConversationRead(conversationId, currentUser.id);
        setLoading(false);
      } catch (err) {
        console.error('Could not load conversation:', err);
        if (active) { setError('Could not open this conversation. Check your connection and try again.'); setLoading(false); }
      }
    };
    load();
    const unsubscribe = subscribeToConversation(conversationId, async row => {
      if (!active || row.deleted_at) return;
      setMessages(previous => previous.some(message => message.id === row.id) ? previous : [...previous, { id: row.id, fromId: row.sender_id, text: row.content, timestamp: row.created_at }]);
      if (row.sender_id !== currentUser.id) markConversationRead(conversationId, currentUser.id).catch(err => console.error('Read receipt failed:', err));
    });
    return () => { active = false; unsubscribe(); };
  }, [conversationId, currentUser?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const send = async () => {
    const content = input.trim();
    if (!content || !currentUser?.id || sending) return;
    setSending(true); setInput('');
    try {
      const sent = await sendSupabaseMessage(conversationId, currentUser.id, content);
      setMessages(previous => previous.some(message => message.id === sent.id) ? previous : [...previous, sent]);
    } catch (err) {
      console.error('Failed to send Supabase message:', err); setInput(content); setError('Message was not sent. Please try again.');
    } finally { setSending(false); }
  };

  return (
    <main className="konnet-chat-page flex h-[100dvh] min-h-0 flex-col overflow-hidden">
      <header className="konnet-chat-header shrink-0">
        <button type="button" onClick={() => navigate('messages')} aria-label="Back to chats" className="konnet-chat-back"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></button>
        {other && <button type="button" onClick={() => navigate(`profile/${other.username}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className="relative"><Avatar user={other} size={44}/><PresenceDot userId={other.id}/></span><span className="min-w-0"><strong className="block truncate text-[15px] font-semibold text-slate-900 dark:text-white">{other.name}</strong><small className="text-xs text-slate-400">On Konnet</small></span></button>}
        {other && <button type="button" onClick={() => navigate(`profile/${other.username}`)} className="konnet-chat-profile-button">Profile</button>}
      </header>
      <section className="konnet-chat-thread flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-5 scrollbar-hide" aria-label="Messages">
        {loading && <p className="py-8 text-center text-sm text-slate-400">Loading conversation...</p>}
        {error && <p role="alert" className="mb-3 text-center text-sm text-red-500">{error}</p>}
        {messages.map(msg => {
          const isMe = msg.fromId === currentUser?.id;
          return <div key={msg.id} className={`mb-3 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] px-4 py-3 text-[14px] leading-5 shadow-sm ${isMe ? 'konnet-message-out' : 'konnet-message-in'}`}>
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              <p className={`mt-1 text-right text-[10px] ${isMe ? 'text-white/70' : 'text-slate-400'}`}>{formatTime(msg.timestamp)} {isMe ? '✓✓' : ''}</p>
            </div>
          </div>;
        })}
        <div ref={bottomRef}/>
      </section>
      <footer className="konnet-chat-composer" style={{ bottom: 'var(--keyboard-inset, 0px)' }}>
        <form className="flex items-center gap-2" onSubmit={e => { e.preventDefault(); send(); }}>
          <div className="konnet-chat-input-wrap flex min-w-0 flex-1 items-center gap-2">
            <input aria-label="Write a message" value={input} onChange={e => setInput(e.target.value)} placeholder="Write messages..." />
          </div>
          <button type="submit" disabled={!input.trim() || sending || loading} className="konnet-chat-send" aria-label="Send message"><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M2.4 20.4 22 12 2.4 3.6l.1 6.5 13.8 1.9-13.8 1.9z"/></svg></button>
        </form>
      </footer>
    </main>
  );
}
