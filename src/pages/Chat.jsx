import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { listenToConversation, sendMessage, markConversationRead } from '../utils/firestoreMessages';
import { addNotification } from '../utils/firestoreNotifications';
import { genId, formatTime } from '../utils/helpers';
import Avatar from '../components/common/Avatar';
import PresenceDot from '../components/common/PresenceDot';

export default function Chat({ conversationId, navigate }) {
  const { currentUser, getUserById } = useUser();
  const [convo, setConvo] = useState(null);
  const [other, setOther] = useState(null);
  const [input, setInput] = useState('');
  const bottomRef = useRef();

  // Listen live to this conversation — new messages appear instantly,
  // even ones sent from the other person's device, with no refresh needed.
  useEffect(() => {
    if (!conversationId || !currentUser) return;
    const unsub = listenToConversation(conversationId, async (data) => {
      setConvo(data);
      const otherId = data.participants.find(id => id !== currentUser.id);
      const otherUser = await getUserById(otherId);
      setOther(otherUser);
      setTimeout(() => bottomRef.current?.scrollIntoView(), 100);

      // Mark read every time new data comes in while this chat is open,
      // so the unread badge clears immediately and stays cleared while viewing.
      markConversationRead(conversationId, currentUser.id).catch(err =>
        console.error('Failed to mark conversation read:', err)
      );
    });
    return unsub;
  }, [conversationId, currentUser]);

  const send = async () => {
    if (!input.trim() || !convo) return;
    const msg = { id: genId(), fromId: currentUser.id, text: input.trim(), timestamp: Date.now() };
    setInput('');
    try {
      await sendMessage(conversationId, msg);
      if (other) {
        await addNotification(other.id, { type: 'message', fromId: currentUser.id, conversationId });
      }
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('messages')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-200" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        {other && (
            <>
          <div className="relative">
                    <Avatar user={other} size={36} />
                    <PresenceDot userId={other.id} />
        </div>
            <span className="font-bold font-poppins text-gray-900 dark:text-white">{other.username}</span>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide pb-24">
        {(convo?.messages || []).map(msg => {
          const isMe = msg.fromId === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                isMe ? 'text-white rounded-br-sm' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white rounded-bl-sm'
              }`} style={isMe ? { background: 'linear-gradient(135deg, #2563EB, #7C3AED)' } : {}}>
                {msg.text}
                <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 py-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Message..."
            className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
