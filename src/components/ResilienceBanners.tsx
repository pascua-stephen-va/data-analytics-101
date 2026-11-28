import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAccess } from '../context/AccessContext';
import {
  M3_SPRING_DEFAULT_SPATIAL,
  M3_SPRING_FAST_SPATIAL,
  M3_TAP_PRESS,
} from '../utils/m3Motion';

const DISMISSED_ANNOUNCEMENT_KEY = 'da101_dismissed_announcement_id';

export function ResilienceBanners() {
  const {
    isOnline,
    hasPendingSync,
    justReconnected,
    duplicateTabDetected,
    dismissDuplicateTabWarning,
    claimTabControl,
    activeAnnouncement,
    hasAccess,
    isExpiredExportOnly,
    isInstructor,
  } = useAccess();

  const [dismissedAnnouncementId, setDismissedAnnouncementId] = useState<string>(
    () => {
      try {
        return sessionStorage.getItem(DISMISSED_ANNOUNCEMENT_KEY) || '';
      } catch {
        return '';
      }
    },
  );

  useEffect(() => {
    if (!activeAnnouncement) return;
    // Automatically show if a brand-new announcement arrives with a different ID
    if (
      dismissedAnnouncementId &&
      dismissedAnnouncementId !== activeAnnouncement.id
    ) {
      setDismissedAnnouncementId('');
    }
  }, [activeAnnouncement, dismissedAnnouncementId]);

  const dismissAnnouncement = () => {
    if (!activeAnnouncement) return;
    setDismissedAnnouncementId(activeAnnouncement.id);
    try {
      sessionStorage.setItem(DISMISSED_ANNOUNCEMENT_KEY, activeAnnouncement.id);
    } catch {
      // Ignore storage failures
    }
  };

  const showOfflineBanner = !isOnline;
  const showReconnectedBanner = isOnline && justReconnected;
  const showPendingSyncPill =
    isOnline && !justReconnected && hasPendingSync && hasAccess && !isInstructor;
  const showDuplicateTabBanner = duplicateTabDetected && !isInstructor;
  const showAnnouncementBanner = Boolean(
    activeAnnouncement &&
      activeAnnouncement.active &&
      activeAnnouncement.message.trim().length > 0 &&
      dismissedAnnouncementId !== activeAnnouncement.id &&
      (hasAccess || isExpiredExportOnly || isInstructor),
  );

  const hasAnyBanner =
    showOfflineBanner ||
    showReconnectedBanner ||
    showPendingSyncPill ||
    showDuplicateTabBanner ||
    showAnnouncementBanner;

  return (
    <div
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[135] pointer-events-none w-[min(94vw,680px)] flex flex-col gap-2"
    >
      <AnimatePresence mode="popLayout">
        {showAnnouncementBanner && activeAnnouncement && (
          <motion.div
            key={`announcement-${activeAnnouncement.id}`}
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={M3_SPRING_DEFAULT_SPATIAL}
            role="status"
            className="pointer-events-auto rounded-2xl border border-blue-400/40 bg-[#0f1c38]/95 text-slate-100 shadow-2xl backdrop-blur-md px-4 py-3 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/35 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
              <i className="ph ph-megaphone text-base" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-300">
                <span>Instructor Broadcast</span>
                {activeAnnouncement.targetBatch &&
                  activeAnnouncement.targetBatch !== 'ALL' && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-blue-200">
                      Batch {activeAnnouncement.targetBatch}
                    </span>
                  )}
              </div>
              <p className="text-xs sm:text-[13px] text-white/95 font-medium leading-snug mt-0.5 break-words">
                {activeAnnouncement.message}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissAnnouncement}
              aria-label="Dismiss instructor announcement"
              className="no-ripple text-slate-400 hover:text-white transition-colors p-1 cursor-pointer shrink-0"
            >
              <i className="ph ph-x text-sm" aria-hidden="true" />
            </button>
          </motion.div>
        )}

        {showOfflineBanner && (
          <motion.div
            key="offline-banner"
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={M3_SPRING_DEFAULT_SPATIAL}
            role="status"
            className="pointer-events-auto rounded-2xl border border-amber-400/45 bg-[#1c1610]/95 text-amber-100 shadow-xl backdrop-blur-md px-4 py-2.5 flex items-center gap-3"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/35 flex items-center justify-center text-amber-300 shrink-0">
              <i className="ph ph-wifi-slash text-base" aria-hidden="true" />
            </div>
            <p className="text-xs font-medium leading-snug">
              <strong className="font-bold text-amber-200">You&apos;re offline.</strong>{' '}
              Your lab progress is saved locally and will automatically sync when your connection returns.
            </p>
          </motion.div>
        )}

        {showReconnectedBanner && (
          <motion.div
            key="reconnected-banner"
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={M3_SPRING_DEFAULT_SPATIAL}
            role="status"
            className="pointer-events-auto rounded-2xl border border-emerald-400/45 bg-[#0d1f19]/95 text-emerald-100 shadow-xl backdrop-blur-md px-4 py-2.5 flex items-center gap-3"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/35 flex items-center justify-center text-emerald-300 shrink-0">
              <i className="ph ph-cloud-check text-base" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold leading-snug">
              Back online — your latest progress has been synced to the cloud.
            </p>
          </motion.div>
        )}

        {showPendingSyncPill && (
          <motion.div
            key="pending-sync-banner"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={M3_SPRING_FAST_SPATIAL}
            role="status"
            className="pointer-events-auto self-center rounded-full border border-sky-400/35 bg-[#0f172a]/92 text-sky-200 shadow-lg backdrop-blur-md px-3.5 py-1.5 flex items-center gap-2 text-[11px] font-semibold"
          >
            <i className="ph ph-arrows-clockwise animate-spin text-xs" aria-hidden="true" />
            <span>Syncing progress to cloud…</span>
          </motion.div>
        )}

        {showDuplicateTabBanner && (
          <motion.div
            key="duplicate-tab-banner"
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={M3_SPRING_DEFAULT_SPATIAL}
            role="alert"
            className="pointer-events-auto rounded-2xl border border-amber-400/45 bg-[#1b1420]/95 text-slate-100 shadow-2xl backdrop-blur-md px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/35 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                <i className="ph ph-tabs text-base" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-200">
                  Duplicate Tab Detected
                </p>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                  This account is open in another browser tab. Close extra tabs to prevent progress conflicts.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                type="button"
                whileTap={M3_TAP_PRESS}
                transition={M3_SPRING_FAST_SPATIAL}
                onClick={claimTabControl}
                className="no-ripple px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 transition-colors cursor-pointer"
              >
                Use This Tab
              </motion.button>
              <button
                type="button"
                onClick={dismissDuplicateTabWarning}
                className="no-ripple px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!hasAnyBanner && null}
    </div>
  );
}
