import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { sanitizeClassCode, useAccess } from '../context/AccessContext';
import { cleanNameField, formatFullName } from '../utils/identity';
import {
  M3_BACKDROP_MOTION,
  M3_MODAL_MOTION,
  M3_SPRING_FAST_SPATIAL,
  M3_TAP_PRESS,
  M3_VIEW_MOTION,
} from '../utils/m3Motion';

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export function ClassAccessGate() {
  const {
    user,
    authLoading,
    enrollmentLoading,
    hasAccess,
    isBlocked,
    isRevoked,
    isExpired,
    needsProfileRegistration,
    isExpiredExportOnly,
    showCodeEntryFromExpired,
    setShowCodeEntryFromExpired,
    enrollment,
    urlCode,
    authError,
    redeemError,
    redeeming,
    profileError,
    savingProfile,
    signInWithGoogle,
    requestSignOut,
    redeemClassCode,
    completeStudentProfile,
    clearErrors,
  } = useAccess();

  const [codeInput, setCodeInput] = useState(urlCode);
  const [signingIn, setSigningIn] = useState(false);

  // One-time profile registration state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [lastName, setLastName] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);
  const [localValidationError, setLocalValidationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (urlCode) {
      setCodeInput(urlCode);
    }
  }, [urlCode]);

  // Pre-fill profile fields softly if enrollment already has partial values
  useEffect(() => {
    if (needsProfileRegistration && enrollment) {
      if (enrollment.firstName && !firstName) setFirstName(enrollment.firstName);
      if (enrollment.middleName && !middleName) setMiddleName(enrollment.middleName);
      if (enrollment.lastName && !lastName) setLastName(enrollment.lastName);
      setConfirmStep(false);
      setLocalValidationError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsProfileRegistration, enrollment?.code]);

  // Allow full access OR Home Export-Only Mode unless student explicitly clicked "Enter New Class Code"
  const isGateVisible =
    !hasAccess && !(isExpiredExportOnly && !showCodeEntryFromExpired);

  const handleGoogleSignIn = async (forInstructor = false) => {
    setSigningIn(true);
    try {
      await signInWithGoogle(forInstructor);
    } finally {
      setSigningIn(false);
    }
  };

  const handleCodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await redeemClassCode(codeInput);
  };

  const handleProfileNext = (e: FormEvent) => {
    e.preventDefault();
    clearErrors();
    setLocalValidationError(null);

    const f = cleanNameField(firstName);
    const m = noMiddleName ? '' : cleanNameField(middleName);
    const l = cleanNameField(lastName);

    if (!f) {
      setLocalValidationError('Please enter your First Name.');
      return;
    }
    if (!noMiddleName && !m) {
      setLocalValidationError(
        'Please enter your Middle Name, or check "I do not have a middle name".',
      );
      return;
    }
    if (!l) {
      setLocalValidationError('Please enter your Last Name.');
      return;
    }

    setFirstName(f);
    setMiddleName(m);
    setLastName(l);
    setConfirmStep(true);
  };

  const handleProfileConfirmSave = async () => {
    setLocalValidationError(null);
    await completeStudentProfile({
      firstName,
      middleName,
      noMiddleName,
      lastName,
    });
  };

  const isLoading = authLoading || enrollmentLoading;

  // Determine current visual step key for M3 Expressive step transitions
  const stepKey = isLoading
    ? 'loading'
    : !user
      ? 'signin'
      : isBlocked
        ? 'closed'
        : needsProfileRegistration && enrollment
          ? confirmStep
            ? 'profile-confirm'
            : 'profile-form'
          : 'code-entry';

  return (
    <AnimatePresence>
      {isGateVisible && (
        <motion.div
          key="class-access-gate-overlay"
          {...M3_BACKDROP_MOTION}
          role="dialog"
          aria-modal="true"
          aria-labelledby="classAccessGateTitle"
          className="da-access-gate fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            {...M3_MODAL_MOTION}
            className="da-access-gate-card w-full max-w-md rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131a27] shadow-2xl overflow-hidden my-auto"
          >
            {/* Top Brand Header */}
            <div className="px-6 pt-6 pb-5 border-b border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <i className="ph ph-database text-xl" aria-hidden="true" />
                </div>
                <div>
                  <h1
                    id="classAccessGateTitle"
                    className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight"
                  >
                    Data Analytics 101
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {needsProfileRegistration
                      ? 'One-Time Student Registration'
                      : isBlocked
                        ? 'Session Ended'
                        : 'Class Access Verification'}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <AnimatePresence mode="wait" initial={false}>
                {isLoading ? (
                  <motion.div
                    key={stepKey}
                    {...M3_VIEW_MOTION}
                    className="py-8 flex flex-col items-center justify-center gap-3 text-center"
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Verifying your account and class enrollment…
                    </p>
                  </motion.div>
                ) : !user ? (
                  /* STEP 1: GOOGLE SIGN-IN */
                  <motion.div
                    key={stepKey}
                    {...M3_VIEW_MOTION}
                    className="space-y-4"
                  >
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Sign in to access your class
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Verify your cohort enrollment to unlock your assigned Excel and SQL practical modules.
                  </p>
                </div>

                {/* VA Google Account Requirement Callout (#4) */}
                <div className="px-3.5 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/35 border border-blue-200 dark:border-blue-800/70 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                    <i className="ph ph-info text-base text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
                    <span>Virtual Assistant Google Accounts Only</span>
                  </div>
                  <p className="text-[11px] text-blue-800/90 dark:text-blue-300/90 leading-relaxed">
                    Please sign in using your official <strong>Virtual Assistant Google Account (@gmail.com only)</strong>. Other email domains and personal duplicate accounts are not permitted.
                  </p>
                </div>

                {urlCode && (
                  <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2">
                    <span>Invite code detected</span>
                    <span className="font-mono font-bold tabular-nums">{urlCode}</span>
                  </div>
                )}

                {authError && (
                  <div
                    role="alert"
                    className="px-3.5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 leading-relaxed"
                  >
                    {authError}
                  </div>
                )}

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={M3_TAP_PRESS}
                  transition={M3_SPRING_FAST_SPATIAL}
                  disabled={signingIn}
                  onClick={() => void handleGoogleSignIn(false)}
                  className="no-ripple w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  <GoogleLogo />
                  <span>{signingIn ? 'Opening Google Sign-In…' : 'Continue with Google'}</span>
                </motion.button>
              </motion.div>
            ) : isBlocked ? (
              /* OPTION 1 DE-ESCALATED LOCKED SCREEN (FOR ACCOUNTS BLOCKED BEFORE PROFILE LOCK) */
              <motion.div
                key={stepKey}
                {...M3_VIEW_MOTION}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/70 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
                    <i className="ph ph-clock-countdown text-lg shrink-0" aria-hidden="true" />
                    <span>Class Access Time Ended</span>
                  </div>
                  <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                    Your class access window for this account is currently closed or expired. Please contact your instructor if you need assistance.
                  </p>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 pt-1">
                    Signed in as <strong className="font-mono">{user.email}</strong>.
                  </p>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={M3_TAP_PRESS}
                  transition={M3_SPRING_FAST_SPATIAL}
                  onClick={requestSignOut}
                  className="no-ripple w-full px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white transition-colors cursor-pointer"
                >
                  Sign Out
                </motion.button>
              </motion.div>
            ) : needsProfileRegistration && enrollment ? (
              /* STEP 3: ONE-TIME LOCKED PROFILE REGISTRATION (#5) */
              <motion.div
                key={stepKey}
                {...M3_VIEW_MOTION}
                className="space-y-4"
              >
                {/* Account summary bar */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.email}
                    </div>
                    <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                      Code: {enrollment.code} · Batch {enrollment.batchNumber}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={requestSignOut}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Sign out
                  </button>
                </div>

                {/* Permanent Lock Warning */}
                <div className="px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                  <i className="ph ph-lock-key text-base text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Important:</strong> Enter your exact legal name carefully. Once submitted, <strong>you cannot change these details again</strong>.
                  </span>
                </div>

                {!confirmStep ? (
                  <form onSubmit={handleProfileNext} className="space-y-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="regFirstName"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="regFirstName"
                        type="text"
                        required
                        autoFocus
                        value={firstName}
                        onChange={(e) => {
                          setLocalValidationError(null);
                          clearErrors();
                          setFirstName(e.target.value);
                        }}
                        placeholder="e.g. Juan"
                        className="no-ripple w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="regMiddleName"
                          className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                        >
                          Middle Name {!noMiddleName && <span className="text-rose-500">*</span>}
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={noMiddleName}
                            onChange={(e) => {
                              setNoMiddleName(e.target.checked);
                              if (e.target.checked) setMiddleName('');
                              setLocalValidationError(null);
                            }}
                            className="rounded accent-blue-600"
                          />
                          <span>No middle name</span>
                        </label>
                      </div>
                      <input
                        id="regMiddleName"
                        type="text"
                        disabled={noMiddleName}
                        value={noMiddleName ? '' : middleName}
                        onChange={(e) => {
                          setLocalValidationError(null);
                          clearErrors();
                          setMiddleName(e.target.value);
                        }}
                        placeholder={noMiddleName ? 'Not applicable' : 'e.g. Dela Cruz'}
                        className="no-ripple w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="regLastName"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="regLastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => {
                          setLocalValidationError(null);
                          clearErrors();
                          setLastName(e.target.value);
                        }}
                        placeholder="e.g. Santos"
                        className="no-ripple w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="regBatchNumber"
                        className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        <span>Batch Number</span>
                        <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                          Locked by class code
                        </span>
                      </label>
                      <input
                        id="regBatchNumber"
                        type="text"
                        readOnly
                        disabled
                        value={`Batch ${enrollment.batchNumber}`}
                        className="no-ripple w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 opacity-85 cursor-not-allowed"
                      />
                    </div>

                    {(localValidationError || profileError) && (
                      <div
                        role="alert"
                        className="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300"
                      >
                        {localValidationError || profileError}
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.015, y: -1 }}
                      whileTap={M3_TAP_PRESS}
                      transition={M3_SPRING_FAST_SPATIAL}
                      className="no-ripple w-full px-4 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-sm"
                    >
                      Review &amp; Continue
                    </motion.button>
                  </form>
                ) : (
                  /* 2-Step Confirmation Review */
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c111b] border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Confirm Permanent Student Identity
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block">First Name</span>
                          <strong className="text-slate-900 dark:text-white">{firstName}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Middle Name</span>
                          <strong className="text-slate-900 dark:text-white">
                            {noMiddleName ? 'N/A' : middleName}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Last Name</span>
                          <strong className="text-slate-900 dark:text-white">{lastName}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Batch Number</span>
                          <strong className="font-mono text-slate-900 dark:text-white">
                            Batch {enrollment.batchNumber}
                          </strong>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Certificate Full Name</span>
                        <strong className="text-sm text-blue-700 dark:text-blue-300">
                          {formatFullName(firstName, noMiddleName ? '' : middleName, lastName)}
                        </strong>
                      </div>
                    </div>

                    {profileError && (
                      <div
                        role="alert"
                        className="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300"
                      >
                        {profileError}
                      </div>
                    )}

                    <div className="flex items-center gap-2.5">
                      <motion.button
                        type="button"
                        whileTap={M3_TAP_PRESS}
                        transition={M3_SPRING_FAST_SPATIAL}
                        disabled={savingProfile}
                        onClick={() => setConfirmStep(false)}
                        className="no-ripple flex-1 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Go Back
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.015, y: -1 }}
                        whileTap={M3_TAP_PRESS}
                        transition={M3_SPRING_FAST_SPATIAL}
                        disabled={savingProfile}
                        onClick={() => void handleProfileConfirmSave()}
                        className="no-ripple flex-[1.4] px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
                      >
                        {savingProfile ? 'Verifying & Locking…' : 'Confirm & Lock Details'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* STEP 2: CLASS ACCESS CODE ENTRY */
              <motion.div
                key={stepKey}
                {...M3_VIEW_MOTION}
                className="space-y-4"
              >
                <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-200/80 dark:border-slate-800/80">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.displayName || 'Signed-in Student'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={requestSignOut}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Sign out
                  </button>
                </div>

                {(isExpired || isRevoked) && enrollment && (
                  <div
                    role="status"
                    className="px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed"
                  >
                    Access for <strong className="font-mono">{enrollment.code}</strong> (Batch {enrollment.batchNumber}) has ended. Enter a new active class code from your instructor to resume labs.
                  </div>
                )}

                <form onSubmit={handleCodeSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="classAccessCodeInput"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Class Access Code
                    </label>
                    <input
                      id="classAccessCodeInput"
                      type="text"
                      autoFocus
                      autoComplete="off"
                      spellCheck={false}
                      value={codeInput}
                      onChange={(e) => {
                        clearErrors();
                        setCodeInput(sanitizeClassCode(e.target.value));
                      }}
                      placeholder="e.g. BATCH24-7K9P"
                      className="no-ripple w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase bg-slate-50 dark:bg-[#0c111b] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Your Batch Number and available modules are automatically set by this code.
                    </p>
                  </div>

                  {(redeemError || authError) && (
                    <div
                      role="alert"
                      className="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 leading-relaxed"
                    >
                      {redeemError || authError}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.015, y: -1 }}
                      whileTap={M3_TAP_PRESS}
                      transition={M3_SPRING_FAST_SPATIAL}
                      disabled={redeeming || codeInput.trim().length < 3}
                      className="no-ripple w-full px-4 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {redeeming ? 'Verifying Class Code…' : 'Unlock Class Access'}
                    </motion.button>

                    {isExpiredExportOnly && showCodeEntryFromExpired && (
                      <motion.button
                        type="button"
                        whileTap={M3_TAP_PRESS}
                        transition={M3_SPRING_FAST_SPATIAL}
                        onClick={() => setShowCodeEntryFromExpired(false)}
                        className="no-ripple w-full px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Back to Export Results
                      </motion.button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Discreet Instructor Footer Row */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>@gmail.com VA accounts only</span>
          <button
            type="button"
            disabled={signingIn}
            onClick={() => void handleGoogleSignIn(true)}
            className="font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            Instructor sign in
          </button>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
