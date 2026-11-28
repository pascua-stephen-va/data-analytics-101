import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAccess } from '../context/AccessContext';
import {
  M3_BACKDROP_MOTION,
  M3_MODAL_MOTION,
  M3_SPRING_FAST_SPATIAL,
  M3_TAP_PRESS,
} from '../utils/m3Motion';

export function SignOutConfirmModal() {
  const { user, signOutConfirmOpen, cancelSignOut, confirmSignOut } = useAccess();
  const [signingOut, setSigningOut] = useState(false);

  const handleConfirm = async () => {
    setSigningOut(true);
    try {
      await confirmSignOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <AnimatePresence>
      {signOutConfirmOpen && (
        <motion.div
          {...M3_BACKDROP_MOTION}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signOutConfirmTitle"
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !signingOut) cancelSignOut();
          }}
        >
          <motion.div
            {...M3_MODAL_MOTION}
            className="w-full max-w-sm rounded-[26px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131a27] shadow-2xl overflow-hidden"
          >
            <div className="px-6 pt-6 pb-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <i className="ph ph-sign-out text-xl" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="signOutConfirmTitle"
                    className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight"
                  >
                    Sign out of your account?
                  </h2>
                  {user?.email && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Your progress is synced to your account, and you will need to sign back in with your Virtual Assistant Google Account to continue.
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-[#0e1420] border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
              <motion.button
                type="button"
                whileTap={M3_TAP_PRESS}
                transition={M3_SPRING_FAST_SPATIAL}
                disabled={signingOut}
                onClick={cancelSignOut}
                className="no-ripple px-4 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={M3_TAP_PRESS}
                transition={M3_SPRING_FAST_SPATIAL}
                disabled={signingOut}
                onClick={() => void handleConfirm()}
                className="no-ripple px-4 py-2 rounded-2xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {signingOut ? 'Signing Out…' : 'Sign Out'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
