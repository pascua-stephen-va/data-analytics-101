import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  M3_SPRING_EXPRESSIVE_BOUNCE,
  M3_SPRING_FAST_SPATIAL,
} from '../utils/m3Motion';

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

function getNextMode(current: ThemeMode): ThemeMode {
  if (current === 'light') return 'dark';
  if (current === 'dark') return 'auto';
  return 'light';
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

function AutoGlyph() {
  return (
    <span
      className="text-[13px] font-black leading-none tracking-tight select-none"
      aria-hidden="true"
    >
      A
    </span>
  );
}

export function ThemeToggle({ variant = 'default' }: ThemeToggleProps) {
  const initialMode = readStoredMode();
  const initialEffective = resolveTheme(initialMode);

  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(initialEffective);
  const [rotation, setRotation] = useState<number>(0);
  const prevModeRef = useRef<ThemeMode>(initialMode);

  useEffect(() => {
    const syncFromExternal = (nextMode: ThemeMode, nextEffective: EffectiveTheme) => {
      setMode(nextMode);
      setEffectiveTheme(nextEffective);
      if (prevModeRef.current !== nextMode) {
        prevModeRef.current = nextMode;
        setRotation((r) => r + 180);
      }
    };

    const handleThemeEvent = (e: Event) => {
      const detail = (
        e as CustomEvent<{ mode?: ThemeMode; effectiveTheme?: EffectiveTheme }>
      ).detail;
      if (detail?.effectiveTheme) {
        syncFromExternal(detail.mode ?? readStoredMode(), detail.effectiveTheme);
      } else {
        const currentMode = readStoredMode();
        syncFromExternal(currentMode, resolveTheme(currentMode));
      }
    };

    window.addEventListener('appthemechange', handleThemeEvent);

    const mql = window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
    const handleMediaChange = () => {
      const currentMode = readStoredMode();
      if (currentMode === 'auto') {
        const sysTheme = getSystemTheme();
        setEffectiveTheme(sysTheme);
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

  const handleClick = () => {
    const nextMode = getNextMode(mode);
    const nextEffective = resolveTheme(nextMode);

    if (typeof window.setAppThemeMode === 'function') {
      window.setAppThemeMode(nextMode);
    } else {
      try {
        localStorage.setItem('da101_theme_mode', nextMode);
        if (nextMode !== 'auto') {
          localStorage.setItem('da101_theme', nextMode);
        }
      } catch {
        // Ignore storage errors
      }
      document.documentElement.classList.toggle('dark', nextEffective === 'dark');
      document.documentElement.classList.toggle('light', nextEffective === 'light');
      document.documentElement.setAttribute('data-theme', nextEffective);
      setMode(nextMode);
      setEffectiveTheme(nextEffective);
      if (prevModeRef.current !== nextMode) {
        prevModeRef.current = nextMode;
        setRotation((r) => r + 180);
      }
    }
  };

  const nextMode = getNextMode(mode);
  const currentLabel =
    mode === 'auto'
      ? `Auto (${effectiveTheme === 'dark' ? 'Dark' : 'Light'})`
      : mode === 'dark'
        ? 'Dark'
        : 'Light';
  const nextLabel =
    nextMode === 'auto' ? 'Auto (System)' : nextMode === 'dark' ? 'Dark' : 'Light';
  const titleText = `Theme: ${currentLabel} — Click for ${nextLabel}`;

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
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      transition={M3_SPRING_FAST_SPATIAL}
      className={`da-theme-toggle-btn da-theme-toggle-circle no-ripple ${variantClass}`}
      aria-label={`Current theme ${currentLabel}. Switch to ${nextLabel}`}
      title={titleText}
      data-theme-mode={mode}
      data-effective-theme={effectiveTheme}
    >
      <motion.span
        className="da-theme-toggle-icon"
        animate={{ rotate: rotation }}
        transition={M3_SPRING_EXPRESSIVE_BOUNCE}
      >
        <AnimatePresence mode="wait" initial={false}>
          {mode === 'auto' ? (
            <motion.span
              key="auto"
              className="da-theme-icon-inner da-theme-icon-auto"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={M3_SPRING_FAST_SPATIAL}
            >
              <AutoGlyph />
            </motion.span>
          ) : mode === 'dark' ? (
            <motion.span
              key="moon"
              className="da-theme-icon-inner da-theme-icon-moon"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={M3_SPRING_FAST_SPATIAL}
            >
              <MoonIcon />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              className="da-theme-icon-inner da-theme-icon-sun"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={M3_SPRING_FAST_SPATIAL}
            >
              <SunIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}
