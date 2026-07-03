import { useEffect, useState } from 'react';

export default function Loader({ isLoading }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => setShow(true), 300);
    } else {
      setShow(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', gap: '8px' }}>
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'white',
            animation: 'bounce 1s ease-in-out infinite',
            animationDelay: '-0.3s',
          }}
        />
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'white',
            animation: 'bounce 1s ease-in-out infinite',
            animationDelay: '-0.15s',
          }}
        />
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'white',
            animation: 'bounce 1s ease-in-out infinite',
            animationDelay: '0s',
          }}
        />
      </div>
      <p
        style={{
          marginTop: '16px',
          fontSize: '14px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.8)',
          letterSpacing: '0.5px',
        }}
      >
        Konnet
      </p>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
