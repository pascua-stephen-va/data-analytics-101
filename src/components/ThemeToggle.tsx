import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

export type ResolvedTheme = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';
export type ThemeToggleVariant = 'default' | 'excel' | 'ordering';

const STORAGE_KEY_MODE = 'da101_theme_mode';
const STORAGE_KEY_LEGACY = 'da101_theme';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

declare global {
  interface Window {
    setAppThemeMode?: (mode: 'light' | 'dark' | 'auto' | 'system') => void;
    toggleAppTheme?: () => void;
    resetAppThemeToSystem?: () => void;
    handleSQLInput?: () => void;
    handleOrderingSQLInput?: () => void;
    handleMoviesSQLInput?: () => void;
  }
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
  }
  return 'dark';
}

function readStoredPreference(): ThemePreference {
  try {
    const mode = localStorage.getItem(STORAGE_KEY_MODE);
    if (mode === 'light' || mode === 'dark') {
      return mode;
    }
    if (mode === 'auto' || mode === 'system') {
      return 'system';
    }
    const legacy = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (legacy === 'light' || legacy === 'dark') {
      return legacy;
    }
  } catch {
    // Ignore storage access errors (e.g., restricted iframes / private mode)
  }
  return 'system';
}

function persistPreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') {
      localStorage.removeItem(STORAGE_KEY_MODE);
      localStorage.removeItem(STORAGE_KEY_LEGACY);
    } else {
      localStorage.setItem(STORAGE_KEY_MODE, preference);
      localStorage.setItem(STORAGE_KEY_LEGACY, preference);
    }
  } catch {
    // Ignore storage access errors
  }
}

function applyThemeToDocument(
  resolvedTheme: ResolvedTheme,
  preference: ThemePreference
): void {
  const isDark = resolvedTheme === 'dark';
  const root = document.documentElement;

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
  }
  root.setAttribute('data-theme-source', preference);

  try {
    window.dispatchEvent(
      new CustomEvent('appthemechange', {
        detail: {
          mode: preference === 'system' ? 'auto' : preference,
          effectiveTheme: resolvedTheme,
          isDark,
        },
      })
    );
    if (typeof window.handleSQLInput === 'function') window.handleSQLInput();
    if (typeof window.handleOrderingSQLInput === 'function')
      window.handleOrderingSQLInput();
    if (typeof window.handleMoviesSQLInput === 'function')
      window.handleMoviesSQLInput();
  } catch {
    // Ignore listener side-effect errors
  }
}

interface ThemeContextValue {
  preference: ThemePreference;
  systemTheme: ResolvedTheme;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  isSystem: boolean;
  toggleTheme: () => void;
  setPreference: (next: ThemePreference) => void;
  resetToSystem: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    readStoredPreference()
  );
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    getSystemTheme()
  );

  const resolvedTheme: ResolvedTheme =
    preference === 'system' ? systemTheme : preference;
  const isDark = resolvedTheme === 'dark';
  const isSystem = preference === 'system';

  // Apply theme to <html> whenever resolvedTheme or preference changes
  useEffect(() => {
    applyThemeToDocument(resolvedTheme, preference);
  }, [resolvedTheme, preference]);

  // Listen dynamically for OS color scheme preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);

    const handleSystemChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    // Sync immediately in case system theme changed before effect ran
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }

    // Legacy Safari fallback
    mediaQuery.addListener(handleSystemChange);
    return () => mediaQuery.removeListener(handleSystemChange);
  }, []);

  // Keep multiple browser tabs synchronized via localStorage events
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === STORAGE_KEY_MODE ||
        event.key === STORAGE_KEY_LEGACY ||
        event.key === null
      ) {
        setPreferenceState(readStoredPreference());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    persistPreference(next);
    setPreferenceState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: ResolvedTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    persistPreference(nextTheme);
    setPreferenceState(nextTheme);
  }, [resolvedTheme]);

  const resetToSystem = useCallback(() => {
    persistPreference('system');
    setPreferenceState('system');
  }, []);

  // Expose global compatibility hooks for vanilla scripts
  useEffect(() => {
    window.setAppThemeMode = (mode) => {
      if (mode === 'light' || mode === 'dark') {
        setPreference(mode);
      } else {
        resetToSystem();
      }
    };
    window.toggleAppTheme = toggleTheme;
    window.resetAppThemeToSystem = resetToSystem;
  }, [setPreference, toggleTheme, resetToSystem]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      systemTheme,
      resolvedTheme,
      isDark,
      isSystem,
      toggleTheme,
      setPreference,
      resetToSystem,
    }),
    [
      preference,
      systemTheme,
      resolvedTheme,
      isDark,
      isSystem,
      toggleTheme,
      setPreference,
      resetToSystem,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

const VARIANT_CLASSES: Record<
  ThemeToggleVariant,
  { dark: string; light: string }
> = {
  default: {
    dark: 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/90 text-sky-300 shadow-inner focus-visible:ring-sky-400/60',
    light:
      'bg-slate-100 hover:bg-slate-200/90 border-slate-300/90 text-amber-500 shadow-xs focus-visible:ring-amber-400/60',
  },
  excel: {
    dark: 'bg-emerald-950/80 hover:bg-emerald-900/90 border-emerald-700/70 text-emerald-200 shadow-inner focus-visible:ring-emerald-400/60',
    light:
      'bg-emerald-950/75 hover:bg-emerald-900/90 border-emerald-600/70 text-amber-300 shadow-inner focus-visible:ring-amber-300/60',
  },
  ordering: {
    dark: 'bg-indigo-950/80 hover:bg-indigo-900/90 border-indigo-700/70 text-sky-300 shadow-inner focus-visible:ring-sky-400/60',
    light:
      'bg-indigo-950/75 hover:bg-indigo-900/90 border-indigo-600/70 text-amber-300 shadow-inner focus-visible:ring-amber-300/60',
  },
};

export function ThemeToggleButton({
  variant = 'default',
}: {
  variant?: ThemeToggleVariant;
}) {
  const { isDark, isSystem, toggleTheme, resetToSystem } = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.altKey) {
      resetToSystem();
      return;
    }
    toggleTheme();
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    resetToSystem();
  };

  const nextModeLabel = isDark ? 'Light' : 'Dark';
  const sourceLabel = isSystem ? 'System' : 'Manual';
  const ariaLabel = `Switch to ${nextModeLabel} mode (currently ${
    isDark ? 'Dark' : 'Light'
  }, ${sourceLabel})`;
  const titleText = isSystem
    ? `Switch to ${nextModeLabel} mode (Following system theme)`
    : `Switch to ${nextModeLabel} mode (Manual override · Right-click or Alt+Click to follow system)`;

  const colorClasses = VARIANT_CLASSES[variant][isDark ? 'dark' : 'light'];

  return (
    <motion.button
      type="button"
      data-no-ripple="true"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      aria-label={ariaLabel}
      aria-pressed={isDark}
      title={titleText}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 450, damping: 24 }}
      className={`theme-toggle-btn relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200 focus:outline-none focus-visible:ring-2 ${colorClasses}`}
    >
      <span className="relative flex h-5 w-5 items-center justify-center overflow-visible">
        <AnimatePresence mode="popLayout" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -180, opacity: 0, scale: 0.55 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 180, opacity: 0, scale: 0.55 }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 20,
                mass: 0.85,
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <MoonIcon />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: -180, opacity: 0, scale: 0.55 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 180, opacity: 0, scale: 0.55 }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 20,
                mass: 0.85,
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <SunIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

interface MountPoint {
  element: HTMLElement;
  variant: ThemeToggleVariant;
}

export function ThemeTogglePortalHost() {
  const [mounts, setMounts] = useState<MountPoint[]>([]);

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-theme-toggle-mount]')
    );
    const resolved: MountPoint[] = nodes.map((element) => {
      const rawVariant = element.getAttribute('data-theme-toggle-variant');
      const variant: ThemeToggleVariant =
        rawVariant === 'excel' || rawVariant === 'ordering'
          ? rawVariant
          : 'default';
      return { element, variant };
    });
    setMounts(resolved);
  }, []);

  return (
    <ThemeProvider>
      {mounts.map(({ element, variant }, index) =>
        createPortal(
          <ThemeToggleButton variant={variant} />,
          element,
          `theme-toggle-${index}`
        )
      )}
    </ThemeProvider>
  );
}
