import { LayoutGroup, motion } from 'motion/react';
import {
  useActiveCurriculumModule,
  useCurriculumProgress,
  type CurriculumModuleId,
} from '../utils/curriculumProgress';

const MODULE_ICONS: Record<CurriculumModuleId, string> = {
  excel: 'ph-file-xls',
  sql_world: 'ph-globe-hemisphere-west',
  sql_ordering: 'ph-sort-ascending',
  sql_movies: 'ph-film-strip',
};

export function ModuleTabs() {
  const activeModuleId = useActiveCurriculumModule();
  const summary = useCurriculumProgress();

  const handleSelect = (moduleId: CurriculumModuleId) => {
    if (typeof window.selectCurriculumModule === 'function') {
      window.selectCurriculumModule(moduleId);
    }
  };

  return (
    <LayoutGroup id="curriculum-module-selector">
      <div
        role="tablist"
        aria-label="Curriculum module selection"
        className="da-module-tabs-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 rounded-[20px] bg-slate-200/70 dark:bg-[#0e1523] border border-slate-300/75 dark:border-slate-800/90"
      >
        {summary.modules.map((mod) => {
          const isActive = mod.id === activeModuleId;
          const iconClass = MODULE_ICONS[mod.id];

          return (
            <motion.button
              key={mod.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(mod.id)}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.14 }}
              className={`da-module-tab-btn no-ripple relative flex items-center justify-between gap-2.5 px-3.5 py-3 rounded-[14px] text-left cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive ? 'is-active' : ''
              }`}
            >
              {/* Gliding Framer Motion Active Tab Surface */}
              {isActive && (
                <motion.span
                  layoutId="curriculumModuleActiveSurface"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 32,
                    mass: 0.85,
                  }}
                  className="da-module-tab-active-bg absolute inset-0 rounded-[14px] pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* Gliding Bottom Accent Indicator Rail */}
              {isActive && (
                <motion.span
                  layoutId="curriculumModuleActiveRail"
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 34,
                    mass: 0.8,
                  }}
                  className="absolute bottom-1 left-4 right-4 h-[3px] rounded-full pointer-events-none"
                  style={{ backgroundColor: mod.accentColor }}
                  aria-hidden="true"
                />
              )}

              <div className="relative z-10 flex items-center gap-2.5 min-w-0">
                <i
                  className={`ph ${iconClass} text-lg shrink-0 transition-colors duration-200`}
                  style={{
                    color: isActive ? mod.accentColor : undefined,
                  }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="da-module-tab-title text-xs font-bold tracking-tight truncate">
                    {mod.title}
                  </div>
                  <div className="da-module-tab-sub text-[11px] font-medium truncate">
                    {mod.subtitle}
                  </div>
                </div>
              </div>

              <span
                className="da-module-tab-pct relative z-10 text-xs font-mono font-bold tabular-nums shrink-0"
                style={{
                  color: isActive ? mod.accentColor : undefined,
                }}
              >
                {mod.percentage}%
              </span>
            </motion.button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
