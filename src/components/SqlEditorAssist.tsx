import { useEffect, useState } from 'react';
import { useAccess } from '../context/AccessContext';

export type SqlLabKey = 'sql_world' | 'sql_ordering' | 'sql_movies';

interface TableSchema {
  name: string;
  columns: string[];
}

interface SqlLabConfig {
  textareaId: string;
  runBtnId: string;
  submitBtnId: string;
  tables: TableSchema[];
}

const SQL_LAB_CONFIGS: Record<SqlLabKey, SqlLabConfig> = {
  sql_world: {
    textareaId: 'sqlInput',
    runBtnId: 'btnRunCode',
    submitBtnId: 'btnSubmitQuery',
    tables: [
      {
        name: 'countries',
        columns: ['ccd', 'country', 'continent', 'population', 'area'],
      },
      {
        name: 'shapes',
        columns: ['id', 'shape', 'color', 'dots', 'xloc', 'yloc', 'scale'],
      },
      {
        name: 'hello',
        columns: ['lang', 'language', 'hello', 'direction'],
      },
    ],
  },
  sql_ordering: {
    textareaId: 'orderingSqlInput',
    runBtnId: 'btnOrderingRunCode',
    submitBtnId: 'btnOrderingSubmitQuery',
    tables: [
      {
        name: 'moons',
        columns: ['moon', 'planet', 'radius', 'density'],
      },
      {
        name: 'animals',
        columns: ['animal', 'diet', 'hours_sleep', 'weight'],
      },
      {
        name: 'countries',
        columns: ['ccd', 'country', 'continent', 'population', 'area'],
      },
    ],
  },
  sql_movies: {
    textareaId: 'moviesSqlInput',
    runBtnId: 'btnMoviesRunCode',
    submitBtnId: 'btnMoviesSubmitQuery',
    tables: [
      {
        name: 'movies',
        columns: ['imdbid', 'title', 'year', 'budget', 'revenue', 'mpaa', 'ravg'],
      },
    ],
  },
};

function insertTokenAtCursor(textareaId: string, token: string) {
  const el = document.getElementById(textareaId) as HTMLTextAreaElement | null;
  if (!el || el.disabled || el.readOnly) return;

  const value = el.value;
  const start = typeof el.selectionStart === 'number' ? el.selectionStart : value.length;
  const end = typeof el.selectionEnd === 'number' ? el.selectionEnd : value.length;

  const before = value.slice(0, start);
  const after = value.slice(end);
  const needsLeadingSpace = before.length > 0 && /[A-Za-z0-9_)]$/.test(before);
  const needsTrailingSpace = after.length > 0 && /^[A-Za-z0-9_(]/.test(after);

  const inserted = `${needsLeadingSpace ? ' ' : ''}${token}${needsTrailingSpace ? ' ' : ''}`;
  el.value = before + inserted + after;

  const nextPos = start + inserted.length;
  el.focus();
  try {
    el.setSelectionRange(nextPos, nextPos);
  } catch {
    // Ignore selection errors on hidden elements
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

export function SqlSchemaBar({ labId }: { labId: SqlLabKey }) {
  const config = SQL_LAB_CONFIGS[labId];
  const [activeTable, setActiveTable] = useState<string>(config.tables[0].name);
  const [recentToken, setRecentToken] = useState<string | null>(null);

  const selectedTable =
    config.tables.find((t) => t.name === activeTable) || config.tables[0];

  const handleInsert = (token: string) => {
    insertTokenAtCursor(config.textareaId, token);
    setRecentToken(token);
    window.setTimeout(() => {
      setRecentToken((prev) => (prev === token ? null : prev));
    }, 650);
  };

  return (
    <div
      className="px-3 py-1.5 border-b border-slate-200/80 dark:border-slate-800/90 bg-slate-50/90 dark:bg-slate-900/75 flex items-center gap-1.5 flex-wrap text-[11px] shrink-0"
      aria-label="Quick insert SQL table and column names"
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-0.5 flex items-center gap-1 shrink-0">
        <i className="ph ph-table text-xs" aria-hidden="true" />
        Schema:
      </span>

      {/* Table selector buttons */}
      {config.tables.map((tbl) => {
        const isSelected = tbl.name === selectedTable.name;
        return (
          <button
            key={tbl.name}
            type="button"
            title={`Select table "${tbl.name}" (double-click to insert table name)`}
            onClick={() => setActiveTable(tbl.name)}
            onDoubleClick={() => handleInsert(tbl.name)}
            className={`no-ripple px-2 py-0.5 rounded-md font-mono text-[11px] font-bold transition-colors cursor-pointer ${
              isSelected
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-700'
            }`}
          >
            {tbl.name}
          </button>
        );
      })}

      {/* Quick insert active table name */}
      <button
        type="button"
        title={`Insert table name "${selectedTable.name}" at cursor`}
        onClick={() => handleInsert(selectedTable.name)}
        className="no-ripple px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
      >
        + table
      </button>

      <span className="text-slate-300 dark:text-slate-700 select-none">|</span>

      {/* Column chips */}
      <div className="flex items-center gap-1 flex-wrap">
        {selectedTable.columns.map((col) => {
          const isJustInserted = recentToken === col;
          return (
            <button
              key={`${selectedTable.name}.${col}`}
              type="button"
              title={`Click to insert "${col}" at cursor`}
              onClick={() => handleInsert(col)}
              className={`no-ripple px-1.5 py-0.5 rounded font-mono text-[11px] border transition-colors cursor-pointer ${
                isJustInserted
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-300'
              }`}
            >
              {col}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SqlEditorStatusBar({ labId }: { labId: SqlLabKey }) {
  const config = SQL_LAB_CONFIGS[labId];
  const { examMode, recordLargePaste } = useAccess();
  const [cursor, setCursor] = useState({ line: 1, col: 1, chars: 0 });

  useEffect(() => {
    const textarea = document.getElementById(
      config.textareaId,
    ) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const updateCursor = () => {
      const value = textarea.value || '';
      const pos =
        typeof textarea.selectionStart === 'number'
          ? textarea.selectionStart
          : value.length;
      const before = value.slice(0, pos);
      const lines = before.split('\n');
      const line = lines.length;
      const col = (lines[lines.length - 1]?.length ?? 0) + 1;
      setCursor({ line, col, chars: value.length });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'Enter') return;
      if (e.defaultPrevented) return;
      e.preventDefault();
      e.stopPropagation();

      if (e.shiftKey) {
        const submitBtn = document.getElementById(
          config.submitBtnId,
        ) as HTMLButtonElement | null;
        if (submitBtn && !submitBtn.disabled) {
          submitBtn.click();
        }
      } else {
        const runBtn = document.getElementById(
          config.runBtnId,
        ) as HTMLButtonElement | null;
        if (runBtn && !runBtn.disabled) {
          runBtn.click();
        }
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const pasted = e.clipboardData?.getData('text') || '';
      if (pasted.trim().length >= 25) {
        recordLargePaste();
      }
      window.setTimeout(updateCursor, 0);
    };

    updateCursor();
    textarea.addEventListener('input', updateCursor);
    textarea.addEventListener('keyup', updateCursor);
    textarea.addEventListener('click', updateCursor);
    textarea.addEventListener('focus', updateCursor);
    textarea.addEventListener('keydown', handleKeyDown, true);
    textarea.addEventListener('paste', handlePaste);

    return () => {
      textarea.removeEventListener('input', updateCursor);
      textarea.removeEventListener('keyup', updateCursor);
      textarea.removeEventListener('click', updateCursor);
      textarea.removeEventListener('focus', updateCursor);
      textarea.removeEventListener('keydown', handleKeyDown, true);
      textarea.removeEventListener('paste', handlePaste);
    };
  }, [config.runBtnId, config.submitBtnId, config.textareaId, recordLargePaste]);

  return (
    <div className="px-3 py-1 border-t border-slate-200/80 dark:border-slate-800/90 bg-slate-50/90 dark:bg-slate-900/85 flex items-center justify-between gap-2 text-[10.5px] font-mono text-slate-500 dark:text-slate-400 shrink-0 select-none">
      <div className="flex items-center gap-3 tabular-nums">
        <span>
          Ln {cursor.line}, Col {cursor.col}
        </span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span>{cursor.chars} chars</span>
        {examMode === 'exam' && (
          <>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-sans font-bold text-[10px]">
              <i className="ph ph-shield-check text-xs" aria-hidden="true" />
              Exam Mode (Hints Hidden)
            </span>
          </>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-2.5 text-[10px] font-sans text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 border border-slate-300/70 dark:border-slate-700 font-mono text-[9.5px] text-slate-700 dark:text-slate-300">
            Ctrl+Enter
          </kbd>
          Run
        </span>
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 border border-slate-300/70 dark:border-slate-700 font-mono text-[9.5px] text-slate-700 dark:text-slate-300">
            Ctrl+Shift+Enter
          </kbd>
          Submit
        </span>
      </div>
    </div>
  );
}
