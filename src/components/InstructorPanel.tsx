import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import {
  buildFirestoreErrorInfo,
  db,
  INSTRUCTOR_EMAIL,
  OperationType,
} from '../firebase';
import {
  ALL_MODULE_IDS,
  sanitizeClassCode,
  useAccess,
  type ClassCodeRecord,
  type EnrollmentRecord,
} from '../context/AccessContext';
import {
  MODULE_DEFINITIONS,
  type CurriculumModuleId,
} from '../utils/curriculumProgress';
import {
  buildStudentIdentityKey,
  cleanNameField,
  formatFullName,
} from '../utils/identity';
import {
  M3_BACKDROP_MOTION,
  M3_MODAL_MOTION,
  M3_SPRING_EXPRESSIVE_BOUNCE,
  M3_SPRING_FAST_SPATIAL,
  M3_TAP_PRESS,
} from '../utils/m3Motion';

function formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function generateSuggestedCode(batchNumber: string): string {
  const cleanBatch = batchNumber.replace(/[^0-9A-Z]/gi, '').toUpperCase() || '1';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BATCH${cleanBatch}-${suffix}`;
}

function formatRemaining(expiresAtMs: number, nowMs: number): string {
  const diff = expiresAtMs - nowMs;
  if (diff <= 0) return 'Expired';
  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${Math.max(1, minutes)}m left`;
}

function escapeCsvCell(raw: unknown): string {
  let text = raw === null || raw === undefined ? '' : String(raw);
  // Neutralize spreadsheet formula injection (CWE-1236)
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatCompletionTimestamp(ms?: number | null): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) return '';
  return new Date(ms).toLocaleString();
}

function formatCompletionShort(ms?: number | null): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) return '';
  const d = new Date(ms);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type StudentStatusKind =
  | 'Flagged · Duplicate'
  | 'Blocked'
  | 'Revoked'
  | 'Expired'
  | 'Pending Profile'
  | 'Active';

function getStudentEffectiveExpiryMs(student: EnrollmentRecord): number {
  if (student.customExpiresAt) {
    return student.customExpiresAt.toMillis();
  }
  return student.expiresAt.toMillis();
}

function getStudentStatus(
  student: EnrollmentRecord,
  nowMs: number,
): StudentStatusKind {
  if (student.flaggedDuplicate && student.blocked) return 'Flagged · Duplicate';
  if (student.blocked) return 'Blocked';
  if (student.revoked) return 'Revoked';
  if (nowMs > getStudentEffectiveExpiryMs(student)) return 'Expired';
  if (!student.profileLocked) return 'Pending Profile';
  return 'Active';
}

function parseClassCodeSnapshot(
  snapshot: QuerySnapshot<DocumentData>,
): ClassCodeRecord[] {
  const rows: ClassCodeRecord[] = [];
  snapshot.forEach((docSnap) => {
    const d = docSnap.data() as Partial<ClassCodeRecord>;
    if (d.startsAt instanceof Timestamp && d.expiresAt instanceof Timestamp) {
      rows.push({
        code: docSnap.id,
        batchNumber: String(d.batchNumber || ''),
        allowedModules: Array.isArray(d.allowedModules)
          ? (d.allowedModules as CurriculumModuleId[])
          : [],
        startsAt: d.startsAt,
        expiresAt: d.expiresAt,
        active: Boolean(d.active),
        createdBy: d.createdBy,
        createdAt: d.createdAt instanceof Timestamp ? d.createdAt : undefined,
      });
    }
  });
  rows.sort(
    (a, b) =>
      (b.createdAt?.toMillis() ?? b.startsAt.toMillis()) -
      (a.createdAt?.toMillis() ?? a.startsAt.toMillis()),
  );
  return rows;
}

function parseEnrollmentSnapshot(
  snapshot: QuerySnapshot<DocumentData>,
): EnrollmentRecord[] {
  const rows: EnrollmentRecord[] = [];
  snapshot.forEach((docSnap) => {
    const d = docSnap.data() as Partial<EnrollmentRecord>;
    if (d.expiresAt instanceof Timestamp) {
      rows.push({
        uid: docSnap.id,
        email: String(d.email || ''),
        displayName: String(d.displayName || ''),
        code: String(d.code || ''),
        batchNumber: String(d.batchNumber || ''),
        allowedModules: Array.isArray(d.allowedModules)
          ? (d.allowedModules as CurriculumModuleId[])
          : [],
        startsAt: d.startsAt instanceof Timestamp ? d.startsAt : undefined,
        expiresAt: d.expiresAt,
        customExpiresAt:
          d.customExpiresAt instanceof Timestamp ? d.customExpiresAt : null,
        activatedAt:
          d.activatedAt instanceof Timestamp ? d.activatedAt : undefined,
        firstName: typeof d.firstName === 'string' ? d.firstName : undefined,
        middleName: typeof d.middleName === 'string' ? d.middleName : undefined,
        noMiddleName: Boolean(d.noMiddleName),
        lastName: typeof d.lastName === 'string' ? d.lastName : undefined,
        fullName: typeof d.fullName === 'string' ? d.fullName : undefined,
        profileLocked: Boolean(d.profileLocked),
        identityKey:
          typeof d.identityKey === 'string' ? d.identityKey : undefined,
        revoked: Boolean(d.revoked),
        blocked: Boolean(d.blocked),
        flaggedDuplicate: Boolean(d.flaggedDuplicate),
        duplicateOfUid:
          typeof d.duplicateOfUid === 'string' ? d.duplicateOfUid : undefined,
        flaggedAt: d.flaggedAt instanceof Timestamp ? d.flaggedAt : undefined,
        moduleScores: d.moduleScores,
      });
    }
  });
  // Sort flagged/blocked to top, then most recently activated
  rows.sort((a, b) => {
    const aFlag = a.flaggedDuplicate && a.blocked ? 1 : 0;
    const bFlag = b.flaggedDuplicate && b.blocked ? 1 : 0;
    if (aFlag !== bFlag) return bFlag - aFlag;
    const aTime = a.activatedAt?.toMillis() ?? 0;
    const bTime = b.activatedAt?.toMillis() ?? 0;
    return bTime - aTime;
  });
  return rows;
}

type DeleteTarget =
  | { kind: 'student'; student: EnrollmentRecord }
  | { kind: 'code'; codeRecord: ClassCodeRecord }
  | { kind: 'batch'; batchNumber: string };

type TimeEditTarget =
  | { kind: 'code'; codeRecord: ClassCodeRecord }
  | { kind: 'student'; student: EnrollmentRecord };

async function deleteStudentRecords(student: EnrollmentRecord) {
  const tasks: Promise<unknown>[] = [
    deleteDoc(doc(db, 'enrollments', student.uid)),
    deleteDoc(doc(db, 'student_progress', student.uid)).catch(() => {
      // Progress doc may not exist yet
    }),
  ];

  // Safely release identity lock ONLY if this student actually owns that identity key
  if (student.identityKey) {
    tasks.push(
      (async () => {
        try {
          const idRef = doc(db, 'student_identities', student.identityKey!);
          const snap = await getDoc(idRef);
          if (snap.exists()) {
            const data = snap.data() as { ownerUid?: string };
            if (!data.ownerUid || data.ownerUid === student.uid) {
              await deleteDoc(idRef);
            }
          }
        } catch {
          // Ignore identity cleanup failure if doc already removed
        }
      })(),
    );
  }

  await Promise.all(tasks);
}

export function InstructorPanel() {
  const {
    user,
    isInstructor,
    instructorPanelOpen,
    setInstructorPanelOpen,
    nowMs,
  } = useAccess();

  const [activeTab, setActiveTab] = useState<'codes' | 'students'>('codes');

  // Class codes state
  const [codes, setCodes] = useState<ClassCodeRecord[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [panelSuccess, setPanelSuccess] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [busyCode, setBusyCode] = useState<string | null>(null);

  // Create code form state
  const [batchNumber, setBatchNumber] = useState('101');
  const [codeInput, setCodeInput] = useState(() => generateSuggestedCode('101'));
  const [startsAtInput, setStartsAtInput] = useState(() =>
    formatDateTimeLocal(new Date()),
  );
  const [durationValue, setDurationValue] = useState('24');
  const [durationUnit, setDurationUnit] = useState<'hours' | 'days'>('hours');
  const [selectedModules, setSelectedModules] =
    useState<CurriculumModuleId[]>(ALL_MODULE_IDS);
  const [creating, setCreating] = useState(false);

  // Registered students state
  const [students, setStudents] = useState<EnrollmentRecord[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [busyStudentUid, setBusyStudentUid] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Instructor edit/override modal state (name/batch)
  const [editingStudent, setEditingStudent] = useState<EnrollmentRecord | null>(
    null,
  );
  const [editFirstName, setEditFirstName] = useState('');
  const [editMiddleName, setEditMiddleName] = useState('');
  const [editNoMiddleName, setEditNoMiddleName] = useState(false);
  const [editLastName, setEditLastName] = useState('');
  const [editBatchNumber, setEditBatchNumber] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Instructor Edit Time (date/time picker) modal state
  const [timeEditTarget, setTimeEditTarget] = useState<TimeEditTarget | null>(
    null,
  );
  const [editStartDateTime, setEditStartDateTime] = useState('');
  const [editEndDateTime, setEditEndDateTime] = useState('');
  const [savingTime, setSavingTime] = useState(false);
  const [timeEditError, setTimeEditError] = useState<string | null>(null);

  // Instructor reset module / retake modal state
  const [resetTargetStudent, setResetTargetStudent] =
    useState<EnrollmentRecord | null>(null);
  const [resettingModuleKey, setResettingModuleKey] = useState<string | null>(
    null,
  );

  // Instructor delete user / code / batch confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Manual server-side refresh for students & class codes
  const handleManualRefresh = useCallback(async () => {
    if (!isInstructor || refreshing) return;
    setRefreshing(true);
    setPanelError(null);
    try {
      const fetchCollection = async (name: string) => {
        const colRef = collection(db, name);
        try {
          return await getDocsFromServer(colRef);
        } catch {
          return await getDocs(colRef);
        }
      };

      const [codesSnap, studentsSnap] = await Promise.all([
        fetchCollection('class_codes'),
        fetchCollection('enrollments'),
      ]);

      setCodes(parseClassCodeSnapshot(codesSnap));
      setStudents(parseEnrollmentSnapshot(studentsSnap));
      setLastSyncedAt(new Date());
      setLoadingCodes(false);
      setLoadingStudents(false);
    } catch (error) {
      const info = buildFirestoreErrorInfo(
        error,
        OperationType.LIST,
        'enrollments',
      );
      console.error('Firestore Error: ', JSON.stringify(info));
      setPanelError(
        'Could not refresh from Firestore. Check your connection and try again.',
      );
    } finally {
      setRefreshing(false);
    }
  }, [isInstructor, refreshing]);

  // Subscribe to class_codes (sorted client-side to require zero composite indexes)
  useEffect(() => {
    if (!instructorPanelOpen || !isInstructor) return;

    setLoadingCodes(true);
    setPanelError(null);

    const unsubscribe = onSnapshot(
      collection(db, 'class_codes'),
      (snapshot) => {
        setCodes(parseClassCodeSnapshot(snapshot));
        setLastSyncedAt(new Date());
        setLoadingCodes(false);
      },
      (error) => {
        const info = buildFirestoreErrorInfo(
          error,
          OperationType.LIST,
          'class_codes',
        );
        console.error('Firestore Error: ', JSON.stringify(info));
        setPanelError(
          'Unable to load class codes. Confirm Firestore rules allow instructor access to class_codes.',
        );
        setLoadingCodes(false);
      },
    );

    return () => unsubscribe();
  }, [instructorPanelOpen, isInstructor]);

  // Subscribe to enrollments (sorted client-side to require zero composite indexes)
  useEffect(() => {
    if (!instructorPanelOpen || !isInstructor) return;

    setLoadingStudents(true);
    const unsubscribe = onSnapshot(
      collection(db, 'enrollments'),
      (snapshot) => {
        setStudents(parseEnrollmentSnapshot(snapshot));
        setLastSyncedAt(new Date());
        setLoadingStudents(false);
      },
      (error) => {
        const info = buildFirestoreErrorInfo(
          error,
          OperationType.LIST,
          'enrollments',
        );
        console.error('Firestore Error: ', JSON.stringify(info));
        setLoadingStudents(false);
      },
    );

    return () => unsubscribe();
  }, [instructorPanelOpen, isInstructor]);

  const distinctBatches = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.batchNumber) set.add(s.batchNumber);
    });
    codes.forEach((c) => {
      if (c.batchNumber) set.add(c.batchNumber);
    });
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }, [codes, students]);

  // Reset batchFilter if selected batch was just deleted
  useEffect(() => {
    if (batchFilter !== 'ALL' && !distinctBatches.includes(batchFilter)) {
      setBatchFilter('ALL');
    }
  }, [batchFilter, distinctBatches]);

  const flaggedCount = useMemo(
    () => students.filter((s) => s.flaggedDuplicate && s.blocked).length,
    [students],
  );

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter((s) => {
      if (batchFilter !== 'ALL' && s.batchNumber !== batchFilter) return false;
      const status = getStudentStatus(s, nowMs);
      if (statusFilter !== 'ALL' && status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        s.fullName,
        s.firstName,
        s.middleName,
        s.lastName,
        s.displayName,
        s.email,
        s.batchNumber,
        s.code,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [batchFilter, nowMs, statusFilter, studentSearch, students]);

  const hasSubModalOpen = Boolean(
    editingStudent || timeEditTarget || resetTargetStudent || deleteTarget,
  );

  const toggleModule = (modId: CurriculumModuleId) => {
    setSelectedModules((prev) =>
      prev.includes(modId)
        ? prev.filter((id) => id !== modId)
        : [...prev, modId],
    );
  };

  const applyPreset = (val: number, unit: 'hours' | 'days') => {
    setDurationValue(String(val));
    setDurationUnit(unit);
  };

  const handleCreateCode = async (e: FormEvent) => {
    e.preventDefault();
    setPanelError(null);
    setPanelSuccess(null);

    const cleanCode = sanitizeClassCode(codeInput);
    const cleanBatch = batchNumber.trim().slice(0, 16);
    const parsedDuration = Number(durationValue);

    if (cleanCode.length < 3) {
      setPanelError(
        'Access code must be at least 3 characters (letters, numbers, dashes).',
      );
      return;
    }
    if (!cleanBatch) {
      setPanelError('Batch Number is required.');
      return;
    }
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setPanelError('Duration must be greater than 0.');
      return;
    }
    if (selectedModules.length === 0) {
      setPanelError('Select at least one module to unlock.');
      return;
    }

    const startDate = startsAtInput ? new Date(startsAtInput) : new Date();
    if (Number.isNaN(startDate.getTime())) {
      setPanelError('Invalid start date/time.');
      return;
    }

    const durationMs =
      durationUnit === 'days'
        ? parsedDuration * 24 * 60 * 60 * 1000
        : parsedDuration * 60 * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    setCreating(true);
    const docPath = `class_codes/${cleanCode}`;
    try {
      await setDoc(doc(db, 'class_codes', cleanCode), {
        code: cleanCode,
        batchNumber: cleanBatch,
        allowedModules: selectedModules,
        startsAt: Timestamp.fromDate(startDate),
        expiresAt: Timestamp.fromDate(endDate),
        active: true,
        createdBy: user?.email || INSTRUCTOR_EMAIL,
        createdAt: serverTimestamp(),
      });
      setPanelSuccess(`Created ${cleanCode} for Batch ${cleanBatch}.`);
      setCodeInput(generateSuggestedCode(cleanBatch));
      setStartsAtInput(formatDateTimeLocal(new Date()));
    } catch (error) {
      const info = buildFirestoreErrorInfo(error, OperationType.WRITE, docPath);
      console.error('Firestore Error: ', JSON.stringify(info));
      setPanelError(
        'Could not save class code. Verify Firestore rules allow instructor writes to class_codes.',
      );
    } finally {
      setCreating(false);
    }
  };

  // Copy raw Class Access Code (NOT link) so instructor can paste directly to online class
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => {
        setCopiedCode((prev) => (prev === code ? null : prev));
      }, 2200);
    } catch {
      setPanelError(`Copy manually: ${code}`);
    }
  };

  const handleToggleCodeActive = async (item: ClassCodeRecord) => {
    setBusyCode(item.code);
    setPanelError(null);
    const docPath = `class_codes/${item.code}`;
    try {
      await updateDoc(doc(db, 'class_codes', item.code), {
        active: !item.active,
      });
    } catch (error) {
      const info = buildFirestoreErrorInfo(error, OperationType.UPDATE, docPath);
      console.error('Firestore Error: ', JSON.stringify(info));
      setPanelError(`Failed to update status for ${item.code}.`);
    } finally {
      setBusyCode(null);
    }
  };

  // Open Edit Time modal for a Class Code or an Individual Student
  const openEditCodeTimeModal = (codeRecord: ClassCodeRecord) => {
    setTimeEditError(null);
    setPanelError(null);
    setPanelSuccess(null);
    setEditStartDateTime(formatDateTimeLocal(codeRecord.startsAt.toDate()));
    setEditEndDateTime(formatDateTimeLocal(codeRecord.expiresAt.toDate()));
    setTimeEditTarget({ kind: 'code', codeRecord });
  };

  const openEditStudentTimeModal = (student: EnrollmentRecord) => {
    setTimeEditError(null);
    setPanelError(null);
    setPanelSuccess(null);
    const currentExp = getStudentEffectiveExpiryMs(student);
    setEditStartDateTime('');
    setEditEndDateTime(formatDateTimeLocal(new Date(currentExp)));
    setTimeEditTarget({ kind: 'student', student });
  };

  const shiftEditEndByHours = (hours: number) => {
    setTimeEditError(null);
    const parsed = editEndDateTime ? new Date(editEndDateTime) : new Date();
    const baseMs = Number.isNaN(parsed.getTime())
      ? Date.now()
      : Math.max(Date.now(), parsed.getTime());
    setEditEndDateTime(
      formatDateTimeLocal(new Date(baseMs + hours * 60 * 60 * 1000)),
    );
  };

  const handleSaveTimeEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!timeEditTarget) return;

    setTimeEditError(null);
    const endDate = editEndDateTime ? new Date(editEndDateTime) : null;
    if (!endDate || Number.isNaN(endDate.getTime())) {
      setTimeEditError('Please choose a valid expiration date and time.');
      return;
    }

    setSavingTime(true);
    try {
      if (timeEditTarget.kind === 'code') {
        const startDate = editStartDateTime ? new Date(editStartDateTime) : null;
        if (!startDate || Number.isNaN(startDate.getTime())) {
          setTimeEditError('Please choose a valid start date and time.');
          setSavingTime(false);
          return;
        }
        if (endDate.getTime() <= startDate.getTime()) {
          setTimeEditError('Expiration date/time must be after the start date/time.');
          setSavingTime(false);
          return;
        }

        const { codeRecord } = timeEditTarget;
        await updateDoc(doc(db, 'class_codes', codeRecord.code), {
          startsAt: Timestamp.fromDate(startDate),
          expiresAt: Timestamp.fromDate(endDate),
          active: true,
        });
        setPanelSuccess(
          `Updated schedule for ${codeRecord.code} (${startDate.toLocaleString()} → ${endDate.toLocaleString()}).`,
        );
      } else {
        const { student } = timeEditTarget;
        const nextTs = Timestamp.fromDate(endDate);
        const isFuture = endDate.getTime() > Date.now();
        await updateDoc(doc(db, 'enrollments', student.uid), {
          customExpiresAt: nextTs,
          expiresAt: nextTs,
          ...(isFuture ? { revoked: false } : {}),
        });
        setPanelSuccess(
          `Updated access expiry for ${student.fullName || student.email} to ${endDate.toLocaleString()}.`,
        );
      }
      setTimeEditTarget(null);
    } catch (error) {
      const path =
        timeEditTarget.kind === 'code'
          ? `class_codes/${timeEditTarget.codeRecord.code}`
          : `enrollments/${timeEditTarget.student.uid}`;
      const info = buildFirestoreErrorInfo(error, OperationType.UPDATE, path);
      console.error('Firestore Error: ', JSON.stringify(info));
      setTimeEditError('Could not save the updated schedule. Please try again.');
    } finally {
      setSavingTime(false);
    }
  };

  // Student management actions
  const handleToggleStudentRevoke = async (student: EnrollmentRecord) => {
    setBusyStudentUid(student.uid);
    setPanelError(null);
    setPanelSuccess(null);
    const nextRevoked = !student.revoked;
    try {
      await updateDoc(doc(db, 'enrollments', student.uid), {
        revoked: nextRevoked,
      });
      setPanelSuccess(
        nextRevoked
          ? `Revoked access for ${student.fullName || student.email}.`
          : `Restored access for ${student.fullName || student.email}.`,
      );
    } catch (error) {
      const info = buildFirestoreErrorInfo(
        error,
        OperationType.UPDATE,
        `enrollments/${student.uid}`,
      );
      console.error('Firestore Error: ', JSON.stringify(info));
      setPanelError(`Failed to update revoke status for ${student.email}.`);
    } finally {
      setBusyStudentUid(null);
    }
  };

  const handleToggleStudentBlock = async (student: EnrollmentRecord) => {
    setBusyStudentUid(student.uid);
    setPanelError(null);
    setPanelSuccess(null);
    const nextBlocked = !student.blocked;
    try {
      await updateDoc(doc(db, 'enrollments', student.uid), {
        blocked: nextBlocked,
        ...(nextBlocked ? {} : { flaggedDuplicate: false }),
      });
      setPanelSuccess(
        nextBlocked
          ? `Blocked ${student.fullName || student.email}.`
          : `Unblocked ${student.fullName || student.email}.`,
      );
    } catch (error) {
      const info = buildFirestoreErrorInfo(
        error,
        OperationType.UPDATE,
        `enrollments/${student.uid}`,
      );
      console.error('Firestore Error: ', JSON.stringify(info));
      setPanelError(`Failed to update block status for ${student.email}.`);
    } finally {
      setBusyStudentUid(null);
    }
  };

  const openEditStudentModal = (student: EnrollmentRecord) => {
    setEditingStudent(student);
    setEditFirstName(student.firstName || '');
    setEditMiddleName(student.noMiddleName ? '' : student.middleName || '');
    setEditNoMiddleName(Boolean(student.noMiddleName || !student.middleName));
    setEditLastName(student.lastName || '');
    setEditBatchNumber(student.batchNumber || '');
    setPanelError(null);
    setPanelSuccess(null);
  };

  const handleSaveStudentOverride = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const f = cleanNameField(editFirstName);
    const m = editNoMiddleName ? '' : cleanNameField(editMiddleName);
    const l = cleanNameField(editLastName);
    const b = editBatchNumber.trim().slice(0, 16);

    if (!f || !l || !b) {
      setPanelError('First Name, Last Name, and Batch Number are required.');
      return;
    }

    const fullName = formatFullName(f, m, l);
    const oldKey = editingStudent.identityKey || '';
    const newKey = buildStudentIdentityKey(f, m, l, b);

    setSavingEdit(true);
    setPanelError(null);
    setPanelSuccess(null);

    try {
      if (oldKey && oldKey !== newKey && !editingStudent.flaggedDuplicate) {
        try {
          await deleteDoc(doc(db, 'student_identities', oldKey));
        } catch {
          // Ignore if old doc didn't exist
        }
      }

      if (newKey) {
        await setDoc(
          doc(db, 'student_identities', newKey),
          {
            identityKey: newKey,
            ownerUid: editingStudent.uid,
            email: editingStudent.email,
            fullName,
            batchNumber: b,
            updatedByInstructor: user?.email || INSTRUCTOR_EMAIL,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      await updateDoc(doc(db, 'enrollments', editingStudent.uid), {
        firstName: f,
        middleName: m,
        noMiddleName: editNoMiddleName,
        lastName: l,
        fullName,
        batchNumber: b,
        identityKey: newKey,
        profileLocked: true,
      });

      setPanelSuccess(`Updated student details for ${fullName} (Batch ${b}).`);
      setEditingStudent(null);
    } catch (error) {
      const info = buildFirestoreErrorInfo(
        error,
        OperationType.UPDATE,
        `enrollments/${editingStudent.uid}`,
      );
      console.error('Firestore Error: ', JSON.stringify(info));
      setPanelError('Failed to save instructor override. Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Student, Class Code, or Whole Batch (for clean re-testing)
  const handleConfirmDelete = async (includeBatchStudents = false) => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setPanelError(null);
    setPanelSuccess(null);

    try {
      if (deleteTarget.kind === 'student') {
        const st = deleteTarget.student;
        await deleteStudentRecords(st);
        setPanelSuccess(
          `Deleted ${st.fullName || st.email} (enrollment, progress, and identity lock cleared).`,
        );
      } else if (deleteTarget.kind === 'code') {
        const { codeRecord } = deleteTarget;
        await deleteDoc(doc(db, 'class_codes', codeRecord.code));

        if (includeBatchStudents) {
          const matchingStudents = students.filter(
            (s) =>
              s.batchNumber === codeRecord.batchNumber ||
              s.code === codeRecord.code,
          );
          await Promise.all(matchingStudents.map((st) => deleteStudentRecords(st)));
          setPanelSuccess(
            `Deleted code ${codeRecord.code} and ${matchingStudents.length} Batch ${codeRecord.batchNumber} student record${matchingStudents.length === 1 ? '' : 's'}.`,
          );
        } else {
          setPanelSuccess(`Deleted class code ${codeRecord.code}.`);
        }
      } else if (deleteTarget.kind === 'batch') {
        const targetBatch = deleteTarget.batchNumber;
        const matchingStudents = students.filter(
          (s) => s.batchNumber === targetBatch,
        );
        const matchingCodes = codes.filter(
          (c) => c.batchNumber === targetBatch,
        );

        await Promise.all([
          ...matchingStudents.map((st) => deleteStudentRecords(st)),
          ...matchingCodes.map((c) => deleteDoc(doc(db, 'class_codes', c.code))),
        ]);

        setPanelSuccess(
          `Deleted Batch ${targetBatch} (${matchingCodes.length} class code${matchingCodes.length === 1 ? '' : 's'} and ${matchingStudents.length} student record${matchingStudents.length === 1 ? '' : 's'}).`,
        );
      }

      setDeleteTarget(null);
    } catch (error) {
      const info = buildFirestoreErrorInfo(
        error,
        OperationType.DELETE,
        deleteTarget.kind === 'student'
          ? `enrollments/${deleteTarget.student.uid}`
          : deleteTarget.kind === 'code'
            ? `class_codes/${deleteTarget.codeRecord.code}`
            : `batch/${deleteTarget.batchNumber}`,
      );
      console.error('Firestore Error: ', JSON.stringify(info));
      setPanelError('Delete failed. Please check your connection and try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Export Batch CSV Gradebook
  const handleExportBatchCsv = () => {
    if (filteredStudents.length === 0) {
      setPanelError('No students in the current filter to export.');
      return;
    }

    const headers = [
      'Full Name',
      'Email',
      'Batch #',
      'Status',
      'Class Code',
      'Total Passed',
      'Total Exercises',
      'Overall %',
      'M1 Excel Score',
      'M1 Completed At',
      'M2 World SQL Score',
      'M2 Completed At',
      'M3 Ordering Score',
      'M3 Completed At',
      'M4 Movies Score',
      'M4 Completed At',
    ];

    const totalPossible = MODULE_DEFINITIONS.reduce(
      (sum, m) => sum + m.defaultTotal,
      0,
    );

    const lines = [headers.map(escapeCsvCell).join(',')];

    for (const student of filteredStudents) {
      const displayFullName =
        student.fullName ||
        formatFullName(student.firstName, student.middleName, student.lastName) ||
        student.displayName ||
        'Unregistered';
      const status = getStudentStatus(student, nowMs);

      let totalPassed = 0;
      const modCells: string[] = [];

      for (const modDef of MODULE_DEFINITIONS) {
        const score = student.moduleScores?.[modDef.id];
        const passed = score?.passed ?? 0;
        const total = score?.total ?? modDef.defaultTotal;
        totalPassed += passed;
        modCells.push(`${passed}/${total}`);
        modCells.push(formatCompletionTimestamp(score?.completedAt));
      }

      const overallPct =
        totalPossible > 0 ? Math.round((totalPassed / totalPossible) * 100) : 0;

      const row = [
        displayFullName,
        student.email,
        student.batchNumber || 'N/A',
        status,
        student.code || '',
        totalPassed,
        totalPossible,
        `${overallPct}%`,
        ...modCells,
      ];

      lines.push(row.map(escapeCsvCell).join(','));
    }

    const csvContent = `\uFEFF${lines.join('\r\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const batchSlug =
      batchFilter === 'ALL'
        ? 'All_Batches'
        : `Batch_${batchFilter.replace(/[^0-9A-Za-z_-]/g, '')}`;
    const dateStamp = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `DA101_Gradebook_${batchSlug}_${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPanelError(null);
    setPanelSuccess(
      `Exported CSV gradebook for ${filteredStudents.length} student${filteredStudents.length === 1 ? '' : 's'}${batchFilter === 'ALL' ? '' : ` (Batch ${batchFilter})`}.`,
    );
  };

  // Instructor Reset Module / Retake
  const handleResetStudentModules = async (
    student: EnrollmentRecord,
    moduleIds: CurriculumModuleId[],
  ) => {
    const busyKey =
      moduleIds.length === ALL_MODULE_IDS.length ? 'ALL' : moduleIds[0];
    setResettingModuleKey(busyKey);
    setPanelError(null);
    setPanelSuccess(null);

    const now = Date.now();
    try {
      const progressRef = doc(db, 'student_progress', student.uid);
      const enrollmentRef = doc(db, 'enrollments', student.uid);

      const nextModulesUpdate: Record<string, unknown> = {};
      const nextResetTs: Record<string, number> = {};
      const nextScoresUpdate: Record<string, unknown> = {};

      for (const modId of moduleIds) {
        const modDef = MODULE_DEFINITIONS.find((m) => m.id === modId);
        nextModulesUpdate[`modules.${modId}`] = deleteField();
        nextResetTs[`moduleResetTimestamps.${modId}`] = now;
        nextScoresUpdate[`moduleScores.${modId}`] = {
          passed: 0,
          wrong: 0,
          attempted: 0,
          total: modDef?.defaultTotal ?? 10,
          percentage: 0,
          status: 'Not Started',
          completedAt: null,
        };
      }

      await setDoc(
        progressRef,
        {
          uid: student.uid,
          updatedAt: now,
          lastSyncedAt: serverTimestamp(),
        },
        { merge: true },
      );

      await Promise.all([
        updateDoc(progressRef, {
          updatedAt: now,
          lastSyncedAt: serverTimestamp(),
          resetVersion: increment(1),
          ...nextModulesUpdate,
          ...nextResetTs,
        }),
        updateDoc(enrollmentRef, nextScoresUpdate),
      ]);

      setResetTargetStudent((prev) => {
        if (!prev || prev.uid !== student.uid) return prev;
        const updatedScores = { ...(prev.moduleScores || {}) };
        for (const modId of moduleIds) {
          const modDef = MODULE_DEFINITIONS.find((m) => m.id === modId);
          updatedScores[modId] = {
            passed: 0,
            wrong: 0,
            attempted: 0,
            total: modDef?.defaultTotal ?? 10,
            percentage: 0,
            status: 'Not Started',
            completedAt: null,
          };
        }
        return { ...prev, moduleScores: updatedScores };
      });

      const label =
        moduleIds.length === ALL_MODULE_IDS.length
          ? 'all 4 modules'
          : MODULE_DEFINITIONS.find((m) => m.id === moduleIds[0])?.chartLabel ||
            moduleIds[0];

      setPanelSuccess(
        `Reset ${label} for ${student.fullName || student.email}. Their lab state will clear cleanly.`,
      );
    } catch (error) {
      const info = buildFirestoreErrorInfo(
        error,
        OperationType.UPDATE,
        `student_progress/${student.uid}`,
      );
      console.error('Firestore Error: ', JSON.stringify(info));
      setPanelError(
        'Failed to reset student progress. Verify the updated Firestore rules are published.',
      );
    } finally {
      setResettingModuleKey(null);
    }
  };

  return (
    <AnimatePresence>
      {instructorPanelOpen && isInstructor && (
        <motion.div
          {...M3_BACKDROP_MOTION}
          role="dialog"
          aria-modal="true"
          aria-labelledby="instructorPanelTitle"
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !hasSubModalOpen) {
              setInstructorPanelOpen(false);
            }
          }}
        >
          <motion.div
            {...M3_MODAL_MOTION}
            className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131a27] shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div>
                <h2
                  id="instructorPanelTitle"
                  className="text-base md:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white"
                >
                  Instructor Access Control
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Signed in as {user?.email} · Manage class codes, schedules, registered students &amp; batches
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={M3_TAP_PRESS}
                transition={M3_SPRING_FAST_SPATIAL}
                onClick={() => setInstructorPanelOpen(false)}
                className="no-ripple px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </motion.button>
            </div>

            {/* 2-Tab Navigation Bar + Real-Time Refresh (M3 Expressive Gliding Indicator) */}
            <div className="px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0e1420] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <LayoutGroup id="instructor-panel-tabs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('codes');
                      setPanelError(null);
                      setPanelSuccess(null);
                    }}
                    className={`no-ripple relative inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'codes'
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    {activeTab === 'codes' && (
                      <motion.span
                        layoutId="instructorActiveTabPill"
                        transition={M3_SPRING_EXPRESSIVE_BOUNCE}
                        className="absolute inset-0 rounded-2xl bg-blue-600 shadow-sm pointer-events-none"
                        aria-hidden="true"
                      />
                    )}
                    <i className="ph ph-key text-sm relative z-10" aria-hidden="true" />
                    <span className="relative z-10">Class Codes</span>
                    <span className="font-mono text-[10px] opacity-85 relative z-10">
                      ({codes.length})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('students');
                      setPanelError(null);
                      setPanelSuccess(null);
                    }}
                    className={`no-ripple relative inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'students'
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    {activeTab === 'students' && (
                      <motion.span
                        layoutId="instructorActiveTabPill"
                        transition={M3_SPRING_EXPRESSIVE_BOUNCE}
                        className="absolute inset-0 rounded-2xl bg-blue-600 shadow-sm pointer-events-none"
                        aria-hidden="true"
                      />
                    )}
                    <i className="ph ph-users-three text-sm relative z-10" aria-hidden="true" />
                    <span className="relative z-10">Registered Students</span>
                    <span className="font-mono text-[10px] opacity-85 relative z-10">
                      ({students.length})
                    </span>
                    {flaggedCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-rose-500 text-white relative z-10">
                        {flaggedCount} flagged
                      </span>
                    )}
                  </button>
                </div>
              </LayoutGroup>

              <div className="flex items-center gap-2.5 ml-auto">
                {lastSyncedAt && (
                  <span className="hidden sm:inline-block text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    Synced{' '}
                    {lastSyncedAt.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                )}
                <motion.button
                  type="button"
                  whileTap={M3_TAP_PRESS}
                  transition={M3_SPRING_FAST_SPATIAL}
                  disabled={refreshing}
                  onClick={() => void handleManualRefresh()}
                  title="Fetch latest registered students and class codes from Firestore"
                  className="no-ripple inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131a27] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  <i
                    className={`ph ph-arrows-clockwise text-sm ${refreshing ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
                </motion.button>
              </div>
            </div>

            {/* Status Alerts */}
            <AnimatePresence>
              {(panelError || panelSuccess) && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={M3_SPRING_FAST_SPATIAL}
                  className="px-6 pt-3 shrink-0"
                >
                  {panelError && (
                    <div
                      role="alert"
                      className="px-3.5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300"
                    >
                      {panelError}
                    </div>
                  )}
                  {panelSuccess && (
                    <div
                      role="status"
                      className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300"
                    >
                      {panelSuccess}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200/80 dark:divide-slate-800/80">
              {activeTab === 'codes' ? (
                <>
                  {/* Create Class Code Form */}
                  <form onSubmit={handleCreateCode} className="px-6 py-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Generate New Class Access Code
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 mr-1">
                          Quick duration:
                        </span>
                        {[
                          { label: '3h', val: 3, unit: 'hours' as const },
                          { label: '24h', val: 24, unit: 'hours' as const },
                          { label: '3d', val: 3, unit: 'days' as const },
                          { label: '7d', val: 7, unit: 'days' as const },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => applyPreset(preset.val, preset.unit)}
                            className="no-ripple px-2 py-1 rounded-lg font-mono font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300">
                          Access Code
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={codeInput}
                            onChange={(e) => setCodeInput(sanitizeClassCode(e.target.value))}
                            placeholder="BATCH101-7K9P"
                            className="no-ripple flex-1 min-w-0 px-3 py-2 rounded-xl font-mono font-bold uppercase bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                          <button
                            type="button"
                            onClick={() => setCodeInput(generateSuggestedCode(batchNumber))}
                            title="Generate random code"
                            className="no-ripple px-2.5 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                          >
                            New
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300">
                          Batch Number
                        </label>
                        <input
                          type="text"
                          value={batchNumber}
                          onChange={(e) => {
                            const next = e.target.value
                              .replace(/[^0-9A-Za-z-]/g, '')
                              .slice(0, 16);
                            setBatchNumber(next);
                          }}
                          placeholder="e.g. 101"
                          className="no-ripple w-full px-3 py-2 rounded-xl font-mono font-semibold bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300">
                          Starts At
                        </label>
                        <input
                          type="datetime-local"
                          value={startsAtInput}
                          onChange={(e) => setStartsAtInput(e.target.value)}
                          className="no-ripple w-full px-3 py-2 rounded-xl font-mono text-[11px] bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300">
                          Valid Duration
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={durationValue}
                            onChange={(e) => setDurationValue(e.target.value)}
                            className="no-ripple w-20 px-3 py-2 rounded-xl font-mono font-bold tabular-nums bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                          <select
                            value={durationUnit}
                            onChange={(e) =>
                              setDurationUnit(
                                e.target.value === 'days' ? 'days' : 'hours',
                              )
                            }
                            className="no-ripple flex-1 px-2.5 py-2 rounded-xl font-semibold bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          >
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Allowed Modules Checkboxes */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Allowed Modules
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {MODULE_DEFINITIONS.map((mod) => {
                          const checked = selectedModules.includes(mod.id);
                          return (
                            <label
                              key={mod.id}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                                checked
                                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700/70 text-slate-900 dark:text-white font-semibold'
                                  : 'bg-slate-50 dark:bg-[#0c111b] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleModule(mod.id)}
                                className="rounded accent-blue-600"
                              />
                              <span className="truncate">{mod.chartLabel}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={M3_TAP_PRESS}
                        transition={M3_SPRING_FAST_SPATIAL}
                        disabled={creating}
                        className="no-ripple px-4 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
                      >
                        {creating ? 'Creating Code…' : 'Create Class Code'}
                      </motion.button>
                    </div>
                  </form>

                  {/* Existing Class Codes List */}
                  <div className="px-6 py-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Class Access Codes
                      </h3>
                      <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {codes.length} total
                      </span>
                    </div>

                    {loadingCodes ? (
                      <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                        Loading class codes…
                      </div>
                    ) : codes.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                        No class codes created yet. Generate your first batch code above.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        {codes.map((item) => {
                          const startMs = item.startsAt.toMillis();
                          const endMs = item.expiresAt.toMillis();
                          const statusLabel = !item.active
                            ? 'Revoked'
                            : nowMs < startMs
                              ? 'Scheduled'
                              : nowMs > endMs
                                ? 'Expired'
                                : 'Active';
                          const statusColorClass =
                            statusLabel === 'Active'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : statusLabel === 'Scheduled'
                                ? 'text-blue-600 dark:text-blue-400'
                                : statusLabel === 'Revoked'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-amber-600 dark:text-amber-400';
                          const isBusy = busyCode === item.code;

                          return (
                            <div
                              key={item.code}
                              className="px-4 py-3.5 bg-white dark:bg-[#0f1623] flex flex-col md:flex-row md:items-center justify-between gap-3"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                  <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white tracking-wide">
                                    {item.code}
                                  </span>
                                  <span className="text-xs text-slate-400" aria-hidden="true">·</span>
                                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                                    Batch {item.batchNumber}
                                  </span>
                                  <span className="text-xs text-slate-400" aria-hidden="true">·</span>
                                  <span className={`text-xs font-bold ${statusColorClass}`}>
                                    {statusLabel}
                                  </span>
                                  {statusLabel === 'Active' && (
                                    <>
                                      <span className="text-xs text-slate-400" aria-hidden="true">·</span>
                                      <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                                        {formatRemaining(endMs, nowMs)}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <span className="font-mono tabular-nums">
                                    {item.startsAt.toDate().toLocaleString()} →{' '}
                                    {item.expiresAt.toDate().toLocaleString()}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span>
                                    {item.allowedModules.length} of 4 modules
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 shrink-0 text-[11px]">
                                <motion.button
                                  type="button"
                                  whileTap={M3_TAP_PRESS}
                                  transition={M3_SPRING_FAST_SPATIAL}
                                  onClick={() => void handleCopyCode(item.code)}
                                  className="no-ripple inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer whitespace-nowrap"
                                  title={`Copy class access code ${item.code}`}
                                >
                                  <i
                                    className={`ph ${copiedCode === item.code ? 'ph-check' : 'ph-copy'} text-xs`}
                                    aria-hidden="true"
                                  />
                                  <span>
                                    {copiedCode === item.code ? 'Copied Code' : 'Copy Code'}
                                  </span>
                                </motion.button>
                                <motion.button
                                  type="button"
                                  whileTap={M3_TAP_PRESS}
                                  transition={M3_SPRING_FAST_SPATIAL}
                                  disabled={isBusy}
                                  onClick={() => openEditCodeTimeModal(item)}
                                  className="no-ripple inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                  title="Edit start and expiration date/time"
                                >
                                  <i className="ph ph-clock text-xs" aria-hidden="true" />
                                  <span>Edit Time</span>
                                </motion.button>
                                <motion.button
                                  type="button"
                                  whileTap={M3_TAP_PRESS}
                                  transition={M3_SPRING_FAST_SPATIAL}
                                  disabled={isBusy}
                                  onClick={() => void handleToggleCodeActive(item)}
                                  className={`no-ripple px-2.5 py-1.5 rounded-xl font-semibold border transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                                    item.active
                                      ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                      : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                  }`}
                                >
                                  {item.active ? 'Revoke' : 'Reactivate'}
                                </motion.button>
                                <motion.button
                                  type="button"
                                  whileTap={M3_TAP_PRESS}
                                  transition={M3_SPRING_FAST_SPATIAL}
                                  disabled={isBusy}
                                  onClick={() => {
                                    setPanelError(null);
                                    setPanelSuccess(null);
                                    setDeleteTarget({ kind: 'code', codeRecord: item });
                                  }}
                                  className="no-ripple inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                  title="Delete class code or entire batch"
                                >
                                  <i className="ph ph-trash text-xs" aria-hidden="true" />
                                  <span>Delete</span>
                                </motion.button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* TAB 2: REGISTERED STUDENTS */
                <div className="px-6 py-5 space-y-4">
                  {/* Filter Bar + Export Batch CSV + Delete Batch */}
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
                      <input
                        type="search"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search name, email, or code…"
                        className="no-ripple px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                      <select
                        value={batchFilter}
                        onChange={(e) => setBatchFilter(e.target.value)}
                        className="no-ripple px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      >
                        <option value="ALL">All Batches</option>
                        {distinctBatches.map((b) => (
                          <option key={b} value={b}>
                            Batch {b}
                          </option>
                        ))}
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="no-ripple px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Flagged · Duplicate">Flagged · Duplicate</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Revoked">Revoked</option>
                        <option value="Expired">Expired</option>
                        <option value="Pending Profile">Pending Profile</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        type="button"
                        whileTap={M3_TAP_PRESS}
                        transition={M3_SPRING_FAST_SPATIAL}
                        disabled={filteredStudents.length === 0}
                        onClick={handleExportBatchCsv}
                        className="no-ripple flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                        title="Download CSV gradebook for the currently filtered students"
                      >
                        <i className="ph ph-file-csv text-sm" aria-hidden="true" />
                        <span>
                          {batchFilter === 'ALL'
                            ? `Export CSV (${filteredStudents.length})`
                            : `Export Batch ${batchFilter} (${filteredStudents.length})`}
                        </span>
                      </motion.button>

                      {batchFilter !== 'ALL' && (
                        <motion.button
                          type="button"
                          whileTap={M3_TAP_PRESS}
                          transition={M3_SPRING_FAST_SPATIAL}
                          onClick={() => {
                            setPanelError(null);
                            setPanelSuccess(null);
                            setDeleteTarget({
                              kind: 'batch',
                              batchNumber: batchFilter,
                            });
                          }}
                          className="no-ripple inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer whitespace-nowrap"
                          title={`Delete Batch ${batchFilter} students and codes`}
                        >
                          <i className="ph ph-trash text-sm" aria-hidden="true" />
                          <span>Delete Batch {batchFilter}</span>
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {loadingStudents ? (
                    <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                      Loading registered students…
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                      No students match the current filter.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      {filteredStudents.map((student) => {
                        const status = getStudentStatus(student, nowMs);
                        const effExpiry = getStudentEffectiveExpiryMs(student);
                        const isBusy = busyStudentUid === student.uid;
                        const displayFullName =
                          student.fullName ||
                          formatFullName(
                            student.firstName,
                            student.middleName,
                            student.lastName,
                          ) ||
                          student.displayName ||
                          'Unregistered Name';

                        const passedTotal = MODULE_DEFINITIONS.reduce(
                          (acc, mod) =>
                            acc + (student.moduleScores?.[mod.id]?.passed ?? 0),
                          0,
                        );

                        const statusColor =
                          status === 'Active'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : status === 'Flagged · Duplicate' || status === 'Blocked'
                              ? 'text-rose-600 dark:text-rose-400'
                              : status === 'Revoked'
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-amber-600 dark:text-amber-400';

                        return (
                          <div
                            key={student.uid}
                            className="px-4 py-3.5 bg-white dark:bg-[#0f1623] flex flex-col xl:flex-row xl:items-center justify-between gap-3"
                          >
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                                  {displayFullName}
                                </span>
                                <span className="text-xs text-slate-400" aria-hidden="true">·</span>
                                <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                                  Batch {student.batchNumber || 'N/A'}
                                </span>
                                <span className="text-xs text-slate-400" aria-hidden="true">·</span>
                                <span className={`text-xs font-bold ${statusColor}`}>
                                  {status}
                                </span>
                                <span className="text-xs text-slate-400" aria-hidden="true">·</span>
                                <span className="text-xs font-mono font-bold tabular-nums text-slate-700 dark:text-slate-200">
                                  Total: {passedTotal}/52
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="font-mono">{student.email}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono">Code: {student.code}</span>
                                <span aria-hidden="true">·</span>
                                <span
                                  className="font-mono tabular-nums"
                                  title={`Expires: ${new Date(effExpiry).toLocaleString()}`}
                                >
                                  {formatRemaining(effExpiry, nowMs)}
                                </span>
                              </div>

                              {/* Per-Module Live Scores & Completion Timestamps */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                                {MODULE_DEFINITIONS.map((modDef, idx) => {
                                  const sc = student.moduleScores?.[modDef.id];
                                  const passed = sc?.passed ?? 0;
                                  const total = sc?.total ?? modDef.defaultTotal;
                                  const isComplete = passed >= total && total > 0;
                                  const isStarted =
                                    (sc?.attempted ?? 0) > 0 || passed > 0;
                                  const completedStr = formatCompletionShort(
                                    sc?.completedAt,
                                  );
                                  const fullCompletedStr = formatCompletionTimestamp(
                                    sc?.completedAt,
                                  );

                                  return (
                                    <div
                                      key={modDef.id}
                                      title={
                                        fullCompletedStr
                                          ? `${modDef.title}: ${passed}/${total} (Completed ${fullCompletedStr})`
                                          : `${modDef.title}: ${passed}/${total}`
                                      }
                                      className={`px-2 py-1 rounded-lg border text-[10px] font-mono tabular-nums flex flex-col ${
                                        isComplete
                                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                                          : isStarted
                                            ? 'bg-blue-50/70 dark:bg-blue-950/25 border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300'
                                            : 'bg-slate-50 dark:bg-[#0c111b] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-1 font-bold">
                                        <span>M{idx + 1}</span>
                                        <span>
                                          {passed}/{total}
                                          {isComplete ? ' ✓' : ''}
                                        </span>
                                      </div>
                                      {isComplete && completedStr && (
                                        <span className="text-[9px] opacity-80 truncate">
                                          {completedStr}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 shrink-0 text-[11px]">
                              <motion.button
                                type="button"
                                whileTap={M3_TAP_PRESS}
                                transition={M3_SPRING_FAST_SPATIAL}
                                disabled={isBusy}
                                onClick={() => openEditStudentModal(student)}
                                className="no-ripple px-2.5 py-1.5 rounded-xl font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                title="Override locked student name or batch number"
                              >
                                Edit
                              </motion.button>
                              <motion.button
                                type="button"
                                whileTap={M3_TAP_PRESS}
                                transition={M3_SPRING_FAST_SPATIAL}
                                disabled={isBusy}
                                onClick={() => openEditStudentTimeModal(student)}
                                className="no-ripple inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                title="Edit this student's exact expiration date and time"
                              >
                                <i className="ph ph-clock text-xs" aria-hidden="true" />
                                <span>Edit Time</span>
                              </motion.button>
                              <motion.button
                                type="button"
                                whileTap={M3_TAP_PRESS}
                                transition={M3_SPRING_FAST_SPATIAL}
                                disabled={isBusy}
                                onClick={() => {
                                  setPanelError(null);
                                  setPanelSuccess(null);
                                  setResetTargetStudent(student);
                                }}
                                className="no-ripple px-2.5 py-1.5 rounded-xl font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                title="Reset a module or all 4 modules for a retake"
                              >
                                Reset
                              </motion.button>
                              <motion.button
                                type="button"
                                whileTap={M3_TAP_PRESS}
                                transition={M3_SPRING_FAST_SPATIAL}
                                disabled={isBusy}
                                onClick={() => void handleToggleStudentRevoke(student)}
                                className={`no-ripple px-2.5 py-1.5 rounded-xl font-semibold border transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                                  student.revoked
                                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                                    : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                                }`}
                              >
                                {student.revoked ? 'Restore' : 'Revoke'}
                              </motion.button>
                              <motion.button
                                type="button"
                                whileTap={M3_TAP_PRESS}
                                transition={M3_SPRING_FAST_SPATIAL}
                                disabled={isBusy}
                                onClick={() => void handleToggleStudentBlock(student)}
                                className={`no-ripple px-2.5 py-1.5 rounded-xl font-semibold border transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                                  student.blocked
                                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                                    : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
                                }`}
                              >
                                {student.blocked ? 'Unblock' : 'Block'}
                              </motion.button>
                              <motion.button
                                type="button"
                                whileTap={M3_TAP_PRESS}
                                transition={M3_SPRING_FAST_SPATIAL}
                                disabled={isBusy}
                                onClick={() => {
                                  setPanelError(null);
                                  setPanelSuccess(null);
                                  setDeleteTarget({ kind: 'student', student });
                                }}
                                className="no-ripple inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                title="Permanently delete this user's enrollment, progress, and identity claim"
                              >
                                <i className="ph ph-trash text-xs" aria-hidden="true" />
                                <span>Delete</span>
                              </motion.button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* SUB-MODAL 1: Instructor Override — Edit Locked Student Identity */}
          <AnimatePresence>
            {editingStudent && (
              <motion.div
                {...M3_BACKDROP_MOTION}
                role="dialog"
                aria-modal="true"
                aria-labelledby="editStudentModalTitle"
                className="fixed inset-0 z-[145] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
                onClick={(e) => {
                  if (e.target === e.currentTarget && !savingEdit) {
                    setEditingStudent(null);
                  }
                }}
              >
                <motion.form
                  onSubmit={handleSaveStudentOverride}
                  {...M3_MODAL_MOTION}
                  className="w-full max-w-md rounded-[26px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131a27] shadow-2xl overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h3
                      id="editStudentModalTitle"
                      className="text-sm font-extrabold text-slate-900 dark:text-white"
                    >
                      Instructor Override — Edit Student Details
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {editingStudent.email}
                    </p>
                  </div>

                  <div className="px-5 py-4 space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="no-ripple w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-700 dark:text-slate-300">
                          Middle Name
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editNoMiddleName}
                            onChange={(e) => {
                              setEditNoMiddleName(e.target.checked);
                              if (e.target.checked) setEditMiddleName('');
                            }}
                            className="rounded accent-blue-600"
                          />
                          <span>No middle name</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        disabled={editNoMiddleName}
                        value={editNoMiddleName ? '' : editMiddleName}
                        onChange={(e) => setEditMiddleName(e.target.value)}
                        className="no-ripple w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="no-ripple w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Batch Number
                      </label>
                      <input
                        type="text"
                        required
                        value={editBatchNumber}
                        onChange={(e) =>
                          setEditBatchNumber(
                            e.target.value.replace(/[^0-9A-Za-z-]/g, '').slice(0, 16),
                          )
                        }
                        className="no-ripple w-full px-3 py-2 rounded-xl font-mono font-bold bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#0e1420] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={savingEdit}
                      onClick={() => setEditingStudent(null)}
                      className="no-ripple px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      whileTap={M3_TAP_PRESS}
                      transition={M3_SPRING_FAST_SPATIAL}
                      disabled={savingEdit}
                      className="no-ripple px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-60"
                    >
                      {savingEdit ? 'Saving Override…' : 'Save Override'}
                    </motion.button>
                  </div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUB-MODAL 2: Edit Date & Time Modal (Class Code or Student) */}
          <AnimatePresence>
            {timeEditTarget && (
              <motion.div
                {...M3_BACKDROP_MOTION}
                role="dialog"
                aria-modal="true"
                aria-labelledby="editTimeModalTitle"
                className="fixed inset-0 z-[145] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
                onClick={(e) => {
                  if (e.target === e.currentTarget && !savingTime) {
                    setTimeEditTarget(null);
                  }
                }}
              >
                <motion.form
                  onSubmit={handleSaveTimeEdit}
                  {...M3_MODAL_MOTION}
                  className="w-full max-w-md rounded-[26px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131a27] shadow-2xl overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h3
                      id="editTimeModalTitle"
                      className="text-sm font-extrabold text-slate-900 dark:text-white"
                    >
                      {timeEditTarget.kind === 'code'
                        ? `Edit Schedule — ${timeEditTarget.codeRecord.code}`
                        : 'Edit Student Access Expiry'}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {timeEditTarget.kind === 'code'
                        ? `Batch ${timeEditTarget.codeRecord.batchNumber}`
                        : `${timeEditTarget.student.fullName || timeEditTarget.student.email} · Batch ${timeEditTarget.student.batchNumber || 'N/A'}`}
                    </p>
                  </div>

                  <div className="px-5 py-4 space-y-3.5 text-xs">
                    {timeEditTarget.kind === 'code' && (
                      <div className="space-y-1">
                        <label
                          htmlFor="editScheduleStartInput"
                          className="block font-bold text-slate-700 dark:text-slate-300"
                        >
                          Starts At
                        </label>
                        <input
                          id="editScheduleStartInput"
                          type="datetime-local"
                          required
                          value={editStartDateTime}
                          onChange={(e) => {
                            setTimeEditError(null);
                            setEditStartDateTime(e.target.value);
                          }}
                          className="no-ripple w-full px-3 py-2 rounded-xl font-mono text-xs bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label
                        htmlFor="editScheduleEndInput"
                        className="block font-bold text-slate-700 dark:text-slate-300"
                      >
                        Expires At
                      </label>
                      <input
                        id="editScheduleEndInput"
                        type="datetime-local"
                        required
                        value={editEndDateTime}
                        onChange={(e) => {
                          setTimeEditError(null);
                          setEditEndDateTime(e.target.value);
                        }}
                        className="no-ripple w-full px-3 py-2 rounded-xl font-mono text-xs bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>

                    {/* Quick helper adjustments that populate the datetime input before saving */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">
                        Quick shift:
                      </span>
                      {[
                        { label: '+1h', hrs: 1 },
                        { label: '+2h', hrs: 2 },
                        { label: '+1d', hrs: 24 },
                        { label: '+3d', hrs: 72 },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => shiftEditEndByHours(opt.hrs)}
                          className="no-ripple px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {timeEditError && (
                      <div
                        role="alert"
                        className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300"
                      >
                        {timeEditError}
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#0e1420] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={savingTime}
                      onClick={() => setTimeEditTarget(null)}
                      className="no-ripple px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      whileTap={M3_TAP_PRESS}
                      transition={M3_SPRING_FAST_SPATIAL}
                      disabled={savingTime}
                      className="no-ripple px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-60"
                    >
                      {savingTime ? 'Saving Time…' : 'Save Date & Time'}
                    </motion.button>
                  </div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUB-MODAL 3: Instructor Reset Module / Retake Modal */}
          <AnimatePresence>
            {resetTargetStudent && (
              <motion.div
                {...M3_BACKDROP_MOTION}
                role="dialog"
                aria-modal="true"
                aria-labelledby="resetStudentModalTitle"
                className="fixed inset-0 z-[145] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
                onClick={(e) => {
                  if (e.target === e.currentTarget && !resettingModuleKey) {
                    setResetTargetStudent(null);
                  }
                }}
              >
                <motion.div
                  {...M3_MODAL_MOTION}
                  className="w-full max-w-md rounded-[26px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131a27] shadow-2xl overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h3
                      id="resetStudentModalTitle"
                      className="text-sm font-extrabold text-slate-900 dark:text-white"
                    >
                      Reset Module Progress / Grant Retake
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {resetTargetStudent.fullName || resetTargetStudent.email} · Batch{' '}
                      {resetTargetStudent.batchNumber || 'N/A'}
                    </p>
                  </div>

                  <div className="px-5 py-4 space-y-2.5 text-xs">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Clears the student&apos;s saved Firestore answers, score, and completion timestamp for the selected module, and forces a clean state on their browser.
                    </p>

                    <div className="space-y-2 pt-1">
                      {MODULE_DEFINITIONS.map((modDef) => {
                        const sc = resetTargetStudent.moduleScores?.[modDef.id];
                        const passed = sc?.passed ?? 0;
                        const total = sc?.total ?? modDef.defaultTotal;
                        const isResetting = resettingModuleKey === modDef.id;
                        const completedStr = formatCompletionShort(sc?.completedAt);

                        return (
                          <div
                            key={modDef.id}
                            className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0c111b]"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate">
                                {modDef.title}
                              </div>
                              <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                                Current: {passed}/{total}
                                {completedStr ? ` · Done ${completedStr}` : ''}
                              </div>
                            </div>
                            <motion.button
                              type="button"
                              whileTap={M3_TAP_PRESS}
                              transition={M3_SPRING_FAST_SPATIAL}
                              disabled={Boolean(resettingModuleKey)}
                              onClick={() =>
                                void handleResetStudentModules(resetTargetStudent, [
                                  modDef.id,
                                ])
                              }
                              className="no-ripple px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                            >
                              {isResetting ? 'Resetting…' : 'Reset'}
                            </motion.button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <motion.button
                        type="button"
                        whileTap={M3_TAP_PRESS}
                        transition={M3_SPRING_FAST_SPATIAL}
                        disabled={Boolean(resettingModuleKey)}
                        onClick={() =>
                          void handleResetStudentModules(
                            resetTargetStudent,
                            ALL_MODULE_IDS,
                          )
                        }
                        className="no-ripple w-full py-2.5 px-4 rounded-2xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {resettingModuleKey === 'ALL'
                          ? 'Resetting All 4 Modules…'
                          : 'Reset All 4 Modules (Full Retake)'}
                      </motion.button>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 dark:bg-[#0e1420] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
                    <button
                      type="button"
                      disabled={Boolean(resettingModuleKey)}
                      onClick={() => setResetTargetStudent(null)}
                      className="no-ripple px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUB-MODAL 4: Delete User / Class Code / Batch Confirmation Modal */}
          <AnimatePresence>
            {deleteTarget && (
              <motion.div
                {...M3_BACKDROP_MOTION}
                role="dialog"
                aria-modal="true"
                aria-labelledby="deleteConfirmModalTitle"
                className="fixed inset-0 z-[148] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
                onClick={(e) => {
                  if (e.target === e.currentTarget && !deleting) {
                    setDeleteTarget(null);
                  }
                }}
              >
                <motion.div
                  {...M3_MODAL_MOTION}
                  className="w-full max-w-md rounded-[26px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131a27] shadow-2xl overflow-hidden"
                >
                  <div className="px-5 pt-5 pb-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                        <i className="ph ph-trash text-xl" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3
                          id="deleteConfirmModalTitle"
                          className="text-sm font-extrabold text-slate-900 dark:text-white"
                        >
                          {deleteTarget.kind === 'student'
                            ? 'Delete Student Account Record?'
                            : deleteTarget.kind === 'code'
                              ? `Delete Class Code ${deleteTarget.codeRecord.code}?`
                              : `Delete Entire Batch ${deleteTarget.batchNumber}?`}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {deleteTarget.kind === 'student'
                            ? `${deleteTarget.student.fullName || deleteTarget.student.email} · Batch ${deleteTarget.student.batchNumber || 'N/A'}`
                            : deleteTarget.kind === 'code'
                              ? `Batch ${deleteTarget.codeRecord.batchNumber}`
                              : `Removes all codes & student records in Batch ${deleteTarget.batchNumber}`}
                        </p>
                      </div>
                    </div>

                    {deleteTarget.kind === 'student' ? (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        This permanently removes their enrollment, cloud progress, and identity lock so this Google account or name can register fresh for testing.
                      </p>
                    ) : deleteTarget.kind === 'code' ? (
                      (() => {
                        const batchStudentsCount = students.filter(
                          (s) =>
                            s.batchNumber === deleteTarget.codeRecord.batchNumber ||
                            s.code === deleteTarget.codeRecord.code,
                        ).length;
                        return (
                          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            <p>
                              You can delete only this class code, or also clear all{' '}
                              <strong className="text-slate-900 dark:text-white">
                                {batchStudentsCount} registered student{batchStudentsCount === 1 ? '' : 's'}
                              </strong>{' '}
                              in Batch {deleteTarget.codeRecord.batchNumber} (enrollments, progress, and identity locks).
                            </p>
                          </div>
                        );
                      })()
                    ) : (
                      (() => {
                        const batchStudentsCount = students.filter(
                          (s) => s.batchNumber === deleteTarget.batchNumber,
                        ).length;
                        const batchCodesCount = codes.filter(
                          (c) => c.batchNumber === deleteTarget.batchNumber,
                        ).length;
                        return (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            This permanently deletes{' '}
                            <strong className="text-slate-900 dark:text-white">
                              {batchCodesCount} class code{batchCodesCount === 1 ? '' : 's'}
                            </strong>{' '}
                            and{' '}
                            <strong className="text-slate-900 dark:text-white">
                              {batchStudentsCount} student record{batchStudentsCount === 1 ? '' : 's'}
                            </strong>{' '}
                            (including progress and identity locks) in Batch{' '}
                            {deleteTarget.batchNumber}. This cannot be undone.
                          </p>
                        );
                      })()
                    )}
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#0e1420] border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => setDeleteTarget(null)}
                      className="no-ripple px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    {deleteTarget.kind === 'code' ? (
                      <>
                        <motion.button
                          type="button"
                          whileTap={M3_TAP_PRESS}
                          transition={M3_SPRING_FAST_SPATIAL}
                          disabled={deleting}
                          onClick={() => void handleConfirmDelete(false)}
                          className="no-ripple px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer disabled:opacity-60"
                        >
                          {deleting ? 'Deleting…' : 'Delete Code Only'}
                        </motion.button>
                        {students.some(
                          (s) =>
                            s.batchNumber === deleteTarget.codeRecord.batchNumber ||
                            s.code === deleteTarget.codeRecord.code,
                        ) && (
                          <motion.button
                            type="button"
                            whileTap={M3_TAP_PRESS}
                            transition={M3_SPRING_FAST_SPATIAL}
                            disabled={deleting}
                            onClick={() => void handleConfirmDelete(true)}
                            className="no-ripple px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-60"
                          >
                            {deleting
                              ? 'Deleting…'
                              : `Delete Code + Batch ${deleteTarget.codeRecord.batchNumber}`}
                          </motion.button>
                        )}
                      </>
                    ) : (
                      <motion.button
                        type="button"
                        whileTap={M3_TAP_PRESS}
                        transition={M3_SPRING_FAST_SPATIAL}
                        disabled={deleting}
                        onClick={() => void handleConfirmDelete(true)}
                        className="no-ripple px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-60"
                      >
                        {deleting
                          ? 'Deleting…'
                          : deleteTarget.kind === 'student'
                            ? 'Delete User'
                            : `Delete Batch ${deleteTarget.batchNumber}`}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
