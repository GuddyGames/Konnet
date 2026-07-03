import { useEffect, useState } from "react";
 
export default function Splash({ onFinish }) { 
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(onFinish, 400);
        }, 1500);

        return () => clearTimeout(timer);
    }, [onFinish]);

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
                background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
                transition: 'opacity 0.4s ease',
                opacity: fadeOut ? 0 : 1,
                pointerEvents: fadeOut ? 'none' : 'auto',
            }}>
             <h1 style={{
          fontSize: 32, fontWeight: 800, marginBottom: 24,
          background: "linear-gradient(90deg, #2563EB, #7C3AED)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>Konnet</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
                <div 
                    style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#2563EB',
                        animation: 'bounce 1s ease-in-out infinite',
                        animationDelay: '-0.3s',
                    }}></div>
                <div 
                    style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#4F46E5',
                        animation: 'bounce 1s ease-in-out infinite',
                        animationDelay: '-0.15s',
                    }}></div>
                <div 
                    style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: "#7C3AED",
                        animation: 'bounce 1s ease-in-out infinite',
                        animationDelay: '0s',
                }}></div>
            </div>
            <style> {`
            @keyframes bounce {
            0%, 100% {transfom: translateY(0); }
            50% {transform: translateY(-12px); }
            }
            `}</style>
        </div>
    );
}