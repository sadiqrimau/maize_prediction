import { useEffect, useState, useRef, type ReactNode } from 'react';
import { api } from '../utils/api';

/* ── Constants ─────────────────────────────── */
// If the first ping succeeds faster than this, skip the screen entirely
const GRACE_PERIOD_MS = 1800;
// Simulated progress advances at this rate while we wait
const PROGRESS_TICK_MS = 400;
// Progress asymptote — never reaches 100 until truly alive
const PROGRESS_MAX_WHILE_WAITING = 92;

/* ── Animated progress bar ─────────────────── */
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          background: 'linear-gradient(90deg, #c9a84c, #e8c97a)',
        }}
      />
    </div>
  );
}

/* ── Dot pulse indicator ────────────────────── */
function PulseDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-white/40"
          style={{
            animation: `pulseOpacity 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Attempt counter label ──────────────────── */
function AttemptLabel({ attempt }: { attempt: number }) {
  if (attempt === 0) return <span>Contacting server…</span>;
  return (
    <span>
      Retry attempt {attempt} — server is warming up, please wait
    </span>
  );
}

/* ── Main component ─────────────────────────── */
interface WakeUpScreenProps {
  children: ReactNode;
}

export function WakeUpScreen({ children }: WakeUpScreenProps) {
  // 'checking'  → within grace period, rendering children optimistically
  // 'showing'   → grace period elapsed and server not yet alive → show splash
  // 'alive'     → server confirmed alive, fading out
  // 'done'      → splash fully gone, only children visible
  const [phase, setPhase] = useState<'checking' | 'showing' | 'alive' | 'done'>('checking');
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState(0);
  const aliveRef = useRef(false);

  useEffect(() => {
    // Grace-period timer — if server replies before this fires, we never show the splash
    const graceTimer = setTimeout(() => {
      if (!aliveRef.current) setPhase('showing');
    }, GRACE_PERIOD_MS);

    // Kick off the polling loop
    api.pingUntilAlive((n) => setAttempt(n)).then(() => {
      aliveRef.current = true;
      clearTimeout(graceTimer);

      if (phase === 'checking') {
        // Server was fast — skip splash entirely
        setPhase('done');
      } else {
        // Was showing splash — animate to 100% then fade out
        setProgress(100);
        setTimeout(() => setPhase('alive'), 600);   // let bar reach 100
        setTimeout(() => setPhase('done'), 1400);   // fade-out duration
      }
    });

    return () => clearTimeout(graceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulate progress creeping forward while we wait
  useEffect(() => {
    if (phase !== 'showing') return;
    const id = setInterval(() => {
      setProgress((prev) => {
        if (prev >= PROGRESS_MAX_WHILE_WAITING) return prev;
        // Ease off as we approach the ceiling
        const remaining = PROGRESS_MAX_WHILE_WAITING - prev;
        return prev + Math.max(0.3, remaining * 0.04);
      });
    }, PROGRESS_TICK_MS);
    return () => clearInterval(id);
  }, [phase]);

  // ── Always render children in the background so data starts loading ──
  // The splash sits on top as a fixed overlay
  return (
    <>
      {/* Children always mount immediately so API calls can run in parallel */}
      <div
        style={{
          visibility: phase === 'done' ? 'visible' : 'visible',
          opacity: phase === 'done' ? 1 : phase === 'alive' ? 1 : 1,
        }}
      >
        {children}
      </div>

      {/* Splash overlay */}
      {(phase === 'checking' || phase === 'showing' || phase === 'alive') && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6"
          style={{
            background: 'linear-gradient(135deg, #0f3d1a 0%, #1a5c2a 55%, #1f6e32 100%)',
            opacity: phase === 'alive' ? 0 : 1,
            transition: phase === 'alive' ? 'opacity 0.8s ease-out' : undefined,
            // During grace period (checking), show a brief flash only if needed
            display: phase === 'checking' ? 'none' : 'flex',
          }}
        >
          {/* Grain texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full text-center">
            {/* Maize icon */}
            <div className="text-7xl" style={{ animation: 'bobble 2s ease-in-out infinite' }}>
              🌽
            </div>

            {/* Title */}
            <div>
              <h1
                className="text-white font-bold text-3xl tracking-tight mb-1"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                IMTISAL
              </h1>
              <p className="text-white/60 text-sm">
                Maize Price Prediction System
              </p>
            </div>

            {/* Status message */}
            <div className="w-full space-y-4">
              <div className="bg-white/8 border border-white/12 rounded-2xl px-6 py-5"
                style={{ backdropFilter: 'blur(8px)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/80 text-sm font-medium">
                    Waking up the server…
                  </p>
                  <PulseDots />
                </div>
                <ProgressBar value={progress} />
                <p className="text-white/40 text-xs mt-3">
                  <AttemptLabel attempt={attempt} />
                </p>
              </div>

              <p className="text-white/40 text-xs leading-relaxed px-2">
                The API server sleeps after inactivity on the free tier.
                First load takes ~30–60 seconds — subsequent loads are instant.
              </p>
            </div>

            {/* Adamawa badge */}
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <span>🇳🇬</span>
              <span>Adamawa State, Nigeria</span>
            </div>
          </div>
        </div>
      )}

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes bobble {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes pulseOpacity {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
