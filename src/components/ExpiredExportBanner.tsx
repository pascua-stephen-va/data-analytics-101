import { useState } from 'react';
import { motion } from 'motion/react';
import { useAccess } from '../context/AccessContext';
import {
  useCurriculumProgress,
  type CurriculumModuleId,
} from '../utils/curriculumProgress';
import {
  M3_SPRING_DEFAULT_SPATIAL,
  M3_SPRING_FAST_SPATIAL,
  M3_TAP_PRESS,
} from '../utils/m3Motion';

export function ExpiredExportBanner() {
  const {
    isExpiredExportOnly,
    isBlocked,
    isRevoked,
    enrollment,
    expiresAtMs,
    setShowCodeEntryFromExpired,
  } = useAccess();

  if (!isExpiredExportOnly || !enrollment) return null;

  const isSilentlyEnded = isBlocked || isRevoked;
  const expiredLabel =
    !isSilentlyEnded && expiresAtMs
      ? `on ${new Date(expiresAtMs).toLocaleString()}`
      : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={M3_SPRING_DEFAULT_SPATIAL}
      role="status"
      className="rounded-[24px] border border-amber-400/40 bg-amber-950/35 dark:bg-amber-950/45 text-amber-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
          <i className="ph ph-clock-countdown text-xl" aria-hidden="true" />
        </div>
        <div className="space-y-1 min-w-0">
          <h2 className="text-sm font-extrabold text-amber-100 tracking-tight">
            Time is up — Export-Only Mode
          </h2>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Your access window for{' '}
            <strong className="font-mono">{enrollment.code}</strong> (Batch{' '}
            {enrollment.batchNumber}) has ended{expiredLabel ? ` ${expiredLabel}` : ''}. Labs and lessons are now locked, but you may download your completed or partial module results as PDF or PNG below. Untouched modules are greyed out.
          </p>
        </div>
      </div>

      {!isSilentlyEnded && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={M3_TAP_PRESS}
          transition={M3_SPRING_FAST_SPATIAL}
          onClick={() => setShowCodeEntryFromExpired(true)}
          className="no-ripple shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
        >
          Enter New Class Code
        </motion.button>
      )}
    </motion.div>
  );
}

interface ModuleCardExportActionsProps {
  moduleId: CurriculumModuleId;
}

export function ModuleCardExportActions({
  moduleId,
}: ModuleCardExportActionsProps) {
  const { isExpiredExportOnly, allowedModules } = useAccess();
  const summary = useCurriculumProgress();
  const [busyFormat, setBusyFormat] = useState<'pdf' | 'png' | null>(null);

  if (!isExpiredExportOnly) return null;

  const modProgress = summary.modules.find((m) => m.id === moduleId);
  const isAllowed = allowedModules.includes(moduleId);
  const attempted = modProgress?.attempted ?? 0;
  const passed = modProgress?.passed ?? 0;
  const total = modProgress?.total ?? 0;
  const isUntouched = attempted === 0;
  const isCompleted = modProgress?.status === 'Completed';

  const handleExport = async (format: 'pdf' | 'png') => {
    if (isUntouched || !isAllowed || busyFormat) return;
    setBusyFormat(format);
    try {
      if (typeof window.exportModuleResult === 'function') {
        await window.exportModuleResult(moduleId, format);
      }
    } finally {
      setBusyFormat(null);
    }
  };

  if (!isAllowed) {
    return (
      <div className="pt-2 border-t border-slate-800/80 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
        <span>Not assigned to your class code</span>
        <i className="ph ph-lock-simple text-sm" aria-hidden="true" />
      </div>
    );
  }

  if (isUntouched) {
    return (
      <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-400 uppercase tracking-wide">
            Not Attempted
          </span>
          <span className="font-mono tabular-nums text-slate-500">
            0 / {total} answered
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled
            className="no-ripple py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800/60 text-slate-500 border border-slate-700/60 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <i className="ph ph-file-pdf text-sm" aria-hidden="true" />
            <span>Download PDF</span>
          </button>
          <button
            type="button"
            disabled
            className="no-ripple py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800/60 text-slate-500 border border-slate-700/60 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <i className="ph ph-image text-sm" aria-hidden="true" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={M3_SPRING_DEFAULT_SPATIAL}
      className="pt-2.5 border-t border-slate-800/80 space-y-2"
    >
      <div className="flex items-center justify-between text-[11px]">
        <span
          className={`font-bold uppercase tracking-wide ${
            isCompleted ? 'text-emerald-400' : 'text-amber-300'
          }`}
        >
          {isCompleted ? 'Completed · Ready to Export' : 'Incomplete · Partial Score'}
        </span>
        <span className="font-mono font-bold tabular-nums text-slate-300">
          {passed} / {total} passed
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.025, y: -1 }}
          whileTap={M3_TAP_PRESS}
          transition={M3_SPRING_FAST_SPATIAL}
          disabled={busyFormat !== null}
          onClick={() => void handleExport('pdf')}
          className="no-ripple py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-sm"
        >
          <i
            className={`ph ${busyFormat === 'pdf' ? 'ph-spinner animate-spin' : 'ph-file-pdf'} text-sm`}
            aria-hidden="true"
          />
          <span>{busyFormat === 'pdf' ? 'Exporting…' : 'Download PDF'}</span>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.025, y: -1 }}
          whileTap={M3_TAP_PRESS}
          transition={M3_SPRING_FAST_SPATIAL}
          disabled={busyFormat !== null}
          onClick={() => void handleExport('png')}
          className="no-ripple py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600/80 transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
        >
          <i
            className={`ph ${busyFormat === 'png' ? 'ph-spinner animate-spin' : 'ph-image'} text-sm`}
            aria-hidden="true"
          />
          <span>{busyFormat === 'png' ? 'Exporting…' : 'Download PNG'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
