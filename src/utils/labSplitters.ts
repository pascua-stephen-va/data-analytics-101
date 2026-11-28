/**
 * Desktop draggable split-pane engine for all 4 Data Analytics 101 labs.
 * - Horizontal Left/Right dividers for all 4 labs (Excel, World SQL, Ordering, Movies)
 * - Vertical Editor/Results dividers for all 3 SQL labs
 * - Persists user ratios in localStorage, supports keyboard arrows & double-click reset
 * - Automatically yields on mobile (<768px) so stacked layouts remain intact
 */

interface HorizontalSplitConfig {
  id: string;
  containerSelector: string;
  leftSelector: string;
  rightSelector: string;
  defaultLeftPct: number;
  minLeftPct: number;
  maxLeftPct: number;
}

interface VerticalSplitConfig {
  id: string;
  containerSelector: string;
  topSelector: string;
  bottomSelector: string;
  defaultTopPct: number;
  minTopPct: number;
  maxTopPct: number;
}

const STORAGE_PREFIX = 'da101_split_v1_';
const DESKTOP_MIN_WIDTH = 768;

function readSavedPct(id: string, fallback: number, min: number, max: number): number {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (!raw) return fallback;
    const num = Number(raw);
    if (Number.isFinite(num) && num >= min && num <= max) return num;
  } catch {
    // Ignore storage issues
  }
  return fallback;
}

function savePct(id: string, pct: number): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, String(Math.round(pct * 10) / 10));
  } catch {
    // Ignore storage issues
  }
}

function clearSavedPct(id: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
  } catch {
    // Ignore storage issues
  }
}

function mountHorizontalSplitter(cfg: HorizontalSplitConfig): (() => void) | null {
  const container = document.querySelector<HTMLElement>(cfg.containerSelector);
  const left = document.querySelector<HTMLElement>(cfg.leftSelector);
  const right = document.querySelector<HTMLElement>(cfg.rightSelector);
  if (!container || !left || !right) return null;
  if (container.querySelector(`[data-da-splitter="${cfg.id}"]`)) return null;

  const handle = document.createElement('div');
  handle.className = 'da-split-handle da-split-handle-h';
  handle.dataset.daSplitter = cfg.id;
  handle.setAttribute('role', 'separator');
  handle.setAttribute('aria-orientation', 'vertical');
  handle.setAttribute('aria-label', 'Resize instructions and workspace panels (double-click to reset)');
  handle.setAttribute('tabindex', '0');
  handle.title = 'Drag to resize panels · Double-click to reset';

  const grip = document.createElement('span');
  grip.className = 'da-split-grip-v';
  grip.setAttribute('aria-hidden', 'true');
  handle.appendChild(grip);

  // Insert directly between left and right panes
  left.insertAdjacentElement('afterend', handle);

  let currentPct = readSavedPct(cfg.id, cfg.defaultLeftPct, cfg.minLeftPct, cfg.maxLeftPct);

  const applyWidth = (pct: number | null) => {
    if (window.innerWidth < DESKTOP_MIN_WIDTH || pct === null) {
      left.style.width = '';
      left.style.flexBasis = '';
      right.style.flex = '';
      right.style.width = '';
      return;
    }
    const clamped = Math.min(cfg.maxLeftPct, Math.max(cfg.minLeftPct, pct));
    currentPct = clamped;
    left.style.width = `${clamped}%`;
    left.style.flexBasis = `${clamped}%`;
    right.style.flex = '1 1 0%';
    right.style.width = 'auto';
    handle.setAttribute('aria-valuenow', String(Math.round(clamped)));
  };

  // Only apply saved override if user previously dragged it
  const hasSaved = (() => {
    try {
      return localStorage.getItem(`${STORAGE_PREFIX}${cfg.id}`) !== null;
    } catch {
      return false;
    }
  })();
  if (hasSaved) {
    applyWidth(currentPct);
  }

  let isDragging = false;

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    applyWidth(pct);
  };

  const stopDragging = () => {
    if (!isDragging) return;
    isDragging = false;
    handle.classList.remove('is-dragging');
    document.body.classList.remove('da-resizing-col');
    savePct(cfg.id, currentPct);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', stopDragging);
    window.removeEventListener('pointercancel', stopDragging);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (window.innerWidth < DESKTOP_MIN_WIDTH) return;
    e.preventDefault();
    isDragging = true;
    handle.classList.add('is-dragging');
    document.body.classList.add('da-resizing-col');
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
  };

  const onDblClick = () => {
    clearSavedPct(cfg.id);
    currentPct = cfg.defaultLeftPct;
    applyWidth(null);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (window.innerWidth < DESKTOP_MIN_WIDTH) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      applyWidth(currentPct - 2.5);
      savePct(cfg.id, currentPct);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      applyWidth(currentPct + 2.5);
      savePct(cfg.id, currentPct);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onDblClick();
    }
  };

  const onResize = () => {
    if (window.innerWidth < DESKTOP_MIN_WIDTH) {
      applyWidth(null);
    } else if (localStorage.getItem(`${STORAGE_PREFIX}${cfg.id}`) !== null) {
      applyWidth(currentPct);
    }
  };

  handle.addEventListener('pointerdown', onPointerDown);
  handle.addEventListener('dblclick', onDblClick);
  handle.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);

  return () => {
    handle.removeEventListener('pointerdown', onPointerDown);
    handle.removeEventListener('dblclick', onDblClick);
    handle.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onResize);
    stopDragging();
    handle.remove();
  };
}

function mountVerticalSplitter(cfg: VerticalSplitConfig): (() => void) | null {
  const container = document.querySelector<HTMLElement>(cfg.containerSelector);
  const top = document.querySelector<HTMLElement>(cfg.topSelector);
  const bottom = document.querySelector<HTMLElement>(cfg.bottomSelector);
  if (!container || !top || !bottom) return null;
  if (container.querySelector(`[data-da-splitter="${cfg.id}"]`)) return null;

  const handle = document.createElement('div');
  handle.className = 'da-split-handle da-split-handle-v';
  handle.dataset.daSplitter = cfg.id;
  handle.setAttribute('role', 'separator');
  handle.setAttribute('aria-orientation', 'horizontal');
  handle.setAttribute('aria-label', 'Resize SQL editor and results panes (double-click to reset)');
  handle.setAttribute('tabindex', '0');
  handle.title = 'Drag to resize SQL editor & results · Double-click to reset';

  const grip = document.createElement('span');
  grip.className = 'da-split-grip-h';
  grip.setAttribute('aria-hidden', 'true');
  handle.appendChild(grip);

  top.insertAdjacentElement('afterend', handle);

  let currentPct = readSavedPct(cfg.id, cfg.defaultTopPct, cfg.minTopPct, cfg.maxTopPct);

  const applyHeight = (pct: number | null) => {
    if (pct === null) {
      top.style.height = '';
      top.style.flex = '';
      bottom.style.height = '';
      bottom.style.flex = '';
      return;
    }
    const clamped = Math.min(cfg.maxTopPct, Math.max(cfg.minTopPct, pct));
    currentPct = clamped;
    top.style.height = `${clamped}%`;
    top.style.flex = '0 0 auto';
    bottom.style.height = 'auto';
    bottom.style.flex = '1 1 0%';
    handle.setAttribute('aria-valuenow', String(Math.round(clamped)));
  };

  const hasSaved = (() => {
    try {
      return localStorage.getItem(`${STORAGE_PREFIX}${cfg.id}`) !== null;
    } catch {
      return false;
    }
  })();
  if (hasSaved) {
    applyHeight(currentPct);
  }

  let isDragging = false;

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const rect = container.getBoundingClientRect();
    if (rect.height <= 0) return;
    const pct = ((e.clientY - rect.top) / rect.height) * 100;
    applyHeight(pct);
  };

  const stopDragging = () => {
    if (!isDragging) return;
    isDragging = false;
    handle.classList.remove('is-dragging');
    document.body.classList.remove('da-resizing-row');
    savePct(cfg.id, currentPct);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', stopDragging);
    window.removeEventListener('pointercancel', stopDragging);
  };

  const onPointerDown = (e: PointerEvent) => {
    e.preventDefault();
    isDragging = true;
    handle.classList.add('is-dragging');
    document.body.classList.add('da-resizing-row');
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
  };

  const onDblClick = () => {
    clearSavedPct(cfg.id);
    currentPct = cfg.defaultTopPct;
    applyHeight(null);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      applyHeight(currentPct - 3);
      savePct(cfg.id, currentPct);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      applyHeight(currentPct + 3);
      savePct(cfg.id, currentPct);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onDblClick();
    }
  };

  handle.addEventListener('pointerdown', onPointerDown);
  handle.addEventListener('dblclick', onDblClick);
  handle.addEventListener('keydown', onKeyDown);

  return () => {
    handle.removeEventListener('pointerdown', onPointerDown);
    handle.removeEventListener('dblclick', onDblClick);
    handle.removeEventListener('keydown', onKeyDown);
    stopDragging();
    handle.remove();
  };
}

export function initAllLabSplitters(): () => void {
  const cleanups: Array<() => void> = [];

  const horizontalConfigs: HorizontalSplitConfig[] = [
    {
      id: 'excel-h',
      containerSelector: '#excelLabSplitContainer',
      leftSelector: '#excelLeftPaneColumn',
      rightSelector: '#excelRightPaneColumn',
      defaultLeftPct: 33,
      minLeftPct: 24,
      maxLeftPct: 55,
    },
    {
      id: 'sql-world-h',
      containerSelector: '#sqlWorldSplitContainer',
      leftSelector: '#leftColumn',
      rightSelector: '#rightColumn',
      defaultLeftPct: 35,
      minLeftPct: 24,
      maxLeftPct: 58,
    },
    {
      id: 'sql-ordering-h',
      containerSelector: '#orderingSplitContainer',
      leftSelector: '#orderingLeftPaneContainer',
      rightSelector: '#orderingRightColumn',
      defaultLeftPct: 35,
      minLeftPct: 24,
      maxLeftPct: 58,
    },
    {
      id: 'sql-movies-h',
      containerSelector: '#moviesSplitContainer',
      leftSelector: '#moviesLeftPaneContainer',
      rightSelector: '#moviesRightColumn',
      defaultLeftPct: 35,
      minLeftPct: 24,
      maxLeftPct: 58,
    },
  ];

  const verticalConfigs: VerticalSplitConfig[] = [
    {
      id: 'sql-world-v',
      containerSelector: '#rightColumn',
      topSelector: '#sqlWorldEditorHalf',
      bottomSelector: '#sqlWorldResultsHalf',
      defaultTopPct: 48,
      minTopPct: 26,
      maxTopPct: 74,
    },
    {
      id: 'sql-ordering-v',
      containerSelector: '#orderingRightColumn',
      topSelector: '#orderingEditorHalf',
      bottomSelector: '#orderingResultsHalf',
      defaultTopPct: 50,
      minTopPct: 26,
      maxTopPct: 74,
    },
    {
      id: 'sql-movies-v',
      containerSelector: '#moviesRightColumn',
      topSelector: '#moviesEditorHalf',
      bottomSelector: '#moviesResultsHalf',
      defaultTopPct: 50,
      minTopPct: 26,
      maxTopPct: 74,
    },
  ];

  for (const cfg of horizontalConfigs) {
    const cleanup = mountHorizontalSplitter(cfg);
    if (cleanup) cleanups.push(cleanup);
  }
  for (const cfg of verticalConfigs) {
    const cleanup = mountVerticalSplitter(cfg);
    if (cleanup) cleanups.push(cleanup);
  }

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
