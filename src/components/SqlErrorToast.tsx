import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { explainSqlError, type SqlErrorExplanation } from '../utils/identity';
import { M3_TOAST_BOTTOM_MOTION } from '../utils/m3Motion';

interface SqlErrorEventDetail {
  error?: string;
  query?: string;
  moduleLabel?: string;
}

interface ActiveToast extends SqlErrorExplanation {
  id: number;
  moduleLabel?: string;
}

export function SqlErrorToast() {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleSqlError = (event: Event) => {
      const detail = (event as CustomEvent<SqlErrorEventDetail>).detail || {};
      const explained = explainSqlError(detail.error || '', detail.query || '');
      const id = Date.now();

      setToast({
        id,
        moduleLabel: detail.moduleLabel,
        ...explained,
      });

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setToast((prev) => (prev?.id === id ? null : prev));
      }, 6000);
    };

    window.addEventListener('da101sqlerror', handleSqlError);
    return () => {
      window.removeEventListener('da101sqlerror', handleSqlError);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const dismiss = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setToast(null);
  };

  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[140] pointer-events-none max-w-md w-[calc(100vw-2.5rem)]"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            {...M3_TOAST_BOTTOM_MOTION}
            role="alert"
            className="pointer-events-auto rounded-[22px] border border-rose-500/40 bg-[#18121a]/95 dark:bg-[#18121a]/95 text-slate-100 shadow-2xl backdrop-blur-md overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500" />
            <div className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/35 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                <i className="ph ph-warning-circle text-lg" aria-hidden="true" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-extrabold text-white tracking-tight truncate">
                      {toast.title}
                    </span>
                    {toast.moduleLabel && (
                      <span className="text-[10px] font-mono text-rose-300/80 shrink-0">
                        · {toast.moduleLabel}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Dismiss SQL error notification"
                    className="no-ripple text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer shrink-0"
                  >
                    <i className="ph ph-x text-sm" aria-hidden="true" />
                  </button>
                </div>

                <p className="text-xs text-rose-200/95 leading-snug break-words">
                  {toast.detail}
                </p>

                <p className="text-[11px] text-slate-300/90 leading-snug pt-0.5 border-t border-white/10">
                  <span className="font-bold text-amber-300">Tip: </span>
                  {toast.tip}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
