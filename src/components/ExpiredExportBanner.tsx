import { useEffect, useState } from 'react';
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

const EXPORT_TRACKER_STORAGE_KEY = 'da101_exported_session_v1';
const EXPORT_TRACKER_EVENT = 'da101exportrecorded';

type ExportedTrackerMap = Record<string, { pdf?: boolean; png?: boolean }>;

function readExportedTracker(): ExportedTrackerMap {
  try {
    const raw = sessionStorage.getItem(EXPORT_TRACKER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ExportedTrackerMap) : {};
  } catch {
    return {};
  }
}

function recordSessionExport(moduleId: CurriculumModuleId, format: 'pdf' | 'png') {
  try {
    const current = readExportedTracker();
    current[moduleId] = {
      ...(current[moduleId] || {}),
      [format]: true,
    };
    sessionStorage.setItem(EXPORT_TRACKER_STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent(EXPORT_TRACKER_EVENT));
  } catch {
    // Ignore sessionStorage restrictions
  }
}

function useSessionExportTracker(): ExportedTrackerMap {
  const [tracker, setTracker] = useState<ExportedTrackerMap>(() =>
    readExportedTracker(),
  );

  useEffect(() => {
    const sync = () => setTracker(readExportedTracker());
    window.addEventListener(EXPORT_TRACKER_EVENT, sync);
    return () => window.removeEventListener(EXPORT_TRACKER_EVENT, sync);
  }, []);

  return tracker;
}

export function ExpiredExportBanner() {
  const {
    isExpiredExportOnly,
    isBlocked,
    isRevoked,
    enrollment,
    allowedModules,
    expiresAtMs,
    setShowCodeEntryFromExpired,
  } = useAccess();
  const summary = useCurriculumProgress();
  const exportedMap = useSessionExportTracker();
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  if (!isExpiredExportOnly || !enrollment) return null;

  const isSilentlyEnded = isBlocked || isRevoked;
  const expiredLabel =
    !isSilentlyEnded && expiresAtMs
      ? `on ${new Date(expiresAtMs).toLocaleString()}`
      : '';

  const assignedModules = summary.modules.filter((m) =>
    allowedModules.includes(m.id),
  );
  const assignedPassed = assignedModules.reduce((acc, m) => acc + m.passed, 0);
  const assignedTotal = assignedModules.reduce((acc, m) => acc + m.total, 0);
  const assignedPct =
    assignedTotal > 0 ? Math.round((assignedPassed / assignedTotal) * 100) : 0;
  const completedCount = assignedModules.filter(
    (m) => m.status === 'Completed',
  ).length;
  const exportableModules = assignedModules.filter((m) => m.attempted > 0);
  const downloadedCount = exportableModules.filter(
    (m) => exportedMap[m.id]?.pdf || exportedMap[m.id]?.png,
  ).length;

  const handleDownloadAllPdfs = async () => {
    if (exportableModules.length === 0 || batchProgress) return;
    setBatchProgress({ current: 0, total: exportableModules.length });
    try {
      for (let i = 0; i < exportableModules.length; i++) {
        const mod = exportableModules[i];
        setBatchProgress({ current: i + 1, total: exportableModules.length });
        if (typeof window.exportModuleResult === 'function') {
          await window.exportModuleResult(mod.id, 'pdf');
          recordSessionExport(mod.id, 'pdf');
        }
        if (i < exportableModules.length - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 480));
        }
      }
    } finally {
      setBatchProgress(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={M3_SPRING_DEFAULT_SPATIAL}
      role="status"
      className="rounded-[24px] border border-amber-400/40 bg-amber-950/35 dark:bg-amber-950/45 text-amber-100 px-5 py-4 space-y-3.5 shadow-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              {enrollment.batchNumber}) has ended
              {expiredLabel ? ` ${expiredLabel}` : ''}. Labs are locked, and you can download your verified PDF or PNG certificates below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {exportableModules.length > 0 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={M3_TAP_PRESS}
              transition={M3_SPRING_FAST_SPATIAL}
              disabled={batchProgress !== null}
              onClick={() => void handleDownloadAllPdfs()}
              className="no-ripple px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap shadow-sm disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              <i
                className={`ph ${batchProgress ? 'ph-spinner animate-spin' : 'ph-download-simple'} text-sm`}
                aria-hidden="true"
              />
              <span>
                {batchProgress
                  ? `Exporting ${batchProgress.current}/${batchProgress.total}…`
                  : `Download All PDFs (${exportableModules.length})`}
              </span>
            </motion.button>
          )}

          {!isSilentlyEnded && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={M3_TAP_PRESS}
              transition={M3_SPRING_FAST_SPATIAL}
              onClick={() => setShowCodeEntryFromExpired(true)}
              className="no-ripple px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              Enter New Class Code
            </motion.button>
          )}
        </div>
      </div>

      {/* Combined Summary Strip + Status Legend */}
      <div className="pt-3 border-t border-amber-400/20 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-[11px]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-bold text-white tabular-nums">
            <i className="ph ph-chart-bar text-amber-300 text-sm" aria-hidden="true" />
            <span>
              Combined Score: {assignedPassed} / {assignedTotal} ({assignedPct}%)
            </span>
          </span>
          <span className="text-amber-300/40">·</span>
          <span className="text-amber-100/90 tabular-nums">
            {completedCount} of {assignedModules.length} Modules Completed
          </span>
          {exportableModules.length > 0 && (
            <>
              <span className="text-amber-300/40">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold tabular-nums">
                <i className="ph ph-check-circle text-xs" aria-hidden="true" />
                {downloadedCount}/{exportableModules.length} Downloaded This Session
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10.5px] text-amber-100/80 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Completed
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Incomplete (Partial Export)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Not Attempted
          </span>
        </div>
      </div>
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
  const exportedMap = useSessionExportTracker();
  const [busyFormat, setBusyFormat] = useState<'pdf' | 'png' | null>(null);

  if (!isExpiredExportOnly) return null;

  const modProgress = summary.modules.find((m) => m.id === moduleId);
  const isAllowed = allowedModules.includes(moduleId);
  const attempted = modProgress?.attempted ?? 0;
  const passed = modProgress?.passed ?? 0;
  const total = modProgress?.total ?? 0;
  const isUntouched = attempted === 0;
  const isCompleted = modProgress?.status === 'Completed';
  const pdfDownloaded = Boolean(exportedMap[moduleId]?.pdf);
  const pngDownloaded = Boolean(exportedMap[moduleId]?.png);

  const handleExport = async (format: 'pdf' | 'png') => {
    if (isUntouched || !isAllowed || busyFormat) return;
    setBusyFormat(format);
    try {
      if (typeof window.exportModuleResult === 'function') {
        await window.exportModuleResult(moduleId, format);
        recordSessionExport(moduleId, format);
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
          <span className="font-bold text-slate-400 uppercase tracking-wide inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
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
          className={`font-bold uppercase tracking-wide inline-flex items-center gap-1.5 ${
            isCompleted ? 'text-emerald-400' : 'text-amber-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isCompleted ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
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
          className={`no-ripple py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-sm ${
            pdfDownloaded
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          <i
            className={`ph ${
              busyFormat === 'pdf'
                ? 'ph-spinner animate-spin'
                : pdfDownloaded
                  ? 'ph-check-circle'
                  : 'ph-file-pdf'
            } text-sm`}
            aria-hidden="true"
          />
          <span>
            {busyFormat === 'pdf'
              ? 'Exporting…'
              : pdfDownloaded
                ? 'PDF Downloaded'
                : 'Download PDF'}
          </span>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.025, y: -1 }}
          whileTap={M3_TAP_PRESS}
          transition={M3_SPRING_FAST_SPATIAL}
          disabled={busyFormat !== null}
          onClick={() => void handleExport('png')}
          className={`no-ripple py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5 ${
            pngDownloaded
              ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 border-emerald-500/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600/80'
          }`}
        >
          <i
            className={`ph ${
              busyFormat === 'png'
                ? 'ph-spinner animate-spin'
                : pngDownloaded
                  ? 'ph-check-circle text-emerald-400'
                  : 'ph-image'
            } text-sm`}
            aria-hidden="true"
          />
          <span>
            {busyFormat === 'png'
              ? 'Exporting…'
              : pngDownloaded
                ? 'PNG Downloaded'
                : 'Download PNG'}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
