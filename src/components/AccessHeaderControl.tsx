import { motion } from 'motion/react';
import { useAccess } from '../context/AccessContext';
import { HeaderCountdownTimer } from './HeaderCountdownTimer';
import { M3_SPRING_FAST_SPATIAL, M3_TAP_PRESS } from '../utils/m3Motion';

export function HeaderAccessControls() {
  const {
    user,
    enrollment,
    isInstructor,
    hasAccess,
    isExpiredExportOnly,
    lockedBatchNumber,
    setInstructorPanelOpen,
    requestSignOut,
  } = useAccess();

  if (!user || (!hasAccess && !isExpiredExportOnly)) return null;

  const studentLabel = enrollment?.fullName || null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {isInstructor ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={M3_TAP_PRESS}
          transition={M3_SPRING_FAST_SPATIAL}
          onClick={() => setInstructorPanelOpen(true)}
          className="no-ripple inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-400/35 transition-colors cursor-pointer whitespace-nowrap"
          title="Open Instructor Access Control Panel"
        >
          <i className="ph ph-shield-check text-sm" aria-hidden="true" />
          <span>Instructor Panel</span>
        </motion.button>
      ) : (
        <div className="flex items-center gap-2 whitespace-nowrap">
          {studentLabel && (
            <span
              className="hidden lg:inline-block max-w-[180px] truncate font-semibold text-slate-200 text-xs"
              title={
                lockedBatchNumber
                  ? `${studentLabel} · Batch ${lockedBatchNumber}`
                  : studentLabel
              }
            >
              {studentLabel}
            </span>
          )}
          {lockedBatchNumber && (
            <span className="hidden md:inline-block font-mono font-semibold tabular-nums text-slate-400 text-xs">
              Batch {lockedBatchNumber}
            </span>
          )}
          <HeaderCountdownTimer variant="default" />
        </div>
      )}

      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={M3_TAP_PRESS}
        transition={M3_SPRING_FAST_SPATIAL}
        onClick={requestSignOut}
        className="no-ripple inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer whitespace-nowrap"
        title={`Sign out (${user.email || 'Account'})`}
      >
        <i className="ph ph-sign-out text-sm" aria-hidden="true" />
        <span className="hidden sm:inline">Sign Out</span>
      </motion.button>
    </div>
  );
}

export function FooterInstructorTrigger() {
  const { isInstructor, setInstructorPanelOpen, signInWithGoogle } = useAccess();

  const handleClick = () => {
    if (isInstructor) {
      setInstructorPanelOpen(true);
    } else {
      void signInWithGoogle(true);
    }
  };

  return (
    <motion.button
      type="button"
      whileTap={M3_TAP_PRESS}
      transition={M3_SPRING_FAST_SPATIAL}
      onClick={handleClick}
      className="no-ripple text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer whitespace-nowrap px-2 py-1"
      title="Instructor Access Panel (Google Sign-In)"
    >
      Instructor
    </motion.button>
  );
}
