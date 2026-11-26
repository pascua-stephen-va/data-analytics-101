import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type ThemeMode = 'light' | 'dark' | 'auto';
type EffectiveTheme = 'light' | 'dark';

declare global {
  interface Window {
    setAppThemeMode?: (mode: ThemeMode) => void;
    toggleAppTheme?: () => void;
    getAppThemeState?: () => { mode: ThemeMode; effectiveTheme: EffectiveTheme };
  }
}

interface ThemeToggleProps {
  variant?: 'default' | 'excel' | 'ordering';
}

function getSystemTheme(): EffectiveTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem('da101_theme_mode');
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
    const legacy = localStorage.getItem('da101_theme');
    if (legacy === 'light' || legacy === 'dark') {
      return legacy;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'auto';
}

function resolveTheme(mode: ThemeMode): EffectiveTheme {
  return mode === 'auto' ? getSystemTheme() : mode;
}

function SunIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2.25v2.25" />
      <path d="M12 19.5v2.25" />
      <path d="m4.93 4.93 1.59 1.59" />
      <path d="m17.48 17.48 1.59 1.59" />
      <path d="M2.25 12h2.25" />
      <path d="M19.5 12h2.25" />
      <path d="m6.52 17.48-1.59 1.59" />
      <path d="m19.07 4.93-1.59 1.59" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  );
}

export function ThemeToggle({ variant = 'default' }: ThemeToggleProps) {
  const initialMode = readStoredMode();
  const initialEffective = resolveTheme(initialMode);

  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(initialEffective);
  const [rotation, setRotation] = useState<number>(0);
  const prevEffectiveRef = useRef<EffectiveTheme>(initialEffective);

  useEffect(() => {
    const syncFromExternal = (nextMode: ThemeMode, nextEffective: EffectiveTheme) => {
      setMode(nextMode);
      setEffectiveTheme(nextEffective);
      if (prevEffectiveRef.current !== nextEffective) {
        prevEffectiveRef.current = nextEffective;
        setRotation((r) => r + 180);
      }
    };

    const handleThemeEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ mode?: ThemeMode; effectiveTheme?: EffectiveTheme }>).detail;
      if (detail?.effectiveTheme) {
        syncFromExternal(detail.mode ?? readStoredMode(), detail.effectiveTheme);
      } else {
        const currentMode = readStoredMode();
        syncFromExternal(currentMode, resolveTheme(currentMode));
      }
    };

    // Listen to global app theme changes (covers manual clicks across headers and OS system changes)
    window.addEventListener('appthemechange', handleThemeEvent);

    // Also subscribe directly to OS color scheme changes as a safety net
    const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const handleMediaChange = () => {
      const currentMode = readStoredMode();
      if (currentMode === 'auto') {
        const sysTheme = getSystemTheme();
        syncFromExternal('auto', sysTheme);
      }
    };

    if (mql) {
      if (mql.addEventListener) {
        mql.addEventListener('change', handleMediaChange);
      } else if (mql.addListener) {
        mql.addListener(handleMediaChange);
      }
    }

    return () => {
      window.removeEventListener('appthemechange', handleThemeEvent);
      if (mql) {
        if (mql.removeEventListener) {
          mql.removeEventListener('change', handleMediaChange);
        } else if (mql.removeListener) {
          mql.removeListener(handleMediaChange);
        }
      }
    };
  }, []);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Shift+Click resets to automatic OS system preference
    if (e.shiftKey) {
      if (typeof window.setAppThemeMode === 'function') {
        window.setAppThemeMode('auto');
      } else {
        try {
          localStorage.setItem('da101_theme_mode', 'auto');
        } catch {
          // Ignore storage errors
        }
        const sysTheme = getSystemTheme();
        document.documentElement.classList.toggle('dark', sysTheme === 'dark');
        document.documentElement.classList.toggle('light', sysTheme === 'light');
        document.documentElement.setAttribute('data-theme', sysTheme);
        setMode('auto');
        setEffectiveTheme(sysTheme);
        if (prevEffectiveRef.current !== sysTheme) {
          prevEffectiveRef.current = sysTheme;
          setRotation((r) => r + 180);
        }
      }
      return;
    }

    const nextTheme: EffectiveTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    if (typeof window.setAppThemeMode === 'function') {
      window.setAppThemeMode(nextTheme);
    } else {
      try {
        localStorage.setItem('da101_theme_mode', nextTheme);
        localStorage.setItem('da101_theme', nextTheme);
      } catch {
        // Ignore storage errors
      }
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      document.documentElement.classList.toggle('light', nextTheme === 'light');
      document.documentElement.setAttribute('data-theme', nextTheme);
      setMode(nextTheme);
      setEffectiveTheme(nextTheme);
      if (prevEffectiveRef.current !== nextTheme) {
        prevEffectiveRef.current = nextTheme;
        setRotation((r) => r + 180);
      }
    }
  };

  const isDark = effectiveTheme === 'dark';
  const modeSuffix = mode === 'auto' ? ' (System)' : '';
  const nextLabel = isDark ? 'Light' : 'Dark';
  const titleText = `${isDark ? 'Dark' : 'Light'} mode${modeSuffix} — Click to switch to ${nextLabel} (Shift+Click for System)`;

  const variantClass =
    variant === 'excel'
      ? 'da-theme-toggle-excel'
      : variant === 'ordering'
        ? 'da-theme-toggle-ordering'
        : 'da-theme-toggle-default';

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className={`da-theme-toggle-btn no-ripple ${variantClass}`}
      aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
      aria-pressed={isDark}
      title={titleText}
      data-theme-mode={mode}
      data-effective-theme={effectiveTheme}
    >
      <motion.span
        className="da-theme-toggle-icon"
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              className="da-theme-icon-inner da-theme-icon-moon"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              <MoonIcon />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              className="da-theme-icon-inner da-theme-icon-sun"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              <SunIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
      <span className="da-theme-toggle-label">
        {isDark ? 'Dark' : 'Light'}
      </span>
      {mode === 'auto' && (
        <span className="da-theme-auto-dot" title="Following system preference" />
      )}
    </motion.button>
  );
}
