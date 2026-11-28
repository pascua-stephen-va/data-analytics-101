import {
  useCurriculumProgress,
  type CurriculumModuleId,
} from '../utils/curriculumProgress';

interface LabExerciseDotsProps {
  moduleId: CurriculumModuleId;
}

export function LabExerciseDots({ moduleId }: LabExerciseDotsProps) {
  const summary = useCurriculumProgress();
  const mod = summary.modules.find((m) => m.id === moduleId);

  if (!mod) return null;

  const passedSet = new Set<number>(mod.completedIds);
  const wrongSet = new Set<number>(mod.wrongIds);
  const total = mod.total;
  const activeNum = mod.activeExercise;

  const jumpToExercise = (exerciseNum: number) => {
    try {
      const win = window as unknown as {
        jumpToExcelTask?: (idx: number) => void;
        loadStep?: (stepId: number) => void;
        selectOrderingExercise?: (stepId: number) => void;
        selectMoviesExercise?: (stepId: number) => void;
      };
      if (moduleId === 'excel') {
        win.jumpToExcelTask?.(exerciseNum - 1);
      } else if (moduleId === 'sql_world') {
        win.loadStep?.(exerciseNum);
      } else if (moduleId === 'sql_ordering') {
        win.selectOrderingExercise?.(exerciseNum);
      } else if (moduleId === 'sql_movies') {
        win.selectMoviesExercise?.(exerciseNum);
      }
    } catch {
      // Ignore navigation failures
    }
  };

  return (
    <div
      className="px-3.5 py-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-900/55 flex items-center justify-between gap-2.5 flex-wrap shrink-0"
      aria-label={`${mod.shortLabel} exercise quick navigator`}
    >
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: total }, (_, idx) => {
          const num = idx + 1;
          const isPassed = passedSet.has(num);
          const isWrong = !isPassed && wrongSet.has(num);
          const isActive = num === activeNum;

          let stateClasses =
            'bg-slate-200/85 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300/90 dark:hover:bg-slate-700';
          let statusLabel = 'Not attempted';

          if (isPassed) {
            stateClasses =
              'bg-emerald-500 text-white hover:bg-emerald-400 shadow-xs';
            statusLabel = 'Passed';
          } else if (isWrong) {
            stateClasses =
              'bg-rose-500 text-white hover:bg-rose-400 shadow-xs';
            statusLabel = 'Incorrect — needs review';
          }

          return (
            <button
              key={num}
              type="button"
              onClick={() => jumpToExercise(num)}
              title={`Exercise #${num} · ${statusLabel}`}
              aria-label={`Exercise ${num}: ${statusLabel}${isActive ? ' (Current)' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              className={`no-ripple w-5 h-5 rounded-md text-[10px] font-mono font-bold tabular-nums inline-flex items-center justify-center transition-transform cursor-pointer ${stateClasses} ${
                isActive
                  ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 scale-110 z-10'
                  : ''
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{mod.passed}</span>
        </span>
        {mod.wrong > 0 && (
          <span className="inline-flex items-center gap-1 text-rose-500 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{mod.wrong}</span>
          </span>
        )}
        <span className="text-slate-400 dark:text-slate-500">
          / {total}
        </span>
      </div>
    </div>
  );
}
