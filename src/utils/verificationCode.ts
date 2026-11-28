import type { CurriculumModuleId } from './curriculumProgress';

const MODULE_SHORT_TAGS: Record<CurriculumModuleId, string> = {
  excel: 'M1',
  sql_world: 'M2',
  sql_ordering: 'M3',
  sql_movies: 'M4',
};

/**
 * Deterministic 64-bit FNV-1a style dual-hash producing a short,
 * tamper-evident verification code (e.g. DA101-M2-B101-7F3A9C).
 * Both the student's PDF/PNG exporter and the Instructor Panel compute
 * the exact same code from Firestore-backed fields so screenshots/PDFs
 * can be verified instantaneously.
 */
function computeHashHex(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= ch + ((i + 1) * 31);
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  const part1 = (h1 >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 4);
  const part2 = (h2 >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 4);
  return `${part1}${part2}`;
}

export interface VerificationCodeInput {
  uid: string;
  batchNumber: string;
  moduleId: CurriculumModuleId;
  passed: number;
  total: number;
  completedAt?: number | null;
}

export function computeVerificationCode(input: VerificationCodeInput): string {
  const safeUid = (input.uid || 'guest').trim();
  const safeBatch =
    (input.batchNumber || 'NA').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'NA';
  const modTag = MODULE_SHORT_TAGS[input.moduleId] || 'MX';
  // Round completedAt to nearest minute so minor client/server ms skew stays deterministic
  const completedBucket =
    typeof input.completedAt === 'number' && input.completedAt > 0
      ? Math.floor(input.completedAt / 60_000)
      : 0;
  const payload = `DA101::${safeUid}::${safeBatch}::${input.moduleId}::${input.passed}/${input.total}::${completedBucket}`;
  const sig = computeHashHex(payload).slice(0, 6);
  return `DA101-${modTag}-B${safeBatch}-${sig}`;
}

export function normalizeVerificationCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}
