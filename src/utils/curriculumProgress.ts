import { useEffect, useState } from 'react';
import {
  ACCOUNT_PROGRESS_KEYS,
  getAccountScopedItem,
} from './accountProgress';

export type CurriculumModuleId = 'excel' | 'sql_world' | 'sql_ordering' | 'sql_movies';
export type ActivityKey =
  | 'transforming_data_with_excel'
  | 'sql_around_the_world'
  | 'ordering_and_limiting'
  | 'successful_movies';

export interface ModuleDefinition {
  id: CurriculumModuleId;
  moduleNumber: string;
  shortLabel: string;
  chartLabel: string;
  title: string;
  subtitle: string;
  accentColor: string;
  accentSoftDark: string;
  accentSoftLight: string;
  activityKey: ActivityKey;
  defaultTotal: number;
}

export interface ModuleProgressItem extends ModuleDefinition {
  passed: number;
  wrong: number;
  attempted: number;
  total: number;
  percentage: number;
  status: 'Completed' | 'In Progress' | 'Not Started';
  completedAt: number | null;
  completedIds: number[];
  wrongIds: number[];
  activeExercise: number;
  nextExerciseNumber: number | null;
}

export interface CurriculumSummary {
  modules: ModuleProgressItem[];
  totalPassed: number;
  totalAttempted: number;
  totalExercises: number;
  overallPercentage: number;
  completedModulesCount: number;
  nextModule: ModuleProgressItem | null;
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: 'excel',
    moduleNumber: 'Module 1',
    shortLabel: 'Excel Masterclass',
    chartLabel: 'Mod 1: Excel',
    title: 'Module 1: Excel Masterclass',
    subtitle: '18 Formulas · 4 Ch.',
    accentColor: '#10b981',
    accentSoftDark: 'rgba(16, 185, 129, 0.16)',
    accentSoftLight: 'rgba(16, 185, 129, 0.12)',
    activityKey: 'transforming_data_with_excel',
    defaultTotal: 20,
  },
  {
    id: 'sql_world',
    moduleNumber: 'Module 2',
    shortLabel: 'World SQL',
    chartLabel: 'Mod 2: World SQL',
    title: 'Module 2: World SQL',
    subtitle: 'SELECT & WHERE',
    accentColor: '#3b82f6',
    accentSoftDark: 'rgba(59, 130, 246, 0.18)',
    accentSoftLight: 'rgba(59, 130, 246, 0.12)',
    activityKey: 'sql_around_the_world',
    defaultTotal: 12,
  },
  {
    id: 'sql_ordering',
    moduleNumber: 'Module 3',
    shortLabel: 'Ordering & Limiting',
    chartLabel: 'Mod 3: Ordering',
    title: 'Module 3: Ordering & Limiting',
    subtitle: 'ORDER BY & LIMIT',
    accentColor: '#6366f1',
    accentSoftDark: 'rgba(99, 102, 241, 0.18)',
    accentSoftLight: 'rgba(99, 102, 241, 0.12)',
    activityKey: 'ordering_and_limiting',
    defaultTotal: 10,
  },
  {
    id: 'sql_movies',
    moduleNumber: 'Module 4',
    shortLabel: 'Successful Movies',
    chartLabel: 'Mod 4: Movies',
    title: 'Module 4: Successful Movies',
    subtitle: 'GROUP BY & Aggregates',
    accentColor: '#f59e0b',
    accentSoftDark: 'rgba(245, 158, 11, 0.18)',
    accentSoftLight: 'rgba(245, 158, 11, 0.14)',
    activityKey: 'successful_movies',
    defaultTotal: 10,
  },
];

declare global {
  interface Window {
    __DA101_ACTIVE_UID__?: string | null;
    excelState?: {
      completedTasks?: Set<number>;
      wrongTasks?: Set<number>;
      currentTaskIdx?: number;
      completedAt?: number | null;
    };
    EXERCISES_20?: Array<unknown>;
    selectCurriculumModule?: (moduleId: CurriculumModuleId) => void;
    getCurrentCurriculumModule?: () => CurriculumModuleId;
    openActivity?: (activityId: string) => void;
    switchPortalTab?: (tabName: 'lessons' | 'activities') => void;
    updateHomeScreenProgress?: () => void;
    reloadExcelStateFromStorage?: () => void;
    reloadSqlWorldStateFromStorage?: () => void;
    reloadOrderingStateFromStorage?: () => void;
    reloadMoviesStateFromStorage?: () => void;
    selectExcelTask?: (idx: number) => void;
    selectStep?: (stepId: number) => void;
    selectOrderingStep?: (stepId: number) => void;
    selectMoviesStep?: (stepId: number) => void;
    getModuleVerificationCode?: (moduleId: CurriculumModuleId) => string;
  }
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function toUniqueNormalizedIds(val: unknown, offset = 0, maxVal = 50): number[] {
  const rawList = val instanceof Set ? Array.from(val) : Array.isArray(val) ? val : [];
  const seen = new Set<number>();
  for (const item of rawList) {
    const num = Number(item) + offset;
    if (Number.isInteger(num) && num >= 1 && num <= maxVal) {
      seen.add(num);
    }
  }
  return Array.from(seen).sort((a, b) => a - b);
}

function computeNextExercise(
  completedIds: number[],
  wrongIds: number[],
  total: number,
): number | null {
  const doneSet = new Set<number>([...completedIds, ...wrongIds]);
  if (completedIds.length >= total) return null;
  for (let i = 1; i <= total; i++) {
    if (!doneSet.has(i)) return i;
  }
  // If all attempted but some wrong, point to first wrong exercise
  if (wrongIds.length > 0) return wrongIds[0];
  return null;
}

function readModuleCounts(
  def: ModuleDefinition,
): {
  passed: number;
  wrong: number;
  total: number;
  completedAt: number | null;
  completedIds: number[];
  wrongIds: number[];
  activeExercise: number;
} {
  if (typeof window === 'undefined') {
    return {
      passed: 0,
      wrong: 0,
      total: def.defaultTotal,
      completedAt: null,
      completedIds: [],
      wrongIds: [],
      activeExercise: 1,
    };
  }

  try {
    if (def.id === 'excel') {
      const total =
        Array.isArray(window.EXERCISES_20) && window.EXERCISES_20.length > 0
          ? window.EXERCISES_20.length
          : def.defaultTotal;

      const saved = safeParseJson<{
        completedTasks?: unknown[];
        wrongTasks?: unknown[];
        currentTaskIdx?: number;
        completedAt?: number | null;
      }>(getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.excel));

      if (window.excelState?.completedTasks instanceof Set && window.__DA101_ACTIVE_UID__) {
        // Excel tasks are 0-indexed internally -> normalize to 1-indexed exercise numbers
        const completedIds = toUniqueNormalizedIds(window.excelState.completedTasks, 1, total);
        const completedSet = new Set(completedIds);
        const wrongIds = toUniqueNormalizedIds(window.excelState.wrongTasks, 1, total).filter(
          (id) => !completedSet.has(id),
        );
        const passed = completedIds.length;
        const wrong = wrongIds.length;
        const activeExercise = Math.min(
          total,
          Math.max(1, (window.excelState.currentTaskIdx ?? 0) + 1),
        );
        const completedAt =
          passed >= total
            ? (typeof window.excelState.completedAt === 'number'
                ? window.excelState.completedAt
                : typeof saved?.completedAt === 'number'
                  ? saved.completedAt
                  : null)
            : null;
        return { passed, wrong, total, completedAt, completedIds, wrongIds, activeExercise };
      }

      const completedIds = toUniqueNormalizedIds(saved?.completedTasks, 1, total);
      const completedSet = new Set(completedIds);
      const wrongIds = toUniqueNormalizedIds(saved?.wrongTasks, 1, total).filter(
        (id) => !completedSet.has(id),
      );
      const passed = completedIds.length;
      const wrong = wrongIds.length;
      const activeExercise = Math.min(
        total,
        Math.max(1, (typeof saved?.currentTaskIdx === 'number' ? saved.currentTaskIdx : 0) + 1),
      );
      const completedAt =
        passed >= total && typeof saved?.completedAt === 'number'
          ? saved.completedAt
          : null;
      return { passed, wrong, total, completedAt, completedIds, wrongIds, activeExercise };
    }

    if (def.id === 'sql_world') {
      const total = def.defaultTotal;
      const completed = safeParseJson<unknown[]>(
        getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldCompleted),
      );
      const wrongArr = safeParseJson<unknown[]>(
        getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldWrong),
      );
      const activeRaw = getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldActive);
      const meta = safeParseJson<{ completedAt?: number | null }>(
        getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldMeta),
      );
      const completedIds = toUniqueNormalizedIds(completed, 0, total);
      const completedSet = new Set(completedIds);
      const wrongIds = toUniqueNormalizedIds(wrongArr, 0, total).filter(
        (id) => !completedSet.has(id),
      );
      const passed = completedIds.length;
      const wrong = wrongIds.length;
      const activeExercise = Math.min(total, Math.max(1, parseInt(activeRaw || '1', 10) || 1));
      const completedAt =
        passed >= total && typeof meta?.completedAt === 'number'
          ? meta.completedAt
          : null;
      return { passed, wrong, total, completedAt, completedIds, wrongIds, activeExercise };
    }

    if (def.id === 'sql_ordering') {
      const total = def.defaultTotal;
      const saved = safeParseJson<{
        completedSteps?: unknown[];
        wrongSteps?: unknown[];
        activeStep?: number;
        completedAt?: number | null;
      }>(getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlOrdering));
      const completedIds = toUniqueNormalizedIds(saved?.completedSteps, 0, total);
      const completedSet = new Set(completedIds);
      const wrongIds = toUniqueNormalizedIds(saved?.wrongSteps, 0, total).filter(
        (id) => !completedSet.has(id),
      );
      const passed = completedIds.length;
      const wrong = wrongIds.length;
      const activeExercise = Math.min(
        total,
        Math.max(1, typeof saved?.activeStep === 'number' ? saved.activeStep : 1),
      );
      const completedAt =
        passed >= total && typeof saved?.completedAt === 'number'
          ? saved.completedAt
          : null;
      return { passed, wrong, total, completedAt, completedIds, wrongIds, activeExercise };
    }

    if (def.id === 'sql_movies') {
      const total = def.defaultTotal;
      const raw = getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlMovies);
      const saved = safeParseJson<{
        completedSteps?: unknown[];
        wrongSteps?: unknown[];
        activeStep?: number;
        completedAt?: number | null;
      }>(raw);
      const completedIds = toUniqueNormalizedIds(saved?.completedSteps, 0, total);
      const completedSet = new Set(completedIds);
      const wrongIds = toUniqueNormalizedIds(saved?.wrongSteps, 0, total).filter(
        (id) => !completedSet.has(id),
      );
      const passed = completedIds.length;
      const wrong = wrongIds.length;
      const activeExercise = Math.min(
        total,
        Math.max(1, typeof saved?.activeStep === 'number' ? saved.activeStep : 1),
      );
      const completedAt =
        passed >= total && typeof saved?.completedAt === 'number'
          ? saved.completedAt
          : null;
      return { passed, wrong, total, completedAt, completedIds, wrongIds, activeExercise };
    }
  } catch {
    // Fallback to zeroed progress if storage is restricted
  }

  return {
    passed: 0,
    wrong: 0,
    total: def.defaultTotal,
    completedAt: null,
    completedIds: [],
    wrongIds: [],
    activeExercise: 1,
  };
}

export function readCurriculumProgress(): CurriculumSummary {
  const modules: ModuleProgressItem[] = MODULE_DEFINITIONS.map((def) => {
    const { passed, wrong, total, completedAt, completedIds, wrongIds, activeExercise } =
      readModuleCounts(def);
    const attempted = Math.min(total, passed + wrong);
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    const status: ModuleProgressItem['status'] =
      passed >= total && total > 0 ? 'Completed' : attempted > 0 ? 'In Progress' : 'Not Started';
    const nextExerciseNumber = computeNextExercise(completedIds, wrongIds, total);

    return {
      ...def,
      passed,
      wrong,
      attempted,
      total,
      percentage,
      status,
      completedAt,
      completedIds,
      wrongIds,
      activeExercise,
      nextExerciseNumber,
    };
  });

  const totalPassed = modules.reduce((acc, m) => acc + m.passed, 0);
  const totalAttempted = modules.reduce((acc, m) => acc + m.attempted, 0);
  const totalExercises = modules.reduce((acc, m) => acc + m.total, 0);
  const overallPercentage =
    totalExercises > 0 ? Math.round((totalPassed / totalExercises) * 100) : 0;
  const completedModulesCount = modules.filter((m) => m.status === 'Completed').length;
  const nextModule = modules.find((m) => m.status !== 'Completed') ?? null;

  return {
    modules,
    totalPassed,
    totalAttempted,
    totalExercises,
    overallPercentage,
    completedModulesCount,
    nextModule,
  };
}

export function useCurriculumProgress(): CurriculumSummary {
  const [summary, setSummary] = useState<CurriculumSummary>(() => readCurriculumProgress());

  useEffect(() => {
    const refresh = () => {
      setSummary(readCurriculumProgress());
    };

    // Sync after page scripts finish initializing
    const timer = window.setTimeout(refresh, 150);

    window.addEventListener('curriculumprogresschange', refresh);
    window.addEventListener('portaltabchange', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('curriculumprogresschange', refresh);
      window.removeEventListener('portaltabchange', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return summary;
}

export function useActiveCurriculumModule(): CurriculumModuleId {
  const [activeId, setActiveId] = useState<CurriculumModuleId>(() => {
    if (typeof window !== 'undefined' && typeof window.getCurrentCurriculumModule === 'function') {
      return window.getCurrentCurriculumModule();
    }
    return 'excel';
  });

  useEffect(() => {
    if (typeof window.getCurrentCurriculumModule === 'function') {
      setActiveId(window.getCurrentCurriculumModule());
    }

    const handleModuleChange = (e: Event) => {
      const detail = (e as CustomEvent<{ moduleId?: CurriculumModuleId }>).detail;
      if (detail?.moduleId) {
        setActiveId(detail.moduleId);
      } else if (typeof window.getCurrentCurriculumModule === 'function') {
        setActiveId(window.getCurrentCurriculumModule());
      }
    };

    window.addEventListener('curriculummodulechange', handleModuleChange);
    return () => window.removeEventListener('curriculummodulechange', handleModuleChange);
  }, []);

  return activeId;
}

export function useIsDarkTheme(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const sync = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    sync();

    window.addEventListener('appthemechange', sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => {
      window.removeEventListener('appthemechange', sync);
      observer.disconnect();
    };
  }, []);

  return isDark;
}
