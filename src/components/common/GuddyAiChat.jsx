import { useState, useRef, useEffect } from 'react';

export default function GuddyAiChat({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hey! I'm GuddyAi ✦ — your smart assistant on Konnet. Ask me anything or let me help write a caption!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const txt = input.trim();
    setInput('');
    setMessages(p => [...p, { role: 'user', text: txt }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: txt, history })
      });
      const data = await res.json();
      setMessages(p => [...p, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      setMessages(p => [...p, { role: 'assistant', text: 'Connection issue - try again. ' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slideUp fixed bottom-20 right-4 w-72 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: 'linear-gradient(135deg, #0F172A, #1E1B4B)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>✦</div>
          <div>
            <p className="text-white font-bold text-sm font-poppins">GuddyAi</p>
            <p className="text-xs" style={{ color: '#F59E0B' }}>Your AI on Konnet</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'text-white rounded-br-sm'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
            }`} style={m.role === 'user' ? { background: 'linear-gradient(135deg, #2563EB, #7C3AED)' } : {}}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-gray-200 dark:border-slate-700">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask GuddyAi..."
          className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-xl px-3 py-2 text-sm outline-none text-gray-800 dark:text-white placeholder-gray-400"
        />
        <button onClick={send} className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}







