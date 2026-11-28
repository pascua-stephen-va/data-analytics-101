import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  auth,
  buildFirestoreErrorInfo,
  db,
  googleProvider,
  INSTRUCTOR_EMAIL,
  isInstructorEmail,
  OperationType,
} from '../firebase';
import {
  MODULE_DEFINITIONS,
  readCurriculumProgress,
  type CurriculumModuleId,
} from '../utils/curriculumProgress';
import {
  applyCloudModuleToLocalStorage,
  clearAccountModuleLocalState,
  clearLegacySharedProgressKeys,
  extractLocalModuleProgress,
  reloadAllVanillaModulesFromStorage,
  setActiveStorageUid,
  type CloudModuleProgress,
  type CloudProgressDocument,
} from '../utils/accountProgress';
import {
  buildStudentIdentityKey,
  cleanNameField,
  formatFullName,
  isGmailEmail,
} from '../utils/identity';

import { computeVerificationCode } from '../utils/verificationCode';

export const ALL_MODULE_IDS: CurriculumModuleId[] = MODULE_DEFINITIONS.map(
  (m) => m.id,
);

export type ExamMode = 'practice' | 'exam';

export interface ClassCodeRecord {
  code: string;
  batchNumber: string;
  allowedModules: CurriculumModuleId[];
  startsAt: Timestamp;
  expiresAt: Timestamp;
  active: boolean;
  examMode?: ExamMode;
  archived?: boolean;
  createdBy?: string;
  createdAt?: Timestamp;
}

export interface ModuleScoreSummary {
  passed: number;
  wrong: number;
  attempted: number;
  total: number;
  percentage: number;
  status: 'Completed' | 'In Progress' | 'Not Started';
  completedAt?: number | null;
  wrongStepIds?: number[];
}

export interface AuditMetrics {
  tabSwitches: number;
  largePastes: number;
  moduleDurationsSec: Partial<Record<CurriculumModuleId, number>>;
}

export interface ClassAnnouncement {
  id: string;
  message: string;
  targetBatch: string; // 'ALL' or specific batchNumber
  active: boolean;
  updatedBy?: string;
  updatedAtMs?: number;
}

export interface EnrollmentRecord {
  uid: string;
  email: string;
  displayName: string;
  code: string;
  batchNumber: string;
  allowedModules: CurriculumModuleId[];
  examMode?: ExamMode;
  startsAt?: Timestamp;
  expiresAt: Timestamp;
  customExpiresAt?: Timestamp | null;
  activatedAt?: Timestamp;
  firstName?: string;
  middleName?: string;
  noMiddleName?: boolean;
  lastName?: string;
  fullName?: string;
  profileLocked?: boolean;
  identityKey?: string;
  profileRegisteredAt?: Timestamp;
  revoked?: boolean;
  blocked?: boolean;
  flaggedDuplicate?: boolean;
  duplicateOfUid?: string;
  flaggedAt?: Timestamp;
  moduleScores?: Partial<Record<CurriculumModuleId, ModuleScoreSummary>>;
  auditMetrics?: AuditMetrics;
}

export interface GlobalAccessSnapshot {
  isAuthenticated: boolean;
  isInstructor: boolean;
  hasAccess: boolean;
  isExpiredExportOnly: boolean;
  isBlocked: boolean;
  isRevoked: boolean;
  profileLocked: boolean;
  examMode: ExamMode;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  fullName: string | null;
  batchNumber: string | null;
  allowedModules: CurriculumModuleId[];
  expiresAtMs: number | null;
  code: string | null;
}

export interface ProfileRegistrationInput {
  firstName: string;
  middleName: string;
  noMiddleName: boolean;
  lastName: string;
}

declare global {
  interface Window {
    __DA101_ACCESS__?: GlobalAccessSnapshot;
    applyAccessRestrictionsToDOM?: (snapshot: GlobalAccessSnapshot) => void;
    handleStudentInfoChange?: () => void;
    updateDateAndTimeBadges?: () => void;
    updateExcelCompletionCard?: () => void;
    renderOrderingLeftPane?: () => void;
    goToHomeScreen?: (immediate?: boolean) => void;
    exportModuleResult?: (
      moduleId: CurriculumModuleId,
      format: 'pdf' | 'png',
    ) => Promise<void> | void;
    showNotification?: (msg: string) => void;
  }
}

export function sanitizeClassCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 32);
}

function readUrlCodeParam(): string {
  if (typeof window === 'undefined') return '';
  try {
    const params = new URLSearchParams(window.location.search);
    return sanitizeClassCode(params.get('code') || '');
  } catch {
    return '';
  }
}

function clearUrlCodeParam() {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('code')) {
      url.searchParams.delete('code');
      window.history.replaceState({}, document.title, url.toString());
    }
  } catch {
    // Ignore history API restrictions
  }
}

function normalizeAllowedModules(raw: unknown): CurriculumModuleId[] {
  if (!Array.isArray(raw)) return [];
  const validSet = new Set<string>(ALL_MODULE_IDS);
  return Array.from(
    new Set(
      raw.filter(
        (item): item is CurriculumModuleId =>
          typeof item === 'string' && validSet.has(item),
      ),
    ),
  );
}

function parseEnrollmentDoc(
  uid: string,
  fallbackEmail: string,
  fallbackDisplayName: string,
  raw: Record<string, unknown>,
): EnrollmentRecord | null {
  const code = sanitizeClassCode(String(raw.code || ''));
  const batchNumber = String(raw.batchNumber || '').trim();
  const allowedModules = normalizeAllowedModules(raw.allowedModules);
  const expiresAt = raw.expiresAt instanceof Timestamp ? raw.expiresAt : null;

  if (!code || !expiresAt || allowedModules.length === 0) {
    return null;
  }

  const rawAudit =
    raw.auditMetrics && typeof raw.auditMetrics === 'object'
      ? (raw.auditMetrics as Partial<AuditMetrics>)
      : undefined;

  return {
    uid,
    email: typeof raw.email === 'string' ? raw.email : fallbackEmail,
    displayName:
      typeof raw.displayName === 'string' ? raw.displayName : fallbackDisplayName,
    code,
    batchNumber,
    allowedModules,
    examMode: raw.examMode === 'exam' ? 'exam' : 'practice',
    startsAt: raw.startsAt instanceof Timestamp ? raw.startsAt : undefined,
    expiresAt,
    customExpiresAt:
      raw.customExpiresAt instanceof Timestamp ? raw.customExpiresAt : null,
    activatedAt:
      raw.activatedAt instanceof Timestamp ? raw.activatedAt : undefined,
    firstName: typeof raw.firstName === 'string' ? raw.firstName : undefined,
    middleName: typeof raw.middleName === 'string' ? raw.middleName : undefined,
    noMiddleName: Boolean(raw.noMiddleName),
    lastName: typeof raw.lastName === 'string' ? raw.lastName : undefined,
    fullName: typeof raw.fullName === 'string' ? raw.fullName : undefined,
    profileLocked: Boolean(raw.profileLocked),
    identityKey: typeof raw.identityKey === 'string' ? raw.identityKey : undefined,
    profileRegisteredAt:
      raw.profileRegisteredAt instanceof Timestamp
        ? raw.profileRegisteredAt
        : undefined,
    revoked: Boolean(raw.revoked),
    blocked: Boolean(raw.blocked),
    flaggedDuplicate: Boolean(raw.flaggedDuplicate),
    duplicateOfUid:
      typeof raw.duplicateOfUid === 'string' ? raw.duplicateOfUid : undefined,
    flaggedAt: raw.flaggedAt instanceof Timestamp ? raw.flaggedAt : undefined,
    moduleScores:
      raw.moduleScores && typeof raw.moduleScores === 'object'
        ? (raw.moduleScores as Partial<Record<CurriculumModuleId, ModuleScoreSummary>>)
        : undefined,
    auditMetrics: rawAudit
      ? {
          tabSwitches:
            typeof rawAudit.tabSwitches === 'number' ? rawAudit.tabSwitches : 0,
          largePastes:
            typeof rawAudit.largePastes === 'number' ? rawAudit.largePastes : 0,
          moduleDurationsSec:
            rawAudit.moduleDurationsSec &&
            typeof rawAudit.moduleDurationsSec === 'object'
              ? rawAudit.moduleDurationsSec
              : {},
        }
      : undefined,
  };
}

interface AccessContextValue {
  user: User | null;
  authLoading: boolean;
  enrollmentLoading: boolean;
  isInstructor: boolean;
  hasAccess: boolean;
  isBlocked: boolean;
  isRevoked: boolean;
  isExpired: boolean;
  needsProfileRegistration: boolean;
  isExpiredExportOnly: boolean;
  examMode: ExamMode;
  showCodeEntryFromExpired: boolean;
  setShowCodeEntryFromExpired: (open: boolean) => void;
  enrollment: EnrollmentRecord | null;
  allowedModules: CurriculumModuleId[];
  lockedBatchNumber: string | null;
  expiresAtMs: number | null;
  nowMs: number;
  urlCode: string;
  authError: string | null;
  redeemError: string | null;
  redeeming: boolean;
  profileError: string | null;
  savingProfile: boolean;
  instructorPanelOpen: boolean;
  setInstructorPanelOpen: (open: boolean) => void;
  signOutConfirmOpen: boolean;
  requestSignOut: () => void;
  cancelSignOut: () => void;
  confirmSignOut: () => Promise<void>;
  signInWithGoogle: (forInstructor?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  redeemClassCode: (rawCode: string) => Promise<boolean>;
  completeStudentProfile: (
    input: ProfileRegistrationInput,
  ) => Promise<{ ok: boolean; duplicate?: boolean }>;
  refreshEnrollment: () => Promise<void>;
  clearErrors: () => void;
  // Resilience & Live Class Broadcast state
  isOnline: boolean;
  hasPendingSync: boolean;
  justReconnected: boolean;
  duplicateTabDetected: boolean;
  dismissDuplicateTabWarning: () => void;
  claimTabControl: () => void;
  activeAnnouncement: ClassAnnouncement | null;
  recordLargePaste: () => void;
}

const AccessContext = createContext<AccessContextValue | null>(null);

const NON_GMAIL_ERROR =
  'Only Virtual Assistant Google Accounts ending in @gmail.com are permitted. Please sign in with your @gmail.com account.';

export function AccessProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollment, setEnrollment] = useState<EnrollmentRecord | null>(null);
  const [codeRevoked, setCodeRevoked] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [urlCode, setUrlCode] = useState(() => readUrlCodeParam());
  const [authError, setAuthError] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [instructorPanelOpen, setInstructorPanelOpen] = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [showCodeEntryFromExpired, setShowCodeEntryFromExpired] = useState(false);

  // Resilience: Offline queue + Duplicate tab guard + Live Class Broadcast
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);
  const [duplicateTabDetected, setDuplicateTabDetected] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] =
    useState<ClassAnnouncement | null>(null);

  const tabInstanceIdRef = useRef<string>(
    `tab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  );
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const auditRef = useRef<AuditMetrics>({
    tabSwitches: 0,
    largePastes: 0,
    moduleDurationsSec: {},
  });
  const activeLabTickRef = useRef<{ moduleId: CurriculumModuleId | null; lastTickMs: number }>({
    moduleId: null,
    lastTickMs: Date.now(),
  });

  const expiryVerifiedForRef = useRef<number | null>(null);
  const wasExpiredExportRef = useRef(false);
  const lastScoreSyncJsonRef = useRef<string>('');
  const lastProgressSyncJsonRef = useRef<string>('');
  const isHydratingFromCloudRef = useRef(false);
  const hasHydratedCloudRef = useRef(false);
  const hasPendingProgressRef = useRef(false);
  const cloudMetaRef = useRef<{
    resetVersion: number;
    moduleResetTimestamps: Partial<Record<CurriculumModuleId, number>>;
  }>({
    resetVersion: 0,
    moduleResetTimestamps: {},
  });
  const handledResetTokensRef = useRef<Record<string, number>>({});

  const isInstructor = useMemo(
    () => Boolean(user && !user.isAnonymous && isInstructorEmail(user.email)),
    [user],
  );

  // Sync class_codes/{code} updates (extensions or code-level revocations) without wiping expired Export-Only sessions
  const verifyClassCodeLive = useCallback(
    async (currentUser: User, record: EnrollmentRecord) => {
      if (isInstructorEmail(currentUser.email)) return;

      const codeRef = doc(db, 'class_codes', record.code);
      try {
        let codeSnap;
        try {
          codeSnap = await getDocFromServer(codeRef);
        } catch {
          codeSnap = await getDoc(codeRef);
        }

        if (!codeSnap.exists()) {
          // If the code doc was deleted while still before expiry, treat as revoked
          if (Date.now() <= record.expiresAt.toMillis()) {
            setCodeRevoked(true);
          }
          return;
        }

        const codeData = codeSnap.data() as Partial<ClassCodeRecord>;
        if (!codeData.active) {
          setCodeRevoked(true);
          return;
        }

        setCodeRevoked(false);
        const liveExpiresAt =
          codeData.expiresAt instanceof Timestamp
            ? codeData.expiresAt
            : record.expiresAt;
        const liveStartsAt =
          codeData.startsAt instanceof Timestamp
            ? codeData.startsAt
            : record.startsAt;
        const liveModules = normalizeAllowedModules(codeData.allowedModules);
        const nextModules =
          liveModules.length > 0 ? liveModules : record.allowedModules;
        const liveBatch = String(
          codeData.batchNumber || record.batchNumber,
        ).trim();
        const liveExamMode: ExamMode =
          codeData.examMode === 'exam' ? 'exam' : 'practice';

        const hasCustomOverride = Boolean(record.customExpiresAt);
        const resolvedExpiresAt = hasCustomOverride
          ? record.expiresAt
          : liveExpiresAt;
        const needsSync =
          (!hasCustomOverride &&
            liveExpiresAt.toMillis() !== record.expiresAt.toMillis()) ||
          nextModules.join(',') !== record.allowedModules.join(',') ||
          liveExamMode !== (record.examMode ?? 'practice') ||
          (!record.profileLocked && liveBatch !== record.batchNumber);

        if (
          needsSync &&
          resolvedExpiresAt.toMillis() > Date.now() &&
          !record.blocked &&
          !record.revoked
        ) {
          try {
            await setDoc(
              doc(db, 'enrollments', currentUser.uid),
              {
                uid: currentUser.uid,
                code: record.code,
                batchNumber: record.profileLocked ? record.batchNumber : liveBatch,
                allowedModules: nextModules,
                examMode: liveExamMode,
                startsAt: liveStartsAt ?? record.startsAt ?? Timestamp.now(),
                expiresAt: resolvedExpiresAt,
              },
              { merge: true },
            );
          } catch {
            // Non-fatal if student enrollment already has custom instructor overrides
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('permission-denied') ||
          msg.includes('Missing or insufficient permissions')
        ) {
          // Firestore rules deny get on class_codes/{code} if expired OR revoked.
          // Only mark as revoked if the stored code window has NOT yet expired and there is no future custom extension.
          const customMs = record.customExpiresAt?.toMillis() ?? 0;
          if (Date.now() <= record.expiresAt.toMillis() && customMs <= Date.now()) {
            setCodeRevoked(true);
          }
        }
      }
    },
    [],
  );

  // Auth listener with strict @gmail.com & non-anonymous enforcement
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.isAnonymous) {
        void firebaseSignOut(auth);
        setUser(null);
        setEnrollment(null);
        setCodeRevoked(false);
        setAuthLoading(false);
        return;
      }

      if (firebaseUser && !isGmailEmail(firebaseUser.email)) {
        void firebaseSignOut(auth);
        setUser(null);
        setEnrollment(null);
        setCodeRevoked(false);
        setAuthError(NON_GMAIL_ERROR);
        setAuthLoading(false);
        return;
      }

      setUser(firebaseUser);
      setAuthLoading(false);

      if (!firebaseUser) {
        setEnrollment(null);
        setCodeRevoked(false);
        setInstructorPanelOpen(false);
        setShowCodeEntryFromExpired(false);
        setSignOutConfirmOpen(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time subscription to enrollments/{uid} so instructor block/revoke/extend/edit updates immediately
  useEffect(() => {
    if (!user) {
      setEnrollment(null);
      setEnrollmentLoading(false);
      setCodeRevoked(false);
      return;
    }

    if (isInstructorEmail(user.email)) {
      setEnrollment(null);
      setEnrollmentLoading(false);
      setCodeRevoked(false);
      return;
    }

    setEnrollmentLoading(true);
    setCodeRevoked(false);
    const enrollmentPath = `enrollments/${user.uid}`;
    const enrollmentRef = doc(db, 'enrollments', user.uid);

    const unsubscribe = onSnapshot(
      enrollmentRef,
      (snap) => {
        if (!snap.exists()) {
          setEnrollment(null);
          setCodeRevoked(false);
          setEnrollmentLoading(false);
          return;
        }

        const parsed = parseEnrollmentDoc(
          user.uid,
          user.email || '',
          user.displayName || '',
          snap.data() as Record<string, unknown>,
        );

        setEnrollment(parsed);
        setEnrollmentLoading(false);

        if (parsed && !parsed.blocked && !parsed.revoked) {
          void verifyClassCodeLive(user, parsed);
        }
      },
      (error) => {
        const info = buildFirestoreErrorInfo(
          error,
          OperationType.GET,
          enrollmentPath,
        );
        console.error('Firestore Error: ', JSON.stringify(info));
        setEnrollment(null);
        setEnrollmentLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, verifyClassCodeLive]);

  const expiresAtMs = useMemo(() => {
    if (isInstructor || !enrollment) return null;
    if (enrollment.customExpiresAt) {
      return enrollment.customExpiresAt.toMillis();
    }
    return enrollment.expiresAt.toMillis();
  }, [enrollment, isInstructor]);

  // Adaptive timer tick: 1s when <= 60 minutes remaining, 15s otherwise
  useEffect(() => {
    const remaining = expiresAtMs ? expiresAtMs - Date.now() : Infinity;
    const intervalMs = remaining > 0 && remaining <= 60 * 60 * 1000 ? 1000 : 15_000;
    const id = window.setInterval(() => setNowMs(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [expiresAtMs, nowMs > (expiresAtMs ?? Infinity)]);

  // When countdown reaches 0, re-verify class_codes/{code} once in case instructor extended it
  useEffect(() => {
    if (!user || isInstructor || !enrollment || !expiresAtMs) return;
    if (nowMs >= expiresAtMs && expiryVerifiedForRef.current !== expiresAtMs) {
      expiryVerifiedForRef.current = expiresAtMs;
      void verifyClassCodeLive(user, enrollment);
    }
  }, [enrollment, expiresAtMs, isInstructor, nowMs, user, verifyClassCodeLive]);

  const isBlocked = useMemo(
    () => !isInstructor && Boolean(enrollment?.blocked),
    [enrollment?.blocked, isInstructor],
  );

  const isRevoked = useMemo(
    () => !isInstructor && Boolean(enrollment?.revoked || codeRevoked),
    [codeRevoked, enrollment?.revoked, isInstructor],
  );

  const isExpired = useMemo(() => {
    if (isInstructor) return false;
    if (!enrollment || !expiresAtMs) return false;
    return nowMs > expiresAtMs;
  }, [enrollment, expiresAtMs, isInstructor, nowMs]);

  const isNotYetStarted = useMemo(() => {
    if (isInstructor || !enrollment?.startsAt) return false;
    return nowMs < enrollment.startsAt.toMillis();
  }, [enrollment?.startsAt, isInstructor, nowMs]);

  const needsProfileRegistration = useMemo(() => {
    if (isInstructor) return false;
    return Boolean(
      user &&
        enrollment &&
        !isBlocked &&
        !isRevoked &&
        !isExpired &&
        !isNotYetStarted &&
        !enrollment.profileLocked,
    );
  }, [
    enrollment,
    isBlocked,
    isExpired,
    isInstructor,
    isNotYetStarted,
    isRevoked,
    user,
  ]);

  // Export-Only Mode (Option 1 de-escalation): Any registered student whose time expired
  // OR whose access was blocked/revoked experiences the identical neutral Export-Only Mode.
  const isExpiredExportOnly = useMemo(() => {
    if (isInstructor) return false;
    return Boolean(
      user &&
        enrollment &&
        enrollment.profileLocked &&
        (isExpired || isBlocked || isRevoked),
    );
  }, [enrollment, isBlocked, isExpired, isInstructor, isRevoked, user]);

  const hasAccess = useMemo(() => {
    if (!user) return false;
    if (isInstructor) return true;
    if (!enrollment || !expiresAtMs) return false;
    if (isBlocked || isRevoked || isExpired || isNotYetStarted) return false;
    if (!enrollment.profileLocked) return false;
    return enrollment.allowedModules.length > 0;
  }, [
    enrollment,
    expiresAtMs,
    isBlocked,
    isExpired,
    isInstructor,
    isNotYetStarted,
    isRevoked,
    user,
  ]);

  const allowedModules = useMemo<CurriculumModuleId[]>(() => {
    if (isInstructor) return ALL_MODULE_IDS;
    if ((hasAccess || isExpiredExportOnly) && enrollment) {
      return enrollment.allowedModules;
    }
    return [];
  }, [enrollment, hasAccess, isExpiredExportOnly, isInstructor]);

  const lockedBatchNumber = useMemo<string | null>(() => {
    if (isInstructor) return null;
    if (enrollment?.batchNumber) return enrollment.batchNumber;
    return null;
  }, [enrollment?.batchNumber, isInstructor]);

  const examMode = useMemo<ExamMode>(() => {
    if (isInstructor) return 'practice';
    return enrollment?.examMode === 'exam' ? 'exam' : 'practice';
  }, [enrollment?.examMode, isInstructor]);

  // Seed local auditMetrics ref whenever enrollment hydrates from Firestore
  useEffect(() => {
    if (enrollment?.auditMetrics) {
      auditRef.current = {
        tabSwitches: Math.max(
          auditRef.current.tabSwitches,
          enrollment.auditMetrics.tabSwitches || 0,
        ),
        largePastes: Math.max(
          auditRef.current.largePastes,
          enrollment.auditMetrics.largePastes || 0,
        ),
        moduleDurationsSec: {
          ...(enrollment.auditMetrics.moduleDurationsSec || {}),
          ...auditRef.current.moduleDurationsSec,
        },
      };
    }
  }, [enrollment?.auditMetrics]);

  // Live Class Broadcast Announcement subscription (single lightweight doc)
  useEffect(() => {
    if (!user) {
      setActiveAnnouncement(null);
      return;
    }

    const annRef = doc(db, 'class_announcements', 'active');
    const unsubscribe = onSnapshot(
      annRef,
      (snap) => {
        if (!snap.exists()) {
          setActiveAnnouncement(null);
          return;
        }
        const d = snap.data() as Record<string, unknown>;
        const active = Boolean(d.active);
        const message = typeof d.message === 'string' ? d.message.trim() : '';
        const targetBatch =
          typeof d.targetBatch === 'string' && d.targetBatch.trim()
            ? d.targetBatch.trim()
            : 'ALL';
        const updatedAtMs =
          d.updatedAt instanceof Timestamp
            ? d.updatedAt.toMillis()
            : typeof d.updatedAtMs === 'number'
              ? d.updatedAtMs
              : Date.now();
        const id =
          typeof d.id === 'string' && d.id ? d.id : String(updatedAtMs);

        if (!active || !message) {
          setActiveAnnouncement(null);
          return;
        }

        // Filter by target batch (instructors always see active broadcast for confirmation)
        if (
          !isInstructor &&
          targetBatch !== 'ALL' &&
          lockedBatchNumber &&
          targetBatch !== lockedBatchNumber
        ) {
          setActiveAnnouncement(null);
          return;
        }

        setActiveAnnouncement({
          id,
          message,
          targetBatch,
          active: true,
          updatedBy: typeof d.updatedBy === 'string' ? d.updatedBy : undefined,
          updatedAtMs,
        });
      },
      () => {
        // Non-fatal if class_announcements rule not published yet
        setActiveAnnouncement(null);
      },
    );

    return () => unsubscribe();
  }, [isInstructor, lockedBatchNumber, user]);

  // Duplicate Tab / Session Conflict Guard via BroadcastChannel
  useEffect(() => {
    if (!user || isInstructor || typeof window === 'undefined') {
      setDuplicateTabDetected(false);
      return;
    }

    const tabId = tabInstanceIdRef.current;
    const uid = user.uid;

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('da101_session_guard');
      broadcastChannelRef.current = channel;

      channel.onmessage = (ev: MessageEvent) => {
        const msg = ev.data as { type?: string; uid?: string; tabId?: string };
        if (!msg || msg.uid !== uid || msg.tabId === tabId) return;

        if (msg.type === 'hello') {
          setDuplicateTabDetected(true);
          channel.postMessage({ type: 'ack', uid, tabId });
        } else if (msg.type === 'ack' || msg.type === 'claim') {
          setDuplicateTabDetected(true);
        }
      };

      channel.postMessage({ type: 'hello', uid, tabId });

      return () => {
        broadcastChannelRef.current = null;
        channel.close();
      };
    }

    return undefined;
  }, [isInstructor, user]);

  const dismissDuplicateTabWarning = useCallback(() => {
    setDuplicateTabDetected(false);
  }, []);

  const claimTabControl = useCallback(() => {
    setDuplicateTabDetected(false);
    if (broadcastChannelRef.current && user) {
      broadcastChannelRef.current.postMessage({
        type: 'claim',
        uid: user.uid,
        tabId: tabInstanceIdRef.current,
      });
    }
  }, [user]);

  // Passive Exam Integrity Audit Metrics: track tab leaves & active time inside labs
  useEffect(() => {
    if (!user || isInstructor || !hasAccess) return;

    const getVisibleLabModule = (): CurriculumModuleId | null => {
      if (typeof document === 'undefined') return null;
      const excelEl = document.getElementById('excelLabAppView');
      if (excelEl && !excelEl.classList.contains('hidden')) return 'excel';
      const worldEl = document.getElementById('labAppView');
      if (worldEl && !worldEl.classList.contains('hidden')) return 'sql_world';
      const ordEl = document.getElementById('orderingLabAppView');
      if (ordEl && !ordEl.classList.contains('hidden')) return 'sql_ordering';
      const movEl = document.getElementById('moviesLabAppView');
      if (movEl && !movEl.classList.contains('hidden')) return 'sql_movies';
      return null;
    };

    const tickInterval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const activeMod = getVisibleLabModule();
      const now = Date.now();
      if (activeMod) {
        const elapsedSec = Math.min(
          15,
          Math.max(1, Math.round((now - activeLabTickRef.current.lastTickMs) / 1000)),
        );
        const prev = auditRef.current.moduleDurationsSec[activeMod] || 0;
        auditRef.current.moduleDurationsSec[activeMod] = prev + elapsedSec;
      }
      activeLabTickRef.current = { moduleId: activeMod, lastTickMs: now };
    }, 10_000);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        const activeMod = getVisibleLabModule();
        if (activeMod) {
          auditRef.current.tabSwitches += 1;
          hasPendingProgressRef.current = true;
        }
      } else {
        activeLabTickRef.current.lastTickMs = Date.now();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(tickInterval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [hasAccess, isInstructor, user]);

  const recordLargePaste = useCallback(() => {
    if (!user || isInstructor || !hasAccess) return;
    auditRef.current.largePastes += 1;
    hasPendingProgressRef.current = true;
  }, [hasAccess, isInstructor, user]);

  // Graceful return to Home Practical Labs / Export view when time runs out inside an active lab
  useEffect(() => {
    if (isExpiredExportOnly && !wasExpiredExportRef.current) {
      wasExpiredExportRef.current = true;
      if (typeof window.goToHomeScreen === 'function') {
        window.goToHomeScreen(true);
      }
      if (typeof window.switchPortalTab === 'function') {
        window.switchPortalTab('activities');
      }
      if (typeof window.showNotification === 'function') {
        window.showNotification(
          'Class access time has ended. You can download your PDF and PNG results from the Home page.',
        );
      }
    } else if (!isExpiredExportOnly) {
      wasExpiredExportRef.current = false;
      if (hasAccess) {
        setShowCodeEntryFromExpired(false);
      }
    }
  }, [hasAccess, isExpiredExportOnly]);

  // Bind active UID to account-scoped localStorage and wipe in-memory state when switching/signing out
  useEffect(() => {
    const uid = user?.uid ?? null;
    clearLegacySharedProgressKeys();
    setActiveStorageUid(uid);
    lastProgressSyncJsonRef.current = '';
    lastScoreSyncJsonRef.current = '';
    hasHydratedCloudRef.current = false;
    hasPendingProgressRef.current = false;
    cloudMetaRef.current = { resetVersion: 0, moduleResetTimestamps: {} };
    handledResetTokensRef.current = {};

    isHydratingFromCloudRef.current = true;
    try {
      reloadAllVanillaModulesFromStorage();
    } finally {
      window.setTimeout(() => {
        isHydratingFromCloudRef.current = false;
      }, 80);
    }
  }, [user?.uid]);

  // Flush progress + scores to Firestore (student_progress/{uid} + enrollments/{uid}.moduleScores)
  const flushProgressToCloud = useCallback(
    async (force = false) => {
      if (!user) return;
      if (isHydratingFromCloudRef.current && !force) return;

      const canWriteStudent =
        !isInstructor &&
        Boolean(enrollment) &&
        hasAccess &&
        !isBlocked &&
        !isRevoked &&
        !isExpired;

      if (!isInstructor && !canWriteStudent) return;

      const modulesPayload: Partial<Record<CurriculumModuleId, CloudModuleProgress>> = {};
      let latestUpdatedAt = 0;

      for (const modId of ALL_MODULE_IDS) {
        const extracted = extractLocalModuleProgress(user.uid, modId);
        if (extracted) {
          modulesPayload[modId] = extracted;
          if (extracted.updatedAt > latestUpdatedAt) {
            latestUpdatedAt = extracted.updatedAt;
          }
        }
      }

      const summary = readCurriculumProgress();
      const moduleScores: Partial<Record<CurriculumModuleId, ModuleScoreSummary>> = {};
      for (const mod of summary.modules) {
        const existingCloudCompletedAt =
          enrollment?.moduleScores?.[mod.id]?.completedAt ?? null;
        const resolvedCompletedAt =
          mod.status === 'Completed'
            ? mod.completedAt ?? existingCloudCompletedAt ?? Date.now()
            : null;
        moduleScores[mod.id] = {
          passed: mod.passed,
          wrong: mod.wrong,
          attempted: mod.attempted,
          total: mod.total,
          percentage: mod.percentage,
          status: mod.status,
          completedAt: resolvedCompletedAt,
          wrongStepIds: mod.wrongIds.slice(0, 20),
        };
        if (modulesPayload[mod.id] && resolvedCompletedAt) {
          modulesPayload[mod.id]!.completedAt = resolvedCompletedAt;
        }
      }

      const auditSnapshot: AuditMetrics = {
        tabSwitches: auditRef.current.tabSwitches,
        largePastes: auditRef.current.largePastes,
        moduleDurationsSec: { ...auditRef.current.moduleDurationsSec },
      };

      const progressFingerprint = JSON.stringify(modulesPayload);
      const scoresFingerprint = JSON.stringify({ moduleScores, auditSnapshot });

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        hasPendingProgressRef.current = true;
        setHasPendingSync(true);
        return;
      }

      const writes: Promise<unknown>[] = [];
      let hadWriteFailure = false;

      if (
        (force || progressFingerprint !== lastProgressSyncJsonRef.current) &&
        Object.keys(modulesPayload).length > 0
      ) {
        writes.push(
          setDoc(
            doc(db, 'student_progress', user.uid),
            {
              uid: user.uid,
              updatedAt: latestUpdatedAt || Date.now(),
              lastSyncedAt: serverTimestamp(),
              resetVersion: cloudMetaRef.current.resetVersion,
              moduleResetTimestamps: cloudMetaRef.current.moduleResetTimestamps,
              modules: modulesPayload,
            },
            { merge: true },
          )
            .then(() => {
              lastProgressSyncJsonRef.current = progressFingerprint;
            })
            .catch(() => {
              hadWriteFailure = true;
            }),
        );
      }

      if (
        canWriteStudent &&
        (force || scoresFingerprint !== lastScoreSyncJsonRef.current)
      ) {
        writes.push(
          setDoc(
            doc(db, 'enrollments', user.uid),
            {
              uid: user.uid,
              moduleScores,
              auditMetrics: auditSnapshot,
              lastActiveAt: serverTimestamp(),
            },
            { merge: true },
          )
            .then(() => {
              lastScoreSyncJsonRef.current = scoresFingerprint;
            })
            .catch(() => {
              hadWriteFailure = true;
            }),
        );
      }

      if (writes.length > 0) {
        await Promise.allSettled(writes);
      }

      if (hadWriteFailure) {
        hasPendingProgressRef.current = true;
        setHasPendingSync(true);
      } else {
        hasPendingProgressRef.current = false;
        setHasPendingSync(false);
      }
    },
    [enrollment, hasAccess, isBlocked, isExpired, isInstructor, isRevoked, user],
  );

  // Offline / Online Connectivity Listener + Automatic Reconnect Flush
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let reconnectBannerTimer: number | undefined;

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      if (hasPendingProgressRef.current) {
        void flushProgressToCloud(true).then(() => {
          setJustReconnected(true);
          if (reconnectBannerTimer) window.clearTimeout(reconnectBannerTimer);
          reconnectBannerTimer = window.setTimeout(() => {
            setJustReconnected(false);
          }, 4200);
        });
      } else {
        setJustReconnected(true);
        if (reconnectBannerTimer) window.clearTimeout(reconnectBannerTimer);
        reconnectBannerTimer = window.setTimeout(() => {
          setJustReconnected(false);
        }, 3200);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      if (reconnectBannerTimer) window.clearTimeout(reconnectBannerTimer);
    };
  }, [flushProgressToCloud]);

  // Real-time cloud progress hydration ("cloud wins if newer") + live Instructor Retake/Reset listener
  useEffect(() => {
    if (!user) return;

    const progressRef = doc(db, 'student_progress', user.uid);
    const unsubscribe = onSnapshot(
      progressRef,
      (snap) => {
        if (!snap.exists()) {
          hasHydratedCloudRef.current = true;
          return;
        }

        const cloudDoc = snap.data() as CloudProgressDocument;
        const resetVersion =
          typeof cloudDoc.resetVersion === 'number' ? cloudDoc.resetVersion : 0;
        const moduleResetTimestamps =
          cloudDoc.moduleResetTimestamps &&
          typeof cloudDoc.moduleResetTimestamps === 'object'
            ? cloudDoc.moduleResetTimestamps
            : {};

        cloudMetaRef.current = {
          resetVersion,
          moduleResetTimestamps,
        };

        let didMutateLocal = false;
        const newlyResetModules: CurriculumModuleId[] = [];

        for (const modId of ALL_MODULE_IDS) {
          const localMod = extractLocalModuleProgress(user.uid, modId);
          const localUpdatedAt = localMod?.updatedAt ?? 0;
          const resetTs =
            typeof moduleResetTimestamps[modId] === 'number'
              ? moduleResetTimestamps[modId]!
              : 0;
          const cloudMod = cloudDoc.modules?.[modId];

          if (
            resetTs > 0 &&
            resetTs >= localUpdatedAt &&
            (!cloudMod || (cloudMod.updatedAt ?? 0) <= resetTs)
          ) {
            if (localMod || handledResetTokensRef.current[modId] !== resetTs) {
              clearAccountModuleLocalState(user.uid, modId);
              if (
                hasHydratedCloudRef.current &&
                handledResetTokensRef.current[modId] !== resetTs
              ) {
                newlyResetModules.push(modId);
              }
              handledResetTokensRef.current[modId] = resetTs;
              didMutateLocal = true;
            }
            continue;
          }

          if (cloudMod && (cloudMod.updatedAt ?? 0) > localUpdatedAt) {
            applyCloudModuleToLocalStorage(user.uid, modId, cloudMod);
            didMutateLocal = true;
          }
        }

        if (didMutateLocal) {
          isHydratingFromCloudRef.current = true;
          try {
            reloadAllVanillaModulesFromStorage();
          } finally {
            window.setTimeout(() => {
              isHydratingFromCloudRef.current = false;
            }, 120);
          }

          if (
            newlyResetModules.length > 0 &&
            typeof window.showNotification === 'function'
          ) {
            const labels = newlyResetModules
              .map(
                (id) =>
                  MODULE_DEFINITIONS.find((m) => m.id === id)?.shortLabel || id,
              )
              .join(', ');
            window.showNotification(
              `Your instructor reset ${labels} for a fresh retake.`,
            );
          }
        }

        hasHydratedCloudRef.current = true;
      },
      () => {
        hasHydratedCloudRef.current = true;
      },
    );

    return () => unsubscribe();
  }, [user]);

  // Spark-friendly write cadence: immediate (400ms coalesced) on submit + 5s debounce on other changes + flush on hide
  useEffect(() => {
    if (!user) return;
    if (!isInstructor && (!enrollment || !hasAccess || isBlocked || isRevoked || isExpired)) {
      return;
    }

    let debounceTimer: number | undefined;
    let submitTimer: number | undefined;

    const scheduleDebouncedSync = () => {
      if (isHydratingFromCloudRef.current) return;
      hasPendingProgressRef.current = true;
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        void flushProgressToCloud(false);
      }, 5000);
    };

    const scheduleSubmitSync = () => {
      if (isHydratingFromCloudRef.current) return;
      hasPendingProgressRef.current = true;
      if (debounceTimer) window.clearTimeout(debounceTimer);
      if (submitTimer) window.clearTimeout(submitTimer);
      submitTimer = window.setTimeout(() => {
        void flushProgressToCloud(false);
      }, 400);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasPendingProgressRef.current) {
        if (debounceTimer) window.clearTimeout(debounceTimer);
        if (submitTimer) window.clearTimeout(submitTimer);
        void flushProgressToCloud(false);
      }
    };

    window.addEventListener('curriculumprogresschange', scheduleDebouncedSync);
    window.addEventListener('da101progresssubmit', scheduleSubmitSync);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      if (submitTimer) window.clearTimeout(submitTimer);
      window.removeEventListener('curriculumprogresschange', scheduleDebouncedSync);
      window.removeEventListener('da101progresssubmit', scheduleSubmitSync);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    enrollment,
    flushProgressToCloud,
    hasAccess,
    isBlocked,
    isExpired,
    isInstructor,
    isRevoked,
    user,
  ]);

  // Sync access state + locked identity (First/Middle/Last/Batch) into vanilla DOM & localStorage
  useEffect(() => {
    const profileLocked = !isInstructor && Boolean(enrollment?.profileLocked);
    const resolvedFirstName =
      profileLocked && enrollment?.firstName
        ? enrollment.firstName
        : isInstructor
          ? user?.displayName?.trim() || 'Instructor'
          : null;
    const resolvedMiddleName =
      profileLocked && enrollment
        ? enrollment.noMiddleName
          ? ''
          : enrollment.middleName || ''
        : null;
    const resolvedLastName =
      profileLocked && enrollment?.lastName ? enrollment.lastName : null;
    const resolvedFullName =
      profileLocked && enrollment
        ? enrollment.fullName ||
          formatFullName(
            enrollment.firstName || '',
            enrollment.noMiddleName ? '' : enrollment.middleName || '',
            enrollment.lastName || '',
          )
        : isInstructor
          ? user?.displayName?.trim() || 'Instructor'
          : null;

    const snapshot: GlobalAccessSnapshot = {
      isAuthenticated: Boolean(user),
      isInstructor,
      hasAccess,
      isExpiredExportOnly,
      isBlocked,
      isRevoked,
      profileLocked,
      examMode,
      firstName: resolvedFirstName,
      middleName: resolvedMiddleName,
      lastName: resolvedLastName,
      fullName: resolvedFullName,
      batchNumber: lockedBatchNumber,
      allowedModules,
      expiresAtMs,
      code: enrollment?.code ?? null,
    };

    window.__DA101_ACCESS__ = snapshot;

    // Toggle Exam Mode class on <html> so hint buttons hide cleanly in Graded Exam Mode
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle(
        'da-exam-mode',
        !isInstructor && examMode === 'exam',
      );
    }

    // Expose tamper-evident verification code generator for all 4 PDF/PNG certificate exporters
    window.getModuleVerificationCode = (moduleId: CurriculumModuleId) => {
      const summary = readCurriculumProgress();
      const mod = summary.modules.find((m) => m.id === moduleId);
      const passed = mod?.passed ?? 0;
      const total = mod?.total ?? 10;
      const completedAt =
        mod?.completedAt ?? enrollment?.moduleScores?.[moduleId]?.completedAt ?? null;
      return computeVerificationCode({
        uid: user?.uid || 'guest',
        batchNumber: lockedBatchNumber || enrollment?.batchNumber || 'NA',
        moduleId,
        passed,
        total,
        completedAt,
      });
    };

    if (profileLocked && enrollment) {
      const f = enrollment.firstName || '';
      const m = enrollment.noMiddleName ? '' : enrollment.middleName || '';
      const l = enrollment.lastName || '';
      const b = enrollment.batchNumber || '';

      try {
        localStorage.setItem('studentFirstName', f);
        localStorage.setItem('studentMiddleName', m);
        localStorage.setItem('studentLastName', l);
        localStorage.setItem('studentBatch', b);
      } catch {
        // Ignore storage errors
      }
    } else if (lockedBatchNumber) {
      try {
        localStorage.setItem('studentBatch', lockedBatchNumber);
      } catch {
        // Ignore storage errors
      }
    }

    if (typeof window.updateDateAndTimeBadges === 'function') {
      window.updateDateAndTimeBadges();
    }
    if (typeof window.updateExcelCompletionCard === 'function') {
      window.updateExcelCompletionCard();
    }
    if (typeof window.renderOrderingLeftPane === 'function') {
      window.renderOrderingLeftPane();
    }

    if (typeof window.applyAccessRestrictionsToDOM === 'function') {
      window.applyAccessRestrictionsToDOM(snapshot);
    }

    if (
      hasAccess &&
      allowedModules.length > 0 &&
      typeof window.getCurrentCurriculumModule === 'function' &&
      typeof window.selectCurriculumModule === 'function'
    ) {
      const currentMod = window.getCurrentCurriculumModule();
      if (!allowedModules.includes(currentMod)) {
        window.selectCurriculumModule(allowedModules[0]);
      }
    }

    try {
      window.dispatchEvent(
        new CustomEvent('da101accesschange', { detail: snapshot }),
      );
    } catch {
      // Ignore event errors
    }
  }, [
    allowedModules,
    enrollment,
    examMode,
    expiresAtMs,
    hasAccess,
    isBlocked,
    isExpiredExportOnly,
    isInstructor,
    isRevoked,
    lockedBatchNumber,
    user,
  ]);

  const signInWithGoogle = useCallback(async (forInstructor = false) => {
    setAuthError(null);
    setRedeemError(null);
    setProfileError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedInUser = result.user;

      if (!isGmailEmail(signedInUser.email)) {
        await firebaseSignOut(auth);
        setAuthError(NON_GMAIL_ERROR);
        return;
      }

      if (forInstructor) {
        if (isInstructorEmail(signedInUser.email)) {
          setInstructorPanelOpen(true);
        } else {
          setAuthError(
            `Instructor access is restricted to ${INSTRUCTOR_EMAIL}. Signed in as ${signedInUser.email || 'student account'}.`,
          );
        }
      }
    } catch (error) {
      const code = (error as { code?: string })?.code || '';
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      if (code === 'auth/unauthorized-domain') {
        setAuthError(
          'This domain is not yet authorized in Firebase Auth. Add this domain under Firebase Console → Authentication → Settings → Authorized domains.',
        );
        return;
      }
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Google sign-in failed. Please try again.',
      );
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    setRedeemError(null);
    setProfileError(null);
    setInstructorPanelOpen(false);
    setSignOutConfirmOpen(false);
    setShowCodeEntryFromExpired(false);

    // Flush any unsaved account progress to Firestore BEFORE signing out
    try {
      await flushProgressToCloud(true);
    } catch {
      // Proceed with sign-out even if offline
    }

    // Return to Home screen and wipe active lab state so next account on this device starts clean
    if (typeof window.goToHomeScreen === 'function') {
      window.goToHomeScreen(true);
    }
    setActiveStorageUid(null);
    clearLegacySharedProgressKeys();
    isHydratingFromCloudRef.current = true;
    try {
      reloadAllVanillaModulesFromStorage();
    } finally {
      window.setTimeout(() => {
        isHydratingFromCloudRef.current = false;
      }, 80);
    }

    await firebaseSignOut(auth);
  }, [flushProgressToCloud]);

  const requestSignOut = useCallback(() => {
    setSignOutConfirmOpen(true);
  }, []);

  const cancelSignOut = useCallback(() => {
    setSignOutConfirmOpen(false);
  }, []);

  const confirmSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const redeemClassCode = useCallback(
    async (rawCode: string): Promise<boolean> => {
      if (!user) {
        setRedeemError('Please sign in with Google first.');
        return false;
      }

      if (isBlocked) {
        setRedeemError(
          'This account has been blocked. Please contact your instructor.',
        );
        return false;
      }

      const code = sanitizeClassCode(rawCode);
      if (code.length < 3) {
        setRedeemError(
          'Enter a valid class access code (at least 3 characters).',
        );
        return false;
      }

      setRedeeming(true);
      setRedeemError(null);

      const codePath = `class_codes/${code}`;
      const enrollmentPath = `enrollments/${user.uid}`;

      try {
        const codeSnap = await getDocFromServer(doc(db, 'class_codes', code));
        if (!codeSnap.exists()) {
          setRedeemError(
            'Class code not found. Double-check the code with your instructor.',
          );
          return false;
        }

        const data = codeSnap.data() as Partial<ClassCodeRecord>;
        const startsAt =
          data.startsAt instanceof Timestamp ? data.startsAt : null;
        const expiresAt =
          data.expiresAt instanceof Timestamp ? data.expiresAt : null;
        const allowedModules = normalizeAllowedModules(data.allowedModules);
        const batchNumber = String(data.batchNumber || '').trim();

        if (!data.active) {
          setRedeemError('This class code has been revoked by the instructor.');
          return false;
        }

        const now = Date.now();
        if (startsAt && now < startsAt.toMillis()) {
          setRedeemError(
            `This class code is scheduled to open on ${startsAt.toDate().toLocaleString()}.`,
          );
          return false;
        }

        if (!expiresAt || now > expiresAt.toMillis()) {
          setRedeemError(
            'This class code has expired. Please request a new code from your instructor.',
          );
          return false;
        }

        if (allowedModules.length === 0) {
          setRedeemError('This class code has no modules enabled.');
          return false;
        }

        const payload: Record<string, unknown> = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          code,
          batchNumber,
          allowedModules,
          examMode: data.examMode === 'exam' ? 'exam' : 'practice',
          startsAt: startsAt ?? Timestamp.now(),
          expiresAt,
          activatedAt: enrollment?.activatedAt ?? serverTimestamp(),
        };

        if (!enrollment) {
          payload.blocked = false;
          payload.revoked = false;
          payload.flaggedDuplicate = false;
          payload.profileLocked = false;
        }

        try {
          await setDoc(doc(db, 'enrollments', user.uid), payload, {
            merge: true,
          });
        } catch (writeErr) {
          const info = buildFirestoreErrorInfo(
            writeErr,
            OperationType.WRITE,
            enrollmentPath,
          );
          console.error('Firestore Error: ', JSON.stringify(info));
          setRedeemError(
            'Unable to save enrollment. Please verify the latest Firestore rules are published.',
          );
          return false;
        }

        setCodeRevoked(false);
        setShowCodeEntryFromExpired(false);
        setUrlCode('');
        clearUrlCodeParam();
        return true;
      } catch (error) {
        const info = buildFirestoreErrorInfo(error, OperationType.GET, codePath);
        console.error('Firestore Error: ', JSON.stringify(info));
        const msg = error instanceof Error ? error.message : String(error);
        if (
          msg.includes('permission-denied') ||
          msg.includes('Missing or insufficient permissions')
        ) {
          setRedeemError(
            'This class code is invalid, inactive, or outside its active time window.',
          );
        } else {
          setRedeemError(
            'Could not verify class code. Check your internet connection and try again.',
          );
        }
        return false;
      } finally {
        setRedeeming(false);
      }
    },
    [enrollment, isBlocked, user],
  );

  const completeStudentProfile = useCallback(
    async (
      input: ProfileRegistrationInput,
    ): Promise<{ ok: boolean; duplicate?: boolean }> => {
      if (!user || !enrollment) {
        setProfileError('Your session expired. Please refresh and sign in again.');
        return { ok: false };
      }

      const firstName = cleanNameField(input.firstName);
      const middleName = input.noMiddleName
        ? ''
        : cleanNameField(input.middleName);
      const lastName = cleanNameField(input.lastName);

      if (firstName.length < 1) {
        setProfileError('Please enter your First Name.');
        return { ok: false };
      }
      if (!input.noMiddleName && middleName.length < 1) {
        setProfileError(
          'Please enter your Middle Name, or check "I do not have a middle name".',
        );
        return { ok: false };
      }
      if (lastName.length < 1) {
        setProfileError('Please enter your Last Name.');
        return { ok: false };
      }

      const fullName = formatFullName(firstName, middleName, lastName);
      const identityKey = buildStudentIdentityKey(
        firstName,
        middleName,
        lastName,
        enrollment.batchNumber,
      );

      setSavingProfile(true);
      setProfileError(null);

      const identityRef = doc(db, 'student_identities', identityKey);
      const enrollmentRef = doc(db, 'enrollments', user.uid);

      const flagAndBlockDuplicate = async (ownerUid?: string) => {
        try {
          await setDoc(
            enrollmentRef,
            {
              uid: user.uid,
              firstName,
              middleName,
              noMiddleName: input.noMiddleName,
              lastName,
              fullName,
              identityKey,
              blocked: true,
              flaggedDuplicate: true,
              duplicateOfUid: ownerUid || 'existing_student',
              flaggedAt: serverTimestamp(),
            },
            { merge: true },
          );
        } catch (err) {
          const info = buildFirestoreErrorInfo(
            err,
            OperationType.UPDATE,
            `enrollments/${user.uid}`,
          );
          console.error('Firestore Error: ', JSON.stringify(info));
        }
      };

      try {
        const existingSnap = await getDocFromServer(identityRef);

        if (existingSnap.exists()) {
          const existingData = existingSnap.data() as { ownerUid?: string };
          if (existingData.ownerUid && existingData.ownerUid !== user.uid) {
            await flagAndBlockDuplicate(existingData.ownerUid);
            return { ok: false, duplicate: true };
          }
        } else {
          try {
            await setDoc(identityRef, {
              identityKey,
              ownerUid: user.uid,
              email: user.email || '',
              fullName,
              batchNumber: enrollment.batchNumber,
              createdAt: serverTimestamp(),
            });
          } catch (claimErr) {
            const msg =
              claimErr instanceof Error ? claimErr.message : String(claimErr);
            if (
              msg.includes('permission-denied') ||
              msg.includes('Missing or insufficient permissions')
            ) {
              // Concurrent duplicate claim caught by Firestore rules
              await flagAndBlockDuplicate();
              return { ok: false, duplicate: true };
            }
            throw claimErr;
          }
        }

        await setDoc(
          enrollmentRef,
          {
            uid: user.uid,
            firstName,
            middleName,
            noMiddleName: input.noMiddleName,
            lastName,
            fullName,
            identityKey,
            profileLocked: true,
            profileRegisteredAt: serverTimestamp(),
          },
          { merge: true },
        );

        return { ok: true };
      } catch (error) {
        const info = buildFirestoreErrorInfo(
          error,
          OperationType.WRITE,
          `student_identities/${identityKey}`,
        );
        console.error('Firestore Error: ', JSON.stringify(info));
        setProfileError(
          'Could not save your registration details. Please confirm your internet connection and that updated Firestore rules are published.',
        );
        return { ok: false };
      } finally {
        setSavingProfile(false);
      }
    },
    [enrollment, user],
  );

  const refreshEnrollment = useCallback(async () => {
    if (user && enrollment) {
      await verifyClassCodeLive(user, enrollment);
    }
  }, [enrollment, user, verifyClassCodeLive]);

  const clearErrors = useCallback(() => {
    setAuthError(null);
    setRedeemError(null);
    setProfileError(null);
  }, []);

  const value = useMemo<AccessContextValue>(
    () => ({
      user,
      authLoading,
      enrollmentLoading,
      isInstructor,
      hasAccess,
      isBlocked,
      isRevoked,
      isExpired,
      needsProfileRegistration,
      isExpiredExportOnly,
      examMode,
      showCodeEntryFromExpired,
      setShowCodeEntryFromExpired,
      enrollment,
      allowedModules,
      lockedBatchNumber,
      expiresAtMs,
      nowMs,
      urlCode,
      authError,
      redeemError,
      redeeming,
      profileError,
      savingProfile,
      instructorPanelOpen,
      setInstructorPanelOpen,
      signOutConfirmOpen,
      requestSignOut,
      cancelSignOut,
      confirmSignOut,
      signInWithGoogle,
      signOut,
      redeemClassCode,
      completeStudentProfile,
      refreshEnrollment,
      clearErrors,
      isOnline,
      hasPendingSync,
      justReconnected,
      duplicateTabDetected,
      dismissDuplicateTabWarning,
      claimTabControl,
      activeAnnouncement,
      recordLargePaste,
    }),
    [
      activeAnnouncement,
      allowedModules,
      authError,
      authLoading,
      cancelSignOut,
      claimTabControl,
      clearErrors,
      completeStudentProfile,
      confirmSignOut,
      dismissDuplicateTabWarning,
      duplicateTabDetected,
      enrollment,
      enrollmentLoading,
      examMode,
      expiresAtMs,
      hasAccess,
      hasPendingSync,
      instructorPanelOpen,
      isBlocked,
      isExpired,
      isExpiredExportOnly,
      isInstructor,
      isOnline,
      isRevoked,
      justReconnected,
      lockedBatchNumber,
      needsProfileRegistration,
      nowMs,
      profileError,
      recordLargePaste,
      redeemClassCode,
      redeemError,
      redeeming,
      refreshEnrollment,
      requestSignOut,
      savingProfile,
      showCodeEntryFromExpired,
      signInWithGoogle,
      signOut,
      signOutConfirmOpen,
      urlCode,
      user,
    ],
  );

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}

export function useAccess(): AccessContextValue {
  const ctx = useContext(AccessContext);
  if (!ctx) {
    throw new Error('useAccess must be used within an AccessProvider');
  }
  return ctx;
}
