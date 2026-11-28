import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  M3_DROPDOWN_MOTION,
  M3_SPRING_FAST_SPATIAL,
  M3_TAP_PRESS,
} from '../utils/m3Motion';

export type HeaderToolsLabId = 'sql_world' | 'excel' | 'sql_ordering' | 'sql_movies';

interface ToolsMenuItem {
  id?: string;
  label: string;
  iconClass: string;
  iconColorClass: string;
  onSelect: () => void;
}

declare global {
  interface Window {
    resetLab?: () => void;
    openExcelShortcutsModal?: () => void;
    openExcelCheatSheetModal?: () => void;
    resetExcelLab?: () => void;
    resetOrderingLab?: () => void;
    resetMoviesLab?: () => void;
  }
}

interface HeaderToolsMenuProps {
  labId: HeaderToolsLabId;
}

function getItemsForLab(labId: HeaderToolsLabId): ToolsMenuItem[] {
  if (labId === 'excel') {
    return [
      {
        label: 'Keyboard Shortcuts',
        iconClass: 'ph-keyboard',
        iconColorClass: 'text-emerald-400',
        onSelect: () => window.openExcelShortcutsModal?.(),
      },
      {
        label: 'Formula Cheat Sheet',
        iconClass: 'ph-function',
        iconColorClass: 'text-sky-400',
        onSelect: () => window.openExcelCheatSheetModal?.(),
      },
      {
        label: 'Reset Dataset',
        iconClass: 'ph-arrow-clockwise',
        iconColorClass: 'text-amber-400',
        onSelect: () => window.resetExcelLab?.(),
      },
    ];
  }

  if (labId === 'sql_ordering') {
    return [
      {
        label: 'Reset Exercise',
        iconClass: 'ph-arrow-clockwise',
        iconColorClass: 'text-sky-400',
        onSelect: () => window.resetOrderingLab?.(),
      },
    ];
  }

  if (labId === 'sql_movies') {
    return [
      {
        label: 'Reset Exercise',
        iconClass: 'ph-arrow-clockwise',
        iconColorClass: 'text-sky-400',
        onSelect: () => window.resetMoviesLab?.(),
      },
    ];
  }

  return [
    {
      id: 'btnResetLab',
      label: 'Reset Exercise',
      iconClass: 'ph-arrow-clockwise',
      iconColorClass: 'text-sky-400',
      onSelect: () => window.resetLab?.(),
    },
    {
      id: 'btnInfoModal',
      label: 'Help & Info',
      iconClass: 'ph-question',
      iconColorClass: 'text-amber-400',
      onSelect: () =>
        window.showNotification?.(
          'Data Analytics 101: Write SQL queries, test using Run Code, and click Submit to check your solution.',
        ),
    },
  ];
}

export function HeaderToolsMenu({ labId }: HeaderToolsMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        e.target instanceof Node &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const items = getItemsForLab(labId);

  const buttonTone =
    labId === 'excel'
      ? 'border-emerald-600/70 text-emerald-100 hover:bg-emerald-800/60'
      : labId === 'sql_ordering'
        ? 'border-indigo-600/70 text-indigo-100 hover:bg-indigo-800/60'
        : 'border-slate-700 text-slate-200 hover:bg-slate-800';

  return (
    <div ref={containerRef} className="da-tools-dropdown relative inline-flex items-center">
      <motion.button
        type="button"
        whileTap={M3_TAP_PRESS}
        transition={M3_SPRING_FAST_SPATIAL}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        title={labId === 'excel' ? 'Excel Lab Tools' : 'Lab Tools'}
        className={`no-ripple inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-bold bg-slate-900/40 transition-colors cursor-pointer select-none ${buttonTone}`}
      >
        <i className="ph ph-wrench text-sm" aria-hidden="true" />
        <span className="hidden sm:inline">Tools</span>
        <motion.i
          animate={{ rotate: open ? 180 : 0 }}
          transition={M3_SPRING_FAST_SPATIAL}
          className="ph ph-caret-down text-[11px] opacity-80 inline-block"
          aria-hidden="true"
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...M3_DROPDOWN_MOTION}
            style={{ transformOrigin: 'top right' }}
            role="menu"
            className="da-tools-menu"
          >
            {items.map((item) => (
              <motion.button
                key={item.label}
                id={item.id}
                type="button"
                role="menuitem"
                whileTap={{ scale: 0.97 }}
                transition={M3_SPRING_FAST_SPATIAL}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className="da-tools-menu-item no-ripple"
              >
                <i
                  className={`ph ${item.iconClass} ${item.iconColorClass} text-sm`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
