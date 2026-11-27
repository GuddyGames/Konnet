import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';

const messageFor = (type) => ({
  message: 'sent you a message',
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
  follow_request: 'requested to follow you',
  mention: 'mentioned you',
}[type] || 'interacted with you');

function playAlert() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.setValueAtTime(660, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
    oscillator.onended = () => context.close();
  } catch (error) {
    console.debug('Notification sound unavailable:', error);
  }
}

export default function NotificationToast() {
  const { currentUser, getUserById } = useUser();
  const [toasts, setToasts] = useState([]);
  const seen = useRef(new Set());

  useEffect(() => {
    if (!currentUser?.id) return undefined;
    const channel = supabase.channel('konnet-notifications-' + currentUser.id)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: 'recipient_id=eq.' + currentUser.id,
      }, async (payload) => {
        const notif = payload.new;
        if (!notif?.id || seen.current.has(notif.id)) return;
        seen.current.add(notif.id);
        const actor = notif.actor_id ? await getUserById(notif.actor_id) : null;
        const username = actor?.username || 'Someone';
        const toast = { id: notif.id, text: username + ' ' + messageFor(notif.type) };
        setToasts(items => [...items.slice(-2), toast]);
        if (document.visibilityState === 'visible') playAlert();
        else if ('Notification' in window && Notification.permission === 'granted') {
          try {
            const registration = await navigator.serviceWorker?.getRegistration();
            if (registration) await registration.showNotification('Konnet', {
              body: toast.text, icon: '/icons/konnet-icon.svg', tag: notif.id,
            });
          } catch (error) { console.debug('System notification unavailable:', error); }
        }
        window.setTimeout(() => setToasts(items => items.filter(item => item.id !== notif.id)), 4500);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id, getUserById]);

  if (!toasts.length) return null;
  return (
    <div aria-live="polite" aria-atomic="false" className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+12px)] z-[120] flex w-[min(92vw,390px)] -translate-x-1/2 flex-col gap-2">
      {toasts.map(toast => (
        <div key={toast.id} role="status" className="rounded-2xl border border-white/15 bg-[#172B62]/95 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl animate-fadeSlideIn">
          <span className="mr-2">🔔</span>{toast.text}
        </div>
      ))}
    </div>
  );
}
