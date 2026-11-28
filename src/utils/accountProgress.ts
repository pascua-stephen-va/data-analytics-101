import type { CurriculumModuleId } from './curriculumProgress';

export const ACCOUNT_PROGRESS_KEYS = {
  excel: 'excel_module_1_state_v2',
  sqlWorldCompleted: 'sqlLab_completedSteps',
  sqlWorldWrong: 'sqlLab_wrongSteps',
  sqlWorldActive: 'sqlLab_activeStep',
  sqlWorldQueries: 'sqlLab_submittedQueries',
  sqlWorldMeta: 'sqlLab_meta',
  sqlOrdering: 'seatwork03_ordering_limiting_state',
  sqlMovies: 'asynchronous_01_movies_state_v1',
  sqlMoviesNotes: 'asynchronous_01_movies_notes',
} as const;

const LEGACY_KEYS_TO_CLEAR = [
  'excel_module_1_state_v2',
  'sqlLab_completedSteps',
  'sqlLab_wrongSteps',
  'sqlLab_activeStep',
  'sqlLab_submittedQueries',
  'sqlLab_meta',
  'seatwork03_ordering_limiting_state',
  'asynchronous_01_movies_state_v1',
  'seatwork_04_movies_state_v1',
  'asynchronous_01_movies_notes',
];

export interface CloudModuleProgress {
  updatedAt: number;
  completedAt: number | null;
  passed: number;
  wrong: number;
  attempted: number;
  total: number;
  percentage: number;
  status: 'Completed' | 'In Progress' | 'Not Started';
  state: Record<string, unknown>;
}

export interface CloudProgressDocument {
  uid: string;
  updatedAt: number;
  resetVersion?: number;
  moduleResetTimestamps?: Partial<Record<CurriculumModuleId, number>>;
  modules?: Partial<Record<CurriculumModuleId, CloudModuleProgress>>;
}

export function getAccountStoragePrefix(uid: string | null | undefined): string | null {
  if (!uid || typeof uid !== 'string') return null;
  const safe = uid.replace(/[^a-zA-Z0-9_-]/g, '');
  return safe ? `da101_u_${safe}__` : null;
}

export function getActiveStorageUid(): string | null {
  if (typeof window === 'undefined') return null;
  return window.__DA101_ACTIVE_UID__ || null;
}

export function setActiveStorageUid(uid: string | null): void {
  if (typeof window === 'undefined') return;
  window.__DA101_ACTIVE_UID__ = uid || null;
}

export function getAccountScopedItem(
  baseKey: string,
  uidOverride?: string | null,
): string | null {
  if (typeof window === 'undefined') return null;
  const uid = uidOverride !== undefined ? uidOverride : getActiveStorageUid();
  const prefix = getAccountStoragePrefix(uid);
  if (!prefix) return null;
  try {
    return localStorage.getItem(`${prefix}${baseKey}`);
  } catch {
    return null;
  }
}

export function setAccountScopedItem(
  baseKey: string,
  value: string,
  uidOverride?: string | null,
): void {
  if (typeof window === 'undefined') return;
  const uid = uidOverride !== undefined ? uidOverride : getActiveStorageUid();
  const prefix = getAccountStoragePrefix(uid);
  if (!prefix) return;
  try {
    localStorage.setItem(`${prefix}${baseKey}`, value);
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export function removeAccountScopedItem(
  baseKey: string,
  uidOverride?: string | null,
): void {
  if (typeof window === 'undefined') return;
  const uid = uidOverride !== undefined ? uidOverride : getActiveStorageUid();
  const prefix = getAccountStoragePrefix(uid);
  if (!prefix) return;
  try {
    localStorage.removeItem(`${prefix}${baseKey}`);
  } catch {
    // Ignore storage errors
  }
}

export function clearLegacySharedProgressKeys(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of LEGACY_KEYS_TO_CLEAR) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem('studentFirstName');
    localStorage.removeItem('studentMiddleName');
    localStorage.removeItem('studentLastName');
    localStorage.removeItem('studentBatch');
  } catch {
    // Ignore storage errors
  }
}

export function clearAccountModuleLocalState(
  uid: string,
  moduleId: CurriculumModuleId,
): void {
  if (moduleId === 'excel') {
    removeAccountScopedItem(ACCOUNT_PROGRESS_KEYS.excel, uid);
  } else if (moduleId === 'sql_world') {
    removeAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldCompleted, uid);
    removeAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldWrong, uid);
    removeAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldActive, uid);
    removeAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldQueries, uid);
    removeAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldMeta, uid);
  } else if (moduleId === 'sql_ordering') {
    removeAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlOrdering, uid);
  } else if (moduleId === 'sql_movies') {
    removeAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlMovies, uid);
    removeAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlMoviesNotes, uid);
  }
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function uniqueNumbers(arr: unknown): number[] {
  if (!Array.isArray(arr)) return [];
  const seen = new Set<number>();
  for (const item of arr) {
    const num = Number(item);
    if (Number.isFinite(num)) seen.add(num);
  }
  return Array.from(seen);
}

function computeStatus(
  passed: number,
  attempted: number,
  total: number,
): 'Completed' | 'In Progress' | 'Not Started' {
  if (total > 0 && passed >= total) return 'Completed';
  if (attempted > 0) return 'In Progress';
  return 'Not Started';
}

function normalizeQueryMap(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'string' && v.trim().length > 0) {
      out[String(k)] = v.slice(0, 4000);
    }
  }
  return out;
}

export function extractLocalModuleProgress(
  uid: string,
  moduleId: CurriculumModuleId,
): CloudModuleProgress | null {
  if (moduleId === 'excel') {
    const parsed = safeJsonParse<Record<string, unknown>>(
      getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.excel, uid),
    );
    if (!parsed) return null;

    const total =
      Array.isArray(window.EXERCISES_20) && window.EXERCISES_20.length > 0
        ? window.EXERCISES_20.length
        : 20;
    const completedTasks = uniqueNumbers(parsed.completedTasks);
    const wrongTasks = uniqueNumbers(parsed.wrongTasks);
    const passed = Math.min(total, completedTasks.length);
    const wrong = Math.min(total - passed, wrongTasks.length);
    const attempted = Math.min(total, passed + wrong);
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    const status = computeStatus(passed, attempted, total);
    const updatedAt =
      typeof parsed.updatedAt === 'number' && parsed.updatedAt > 0
        ? parsed.updatedAt
        : Date.now();
    const completedAt =
      status === 'Completed'
        ? typeof parsed.completedAt === 'number' && parsed.completedAt > 0
          ? parsed.completedAt
          : updatedAt
        : null;

    // Keep Excel cloud payload compact by storing formulas, flags, and only compact sheet data
    const state: Record<string, unknown> = {
      completedTasks,
      wrongTasks,
      currentTaskIdx:
        typeof parsed.currentTaskIdx === 'number' ? parsed.currentTaskIdx : 0,
      hasStartedLab: Boolean(parsed.hasStartedLab),
      isCompleted: Boolean(parsed.isCompleted) || status === 'Completed',
      cellFormulas:
        parsed.cellFormulas && typeof parsed.cellFormulas === 'object'
          ? parsed.cellFormulas
          : {},
      cellHyperlinks:
        parsed.cellHyperlinks && typeof parsed.cellHyperlinks === 'object'
          ? parsed.cellHyperlinks
          : {},
      tableFormatted: Boolean(parsed.tableFormatted),
      dataValidationActive: Boolean(parsed.dataValidationActive),
      chartInserted: Boolean(parsed.chartInserted),
      slicerActive: Boolean(parsed.slicerActive),
    };

    // Include modified sheets if reasonably sized (< 250KB JSON)
    if (parsed.sheets && typeof parsed.sheets === 'object') {
      try {
        const sheetsJson = JSON.stringify(parsed.sheets);
        if (sheetsJson.length < 250_000) {
          state.sheets = parsed.sheets;
        }
      } catch {
        // Skip sheets if unserializable
      }
    }

    return {
      updatedAt,
      completedAt,
      passed,
      wrong,
      attempted,
      total,
      percentage,
      status,
      state,
    };
  }

  if (moduleId === 'sql_world') {
    const completedRaw = safeJsonParse<unknown[]>(
      getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldCompleted, uid),
    );
    const wrongRaw = safeJsonParse<unknown[]>(
      getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldWrong, uid),
    );
    const activeRaw = getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldActive, uid);
    const queriesRaw = safeJsonParse<Record<string, unknown>>(
      getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldQueries, uid),
    );
    const metaRaw = safeJsonParse<{ updatedAt?: number; completedAt?: number | null }>(
      getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlWorldMeta, uid),
    );

    if (!completedRaw && !wrongRaw && !activeRaw && !queriesRaw && !metaRaw) {
      return null;
    }

    const total = 12;
    const completedSteps = uniqueNumbers(completedRaw);
    const wrongSteps = uniqueNumbers(wrongRaw);
    const passed = Math.min(total, completedSteps.length);
    const wrong = Math.min(total - passed, wrongSteps.length);
    const attempted = Math.min(total, passed + wrong);
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    const status = computeStatus(passed, attempted, total);
    const updatedAt =
      typeof metaRaw?.updatedAt === 'number' && metaRaw.updatedAt > 0
        ? metaRaw.updatedAt
        : Date.now();
    const completedAt =
      status === 'Completed'
        ? typeof metaRaw?.completedAt === 'number' && metaRaw.completedAt > 0
          ? metaRaw.completedAt
          : updatedAt
        : null;

    return {
      updatedAt,
      completedAt,
      passed,
      wrong,
      attempted,
      total,
      percentage,
      status,
      state: {
        completedSteps,
        wrongSteps,
        activeStep: Math.min(Math.max(parseInt(activeRaw || '1', 10) || 1, 1), total),
        submittedQueries: normalizeQueryMap(queriesRaw),
      },
    };
  }

  if (moduleId === 'sql_ordering') {
    const parsed = safeJsonParse<Record<string, unknown>>(
      getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlOrdering, uid),
    );
    if (!parsed) return null;

    const total = 10;
    const completedSteps = uniqueNumbers(parsed.completedSteps);
    const wrongSteps = uniqueNumbers(parsed.wrongSteps);
    const passed = Math.min(total, completedSteps.length);
    const wrong = Math.min(total - passed, wrongSteps.length);
    const attempted = Math.min(total, passed + wrong);
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    const status = computeStatus(passed, attempted, total);
    const updatedAt =
      typeof parsed.updatedAt === 'number' && parsed.updatedAt > 0
        ? parsed.updatedAt
        : Date.now();
    const completedAt =
      status === 'Completed'
        ? typeof parsed.completedAt === 'number' && parsed.completedAt > 0
          ? parsed.completedAt
          : updatedAt
        : null;

    return {
      updatedAt,
      completedAt,
      passed,
      wrong,
      attempted,
      total,
      percentage,
      status,
      state: {
        completedSteps,
        wrongSteps,
        activeStep:
          typeof parsed.activeStep === 'number'
            ? Math.min(Math.max(parsed.activeStep, 1), total)
            : 1,
        activeTab: typeof parsed.activeTab === 'string' ? parsed.activeTab : 'intro',
        isLabStarted: Boolean(parsed.isLabStarted),
        submittedQueries: normalizeQueryMap(parsed.submittedQueries),
      },
    };
  }

  if (moduleId === 'sql_movies') {
    const parsed = safeJsonParse<Record<string, unknown>>(
      getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlMovies, uid),
    );
    const notesHtml = getAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlMoviesNotes, uid);
    if (!parsed && !notesHtml) return null;

    const total = 10;
    const completedSteps = uniqueNumbers(parsed?.completedSteps);
    const wrongSteps = uniqueNumbers(parsed?.wrongSteps);
    const passed = Math.min(total, completedSteps.length);
    const wrong = Math.min(total - passed, wrongSteps.length);
    const attempted = Math.min(total, passed + wrong);
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    const status = computeStatus(passed, attempted, total);
    const updatedAt =
      typeof parsed?.updatedAt === 'number' && parsed.updatedAt > 0
        ? parsed.updatedAt
        : Date.now();
    const completedAt =
      status === 'Completed'
        ? typeof parsed?.completedAt === 'number' && parsed.completedAt > 0
          ? parsed.completedAt
          : updatedAt
        : null;

    return {
      updatedAt,
      completedAt,
      passed,
      wrong,
      attempted,
      total,
      percentage,
      status,
      state: {
        completedSteps,
        wrongSteps,
        activeStep:
          typeof parsed?.activeStep === 'number'
            ? Math.min(Math.max(parsed.activeStep, 1), total)
            : 1,
        activeTab: typeof parsed?.activeTab === 'string' ? parsed.activeTab : 'intro',
        isLabStarted: Boolean(parsed?.isLabStarted),
        submittedQueries: normalizeQueryMap(parsed?.submittedQueries),
        notesHtml: typeof notesHtml === 'string' ? notesHtml.slice(0, 12000) : '',
      },
    };
  }

  return null;
}

export function applyCloudModuleToLocalStorage(
  uid: string,
  moduleId: CurriculumModuleId,
  cloudMod: CloudModuleProgress,
): void {
  const st = cloudMod.state || {};

  if (moduleId === 'excel') {
    const payload = {
      completedTasks: uniqueNumbers(st.completedTasks),
      wrongTasks: uniqueNumbers(st.wrongTasks),
      currentTaskIdx: typeof st.currentTaskIdx === 'number' ? st.currentTaskIdx : 0,
      hasStartedLab: Boolean(st.hasStartedLab),
      isCompleted: Boolean(st.isCompleted) || cloudMod.status === 'Completed',
      cellFormulas:
        st.cellFormulas && typeof st.cellFormulas === 'object' ? st.cellFormulas : {},
      cellHyperlinks:
        st.cellHyperlinks && typeof st.cellHyperlinks === 'object'
          ? st.cellHyperlinks
          : {},
      tableFormatted: Boolean(st.tableFormatted),
      dataValidationActive: Boolean(st.dataValidationActive),
      chartInserted: Boolean(st.chartInserted),
      slicerActive: Boolean(st.slicerActive),
      ...(st.sheets && typeof st.sheets === 'object' ? { sheets: st.sheets } : {}),
      updatedAt: cloudMod.updatedAt || Date.now(),
      completedAt: cloudMod.completedAt ?? null,
    };
    setAccountScopedItem(ACCOUNT_PROGRESS_KEYS.excel, JSON.stringify(payload), uid);
    return;
  }

  if (moduleId === 'sql_world') {
    setAccountScopedItem(
      ACCOUNT_PROGRESS_KEYS.sqlWorldCompleted,
      JSON.stringify(uniqueNumbers(st.completedSteps)),
      uid,
    );
    setAccountScopedItem(
      ACCOUNT_PROGRESS_KEYS.sqlWorldWrong,
      JSON.stringify(uniqueNumbers(st.wrongSteps)),
      uid,
    );
    setAccountScopedItem(
      ACCOUNT_PROGRESS_KEYS.sqlWorldActive,
      String(typeof st.activeStep === 'number' ? st.activeStep : 1),
      uid,
    );
    setAccountScopedItem(
      ACCOUNT_PROGRESS_KEYS.sqlWorldQueries,
      JSON.stringify(normalizeQueryMap(st.submittedQueries)),
      uid,
    );
    setAccountScopedItem(
      ACCOUNT_PROGRESS_KEYS.sqlWorldMeta,
      JSON.stringify({
        updatedAt: cloudMod.updatedAt || Date.now(),
        completedAt: cloudMod.completedAt ?? null,
      }),
      uid,
    );
    return;
  }

  if (moduleId === 'sql_ordering') {
    const payload = {
      activeStep: typeof st.activeStep === 'number' ? st.activeStep : 1,
      completedSteps: uniqueNumbers(st.completedSteps),
      wrongSteps: uniqueNumbers(st.wrongSteps),
      activeTab: typeof st.activeTab === 'string' ? st.activeTab : 'intro',
      isLabStarted: Boolean(st.isLabStarted),
      submittedQueries: normalizeQueryMap(st.submittedQueries),
      updatedAt: cloudMod.updatedAt || Date.now(),
      completedAt: cloudMod.completedAt ?? null,
    };
    setAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlOrdering, JSON.stringify(payload), uid);
    return;
  }

  if (moduleId === 'sql_movies') {
    const payload = {
      activeStep: typeof st.activeStep === 'number' ? st.activeStep : 1,
      activeTab: typeof st.activeTab === 'string' ? st.activeTab : 'intro',
      completedSteps: uniqueNumbers(st.completedSteps),
      wrongSteps: uniqueNumbers(st.wrongSteps),
      isLabStarted: Boolean(st.isLabStarted),
      submittedQueries: normalizeQueryMap(st.submittedQueries),
      updatedAt: cloudMod.updatedAt || Date.now(),
      completedAt: cloudMod.completedAt ?? null,
    };
    setAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlMovies, JSON.stringify(payload), uid);
    if (typeof st.notesHtml === 'string' && st.notesHtml.length > 0) {
      setAccountScopedItem(ACCOUNT_PROGRESS_KEYS.sqlMoviesNotes, st.notesHtml, uid);
    }
  }
}

export function reloadAllVanillaModulesFromStorage(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.reloadExcelStateFromStorage === 'function') {
    window.reloadExcelStateFromStorage();
  }
  if (typeof window.reloadSqlWorldStateFromStorage === 'function') {
    window.reloadSqlWorldStateFromStorage();
  }
  if (typeof window.reloadOrderingStateFromStorage === 'function') {
    window.reloadOrderingStateFromStorage();
  }
  if (typeof window.reloadMoviesStateFromStorage === 'function') {
    window.reloadMoviesStateFromStorage();
  }
  if (typeof window.updateHomeScreenProgress === 'function') {
    window.updateHomeScreenProgress();
  }
  window.dispatchEvent(new CustomEvent('curriculumprogresschange'));
}
