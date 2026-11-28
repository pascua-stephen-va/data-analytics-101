import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  M3_SPRING_DEFAULT_SPATIAL,
  M3_SPRING_FAST_SPATIAL,
  M3_TAP_PRESS,
} from '../utils/m3Motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  useActiveCurriculumModule,
  useCurriculumProgress,
  useIsDarkTheme,
  type CurriculumModuleId,
  type ModuleProgressItem,
} from '../utils/curriculumProgress';
import { useAccess } from '../context/AccessContext';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ModuleProgressItem }>;
  isDark: boolean;
  allowedModules: CurriculumModuleId[];
}

function ProgressTooltip({
  active,
  payload,
  isDark,
  allowedModules,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  const isLocked = allowedModules.length > 0 && !allowedModules.includes(item.id);

  return (
    <div
      className="da-analytics-tooltip"
      style={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: isDark
          ? '0 12px 28px rgba(0, 0, 0, 0.45)'
          : '0 10px 24px rgba(15, 23, 42, 0.12)',
        minWidth: '196px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: isDark ? '#f8fafc' : '#0f172a',
          }}
        >
          {item.title}
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            fontVariantNumeric: 'tabular-nums',
            color: isLocked ? '#94a3b8' : item.accentColor,
          }}
        >
          {isLocked ? 'Locked' : `${item.percentage}%`}
        </span>
      </div>

      <div
        style={{
          fontSize: '11.5px',
          color: isDark ? '#94a3b8' : '#475569',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <span>Passed</span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 600,
              color: isDark ? '#e2e8f0' : '#0f172a',
            }}
          >
            {item.passed} / {item.total}
          </span>
        </div>
        {item.wrong > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span>Needs retry</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 600,
                color: '#f59e0b',
              }}
            >
              {item.wrong}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <span>Status</span>
          <span style={{ fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155' }}>
            {isLocked ? 'Locked by class code' : item.status}
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: '7px',
          paddingTop: '6px',
          borderTop: `1px solid ${isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.08)'}`,
          fontSize: '10.5px',
          color: '#64748b',
        }}
      >
        {isLocked
          ? 'Not included in your current class access code'
          : 'Click bar to inspect module lessons'}
      </div>
    </div>
  );
}

export function CurriculumAnalyticsDashboard() {
  const summary = useCurriculumProgress();
  const activeModuleId = useActiveCurriculumModule();
  const isDark = useIsDarkTheme();
  const { allowedModules, isInstructor } = useAccess();
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;

    const updateSize = () => {
      const { width, height } = el.getBoundingClientRect();
      setChartSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);

    const handleTabChange = () => {
      window.requestAnimationFrame(updateSize);
    };
    window.addEventListener('portaltabchange', handleTabChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('portaltabchange', handleTabChange);
    };
  }, []);

  const isModuleAllowed = (moduleId: CurriculumModuleId) =>
    isInstructor || allowedModules.includes(moduleId);

  const accessibleModules = summary.modules.filter((m) =>
    isModuleAllowed(m.id),
  );
  const recommendedModule =
    accessibleModules.find((m) => m.status !== 'Completed') ?? null;

  const handleSelectModule = (moduleId: CurriculumModuleId) => {
    if (!isModuleAllowed(moduleId)) return;
    if (typeof window.selectCurriculumModule === 'function') {
      window.selectCurriculumModule(moduleId);
    }
  };

  const handleOpenLab = (moduleId: CurriculumModuleId, activityKey: string) => {
    if (!isModuleAllowed(moduleId)) return;
    if (typeof window.openActivity === 'function') {
      window.openActivity(activityKey);
    } else if (typeof window.switchPortalTab === 'function') {
      window.switchPortalTab('activities');
    }
  };

  const gridStroke = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.08)';
  const axisTickColor = isDark ? '#94a3b8' : '#475569';
  const labelColor = isDark ? '#e2e8f0' : '#0f172a';
  const trackFill = isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.045)';
  const cursorFill = isDark ? 'rgba(59, 130, 246, 0.07)' : 'rgba(59, 130, 246, 0.05)';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={M3_SPRING_DEFAULT_SPATIAL}
      aria-label="Curriculum Progress Analytics"
      className="da-analytics-dashboard rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151c2a] overflow-hidden"
    >
      {/* Top Header & Primary Action */}
      <div className="px-5 md:px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="space-y-0.5">
          <h2 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Curriculum Progress Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Completion percentage across all 4 modules · Click an unlocked bar to jump to its lessons
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {recommendedModule ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.025, y: -1 }}
              whileTap={M3_TAP_PRESS}
              transition={M3_SPRING_FAST_SPATIAL}
              onClick={() =>
                handleOpenLab(
                  recommendedModule.id,
                  recommendedModule.activityKey,
                )
              }
              className="da-analytics-cta inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <span>
                {summary.totalPassed === 0
                  ? `Start ${recommendedModule.moduleNumber} Lab`
                  : `Continue ${recommendedModule.moduleNumber}`}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.025, y: -1 }}
              whileTap={M3_TAP_PRESS}
              transition={M3_SPRING_FAST_SPATIAL}
              onClick={() => window.switchPortalTab?.('activities')}
              className="da-analytics-cta inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <span>View Completed Labs</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Unboxed KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-slate-800/80 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="px-5 md:px-6 py-4 flex items-baseline justify-between sm:block space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Overall Completion
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
              {summary.overallPercentage}%
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {summary.totalPassed}/{summary.totalExercises} passed
            </span>
          </div>
        </div>

        <div className="px-5 md:px-6 py-4 flex items-baseline justify-between sm:block space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Modules Mastered
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
              {summary.completedModulesCount} / {summary.modules.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {summary.completedModulesCount === summary.modules.length
                ? 'All modules complete'
                : `${accessibleModules.length} unlocked in class`}
            </span>
          </div>
        </div>

        <div className="px-5 md:px-6 py-4 flex items-baseline justify-between sm:block space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Recommended Focus
          </div>
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {recommendedModule ? recommendedModule.shortLabel : 'All Assigned Complete'}
            </span>
            {recommendedModule && (
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                {recommendedModule.percentage}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recharts Module Completion Bar Chart */}
      <div className="px-4 md:px-6 pt-5 pb-3">
        <div
          ref={chartContainerRef}
          className="w-full"
          style={{ width: '100%', height: 236, minWidth: 0 }}
        >
          {chartSize.width > 0 && chartSize.height > 0 && (
            <ResponsiveContainer width="100%" height={236} minWidth={0}>
              <BarChart
                data={summary.modules}
                margin={{ top: 24, right: 16, left: -12, bottom: 4 }}
                barCategoryGap="24%"
              >
                <CartesianGrid
                  strokeDasharray="3 4"
                  vertical={false}
                  stroke={gridStroke}
                />
                <XAxis
                  dataKey="chartLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: axisTickColor,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif",
                  }}
                  dy={6}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{
                    fill: axisTickColor,
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  width={48}
                />
                <ReferenceLine
                  y={100}
                  stroke={isDark ? 'rgba(52, 211, 153, 0.35)' : 'rgba(16, 185, 129, 0.35)'}
                  strokeDasharray="4 4"
                />
                <Tooltip
                  cursor={{ fill: cursorFill, radius: 8 }}
                  content={
                    <ProgressTooltip
                      isDark={isDark}
                      allowedModules={
                        isInstructor
                          ? summary.modules.map((m) => m.id)
                          : allowedModules
                      }
                    />
                  }
                />
                <Bar
                  dataKey="percentage"
                  radius={[8, 8, 4, 4]}
                  maxBarSize={58}
                  background={{ fill: trackFill, radius: 8 }}
                  animationDuration={550}
                  animationEasing="ease-out"
                  onClick={(barData) => {
                    const modId = (barData as unknown as { id?: CurriculumModuleId })?.id;
                    if (modId) handleSelectModule(modId);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {summary.modules.map((entry) => {
                    const unlocked = isModuleAllowed(entry.id);
                    const isSelected = entry.id === activeModuleId && unlocked;
                    return (
                      <Cell
                        key={entry.id}
                        fill={unlocked ? entry.accentColor : '#64748b'}
                        fillOpacity={!unlocked ? 0.28 : isSelected ? 1 : 0.78}
                        stroke={isSelected ? entry.accentColor : 'none'}
                        strokeWidth={isSelected ? 1.5 : 0}
                      />
                    );
                  })}
                  <LabelList
                    dataKey="percentage"
                    position="top"
                    offset={8}
                    formatter={(val: unknown) => `${Number(val ?? 0)}%`}
                    style={{
                      fill: labelColor,
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {summary.totalAttempted === 0 && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1 pb-2">
            No exercises recorded yet — study an unlocked module below or launch a practical lab to track your progress.
          </p>
        )}
      </div>

      {/* Compact Module Breakdown Strip */}
      <div className="px-5 md:px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-2.5">
        {summary.modules.map((mod) => {
          const unlocked = isModuleAllowed(mod.id);
          const isSelected = mod.id === activeModuleId && unlocked;
          return (
            <div
              key={mod.id}
              className={`flex items-center justify-between gap-2 text-xs min-w-0 ${
                unlocked ? '' : 'opacity-55'
              }`}
            >
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => handleSelectModule(mod.id)}
                className="flex items-center gap-2 min-w-0 text-left cursor-pointer disabled:cursor-not-allowed group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                title={
                  unlocked
                    ? `View ${mod.title} lessons`
                    : `${mod.title} is locked by your current class access code`
                }
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{
                    backgroundColor: unlocked ? mod.accentColor : '#64748b',
                  }}
                  aria-hidden="true"
                />
                <span
                  className={`truncate transition-colors ${
                    isSelected
                      ? 'font-bold text-slate-900 dark:text-white'
                      : 'font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                >
                  {mod.moduleNumber}
                </span>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
                  {mod.passed}/{mod.total}
                </span>
                {unlocked ? (
                  <button
                    type="button"
                    onClick={() => handleOpenLab(mod.id, mod.activityKey)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    aria-label={`Open ${mod.title} practical lab`}
                  >
                    Lab
                  </button>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
