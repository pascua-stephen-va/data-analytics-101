import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAccess } from '../context/AccessContext';
import { M3_TOAST_TOP_MOTION } from '../utils/m3Motion';

interface ExpiryToastState {
  id: number;
  level: 'warn5' | 'warn1';
  title: string;
  body: string;
}

const FIVE_MIN_MS = 5 * 60 * 1000;
const ONE_MIN_MS = 60 * 1000;

export function ExpiryReminderToast() {
  const { user, enrollment, hasAccess, isInstructor, expiresAtMs, nowMs } =
    useAccess();
  const [toast, setToast] = useState<ExpiryToastState | null>(null);
  const shownRef = useRef<{ sessionKey: string; warn5: boolean; warn1: boolean }>({
    sessionKey: '',
    warn5: false,
    warn1: false,
  });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user || isInstructor || !hasAccess || !expiresAtMs || !enrollment) {
      setToast(null);
      return;
    }

    const sessionKey = `${user.uid}:${expiresAtMs}`;
    if (shownRef.current.sessionKey !== sessionKey) {
      shownRef.current = { sessionKey, warn5: false, warn1: false };
      setToast(null);
    }

    const remainingMs = expiresAtMs - nowMs;
    if (remainingMs <= 0) {
      setToast(null);
      return;
    }

    const triggerToast = (next: Omit<ExpiryToastState, 'id'>) => {
      setToast({ ...next, id: Date.now() });
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 12_000);
    };

    if (remainingMs <= ONE_MIN_MS && !shownRef.current.warn1) {
      shownRef.current.warn1 = true;
      shownRef.current.warn5 = true;
      triggerToast({
        level: 'warn1',
        title: '1 Minute Remaining',
        body: 'Submit your current answer now. Your progress is auto-saving to your account, and labs will switch to Export-Only Mode when time ends.',
      });
    } else if (
      remainingMs <= FIVE_MIN_MS &&
      remainingMs > ONE_MIN_MS &&
      !shownRef.current.warn5
    ) {
      shownRef.current.warn5 = true;
      triggerToast({
        level: 'warn5',
        title: '5 Minutes Remaining',
        body: 'Wrap up your active exercises. When time expires, you will return to the Home page to download your PDF & PNG results.',
      });
    }
  }, [enrollment, expiresAtMs, hasAccess, isInstructor, nowMs, user]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="fixed top-16 right-4 z-[125] pointer-events-none max-w-sm w-[calc(100vw-2rem)]"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            {...M3_TOAST_TOP_MOTION}
            role="status"
            className={`pointer-events-auto rounded-[22px] border shadow-2xl p-4 backdrop-blur-md ${
              toast.level === 'warn1'
                ? 'bg-rose-950/95 border-rose-500/60 text-rose-50'
                : 'bg-amber-950/95 border-amber-500/60 text-amber-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  toast.level === 'warn1'
                    ? 'bg-rose-500/25 text-rose-300'
                    : 'bg-amber-500/25 text-amber-300'
                }`}
              >
                <i
                  className={`ph ${
                    toast.level === 'warn1' ? 'ph-alarm' : 'ph-clock-countdown'
                  } text-lg`}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold tracking-tight">
                    {toast.title}
                  </p>
                  <button
                    type="button"
                    onClick={() => setToast(null)}
                    aria-label="Dismiss reminder"
                    className="no-ripple p-1 -mr-1 rounded-lg opacity-75 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <i className="ph ph-x text-xs" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {toast.body}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
