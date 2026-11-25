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
    const updateKeyboardInset = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty('--keyboard-inset', inset + 'px');
    };
    updateKeyboardInset();
    viewport.addEventListener('resize', updateKeyboardInset);
    viewport.addEventListener('scroll', updateKeyboardInset);
    window.addEventListener('orientationchange', updateKeyboardInset);
    return () => {
      viewport.removeEventListener('resize', updateKeyboardInset);
      viewport.removeEventListener('scroll', updateKeyboardInset);
      window.removeEventListener('orientationchange', updateKeyboardInset);
      document.documentElement.style.removeProperty('--keyboard-inset');
    };
  }, []);

  useEffect(() => {
    if (!conversationId || !currentUser?.id) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: conversation, error: conversationError } = await supabase
          .from('conversations')
          .select('id,direct_user_one,direct_user_two')
          .eq('id', conversationId)
          .single();
        if (conversationError) throw conversationError;
        const otherId = conversation.direct_user_one === currentUser.id
          ? conversation.direct_user_two : conversation.direct_user_one;
        const [{ data: profile, error: profileError }, initialMessages] = await Promise.all([
          supabase.from('profiles').select('id,username,display_name,bio,avatar_url,is_private,created_at').eq('id', otherId).maybeSingle(),
          getConversation(conversationId),
        ]);
        if (profileError) throw profileError;
        if (!profile) throw new Error('This conversation participant is unavailable.');
        if (!active) return;
        setOther({
          id: profile.id, username: profile.username, name: profile.display_name || profile.username,
          bio: profile.bio || '', avatarImage: profile.avatar_url || null,
          isPrivate: Boolean(profile.is_private),
        });
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
      setMessages(previous => previous.some(message => message.id === row.id) ? previous : [
        ...previous, { id: row.id, fromId: row.sender_id, text: row.content, timestamp: row.created_at },
      ]);
      if (row.sender_id !== currentUser.id) {
        markConversationRead(conversationId, currentUser.id).catch(err => console.error('Read receipt failed:', err));
      }
    });
    return () => { active = false; unsubscribe(); };
  }, [conversationId, currentUser?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async () => {
    const content = input.trim();
    if (!content || !currentUser?.id || sending) return;
    setSending(true);
    setInput('');
    try {
      const sent = await sendSupabaseMessage(conversationId, currentUser.id, content);
      setMessages(previous => previous.some(message => message.id === sent.id) ? previous : [...previous, sent]);
    } catch (err) {
      console.error('Failed to send Supabase message:', err);
      setInput(content);
      setError('Message was not sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[100dvh] min-h-0 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
      <div className="shrink-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 flex items-center gap-3">
        <button onClick={() => navigate('messages')} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        {other && <><div className="relative"><Avatar user={other} size={36}/><PresenceDot userId={other.id}/></div><span className="font-bold font-poppins text-gray-900 dark:text-white">{other.username}</span></>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-3 scrollbar-hide pb-6">
        {loading ? <p className="text-center text-gray-400 py-8">Loading conversation...</p> : null}
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        {messages.map(msg => {
          const isMe = msg.fromId === currentUser?.id;
          return <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMe ? 'text-white rounded-br-sm' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white rounded-bl-sm'}`} style={isMe ? { background: 'linear-gradient(135deg, #2563EB, #7C3AED)' } : {}}>
              {msg.text}
              <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.timestamp)}</p>
            </div>
          </div>;
        })}
        <div ref={bottomRef}/>
      </div>
      <div className="fixed left-0 z-40 w-full px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-white/95 dark:bg-slate-900/95 border-t border-gray-200 dark:border-slate-700 backdrop-blur-xl" style={{ bottom: "calc(var(--keyboard-inset, 0px) + env(safe-area-inset-bottom))" }}>
        <div className="flex items-center gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Message..." className="flex-1 min-w-0 bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-3 text-base text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"/>
          <button onClick={send} disabled={!input.trim() || sending || loading} className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center disabled:opacity-40" aria-label="Send message">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
