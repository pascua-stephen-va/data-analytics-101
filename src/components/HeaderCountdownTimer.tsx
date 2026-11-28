import { motion } from 'motion/react';
import { useAccess } from '../context/AccessContext';
import { M3_SPRING_FAST_SPATIAL } from '../utils/m3Motion';

interface HeaderCountdownTimerProps {
  variant?: 'default' | 'excel' | 'ordering';
}

function formatTimerDisplay(diffMs: number): string {
  if (diffMs <= 0) return '00:00';
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  if (days > 0) {
    return `${days}d ${hours}h ${pad(minutes)}m`;
  }
  if (hours > 0) {
    return `${hours}h ${pad(minutes)}m`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function HeaderCountdownTimer({
  variant = 'default',
}: HeaderCountdownTimerProps) {
  const {
    user,
    isInstructor,
    enrollment,
    expiresAtMs,
    nowMs,
    isExpiredExportOnly,
    isBlocked,
    isRevoked,
  } = useAccess();

  if (!user || isInstructor || !enrollment || !expiresAtMs) {
    return null;
  }

  const diffMs = expiresAtMs - nowMs;
  const isUp = diffMs <= 0 || isExpiredExportOnly;
  const isCritical = !isUp && diffMs <= 5 * 60 * 1000;
  const isWarning = !isUp && !isCritical && diffMs <= 15 * 60 * 1000;

  const baseTone = isUp
    ? 'bg-rose-950/75 border-rose-500/50 text-rose-200'
    : isCritical
      ? 'bg-rose-950/70 border-rose-400/60 text-rose-200 animate-pulse'
      : isWarning
        ? 'bg-amber-950/70 border-amber-400/60 text-amber-200'
        : variant === 'excel'
          ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-100'
          : variant === 'ordering'
            ? 'bg-indigo-950/75 border-indigo-600/50 text-indigo-100'
            : 'bg-slate-800/85 border-slate-700/80 text-slate-200';

  const iconColor = isUp
    ? 'text-rose-400'
    : isCritical
      ? 'text-rose-300'
      : isWarning
        ? 'text-amber-300'
        : 'text-sky-400';

  const exactExpiry = new Date(expiresAtMs).toLocaleString();
  const titleText = isUp
    ? isBlocked || isRevoked
      ? 'Class access time has ended. Export your results on the Home page.'
      : `Access expired on ${exactExpiry}. Export your results on the Home page.`
    : `Access expires on ${exactExpiry}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={M3_SPRING_FAST_SPATIAL}
      title={titleText}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold tabular-nums whitespace-nowrap select-none shadow-inner ${baseTone}`}
    >
      <i
        className={`ph ${isUp ? 'ph-clock-countdown' : 'ph-timer'} text-sm ${iconColor}`}
        aria-hidden="true"
      />
      <span>{isUp ? "Time's Up" : formatTimerDisplay(diffMs)}</span>
    </motion.div>
  );
}
