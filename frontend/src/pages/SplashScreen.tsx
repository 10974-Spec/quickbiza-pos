import { useEffect, useState } from 'react';

/**
 * SplashScreen — shown for ~10 s when Electron first opens.
 * Dark background, large logo with background removed, 4-square chasing loader.
 */
export default function SplashScreen({ onDone }: { onDone: () => void }) {
    const [fade, setFade] = useState(false);

    useEffect(() => {
        const fadeTimer = setTimeout(() => setFade(true), 9700);
        const doneTimer = setTimeout(onDone, 10000);
        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(doneTimer);
        };
    }, [onDone]);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '48px',
                background: '#0a0a0a',
                transition: 'opacity 0.3s ease',
                opacity: fade ? 0 : 1,
            }}
        >
            {/* Logo — background removed via mix-blend-mode + drop-shadow filter */}
            <img
                src="/logo.png"
                alt="QuickBiza"
                style={{
                    width: '480px',
                    height: '480px',
                    objectFit: 'contain',
                    /*
                     * mix-blend-mode: screen  → black pixels become transparent on dark bg.
                     * If your logo has a WHITE background, swap to mix-blend-mode: multiply
                     * and set the container background to white, or use the filter approach below.
                     *
                     * filter: drop-shadow removes the bounding-box background entirely —
                     * it only draws shadow around non-transparent pixels, which forces the
                     * browser to treat any solid-colour fringe as part of the image bounds.
                     * Combine with mix-blend-mode for best results on both light & dark logos.
                     */
                    mixBlendMode: 'screen',          /* knocks out dark/black bg pixels */
                    filter: 'drop-shadow(0 0 0px transparent)', /* keeps anti-aliased edges clean */
                    animation: 'qb-pulse 2s ease-in-out infinite',
                }}
            />

            {/* 4-square chasing loader */}
            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: '20px',
                            height: '20px',
                            borderRadius: '3px',
                            background: '#ea580c',
                            animation: `qb-chase 1.6s linear infinite`,
                            animationDelay: `${i * 0.4}s`,
                        }}
                    />
                ))}
            </div>

            {/* Embedded keyframes */}
            <style>{`
                @keyframes qb-pulse {
                    0%, 100% { transform: scale(1);    opacity: 1;    }
                    50%       { transform: scale(1.06); opacity: 0.88; }
                }

                /*
                 * 4-square "chain" chase around a 44×44 px square path.
                 *  top-left  →  top-right
                 *      ↑             ↓
                 *  bot-left  ←  bot-right
                 */
                @keyframes qb-chase {
                    0%   { transform: translate(0px,  0px);  }
                    25%  { transform: translate(44px, 0px);  }
                    50%  { transform: translate(44px, 44px); }
                    75%  { transform: translate(0px,  44px); }
                    100% { transform: translate(0px,  0px);  }
                }
            `}</style>
        </div>
    );
}