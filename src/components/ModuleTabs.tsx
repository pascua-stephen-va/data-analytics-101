import { LayoutGroup, motion } from 'motion/react';
import {
  useActiveCurriculumModule,
  useCurriculumProgress,
  type CurriculumModuleId,
} from '../utils/curriculumProgress';
import { useAccess } from '../context/AccessContext';
import {
  M3_SPRING_DEFAULT_SPATIAL,
  M3_SPRING_EXPRESSIVE_BOUNCE,
  M3_SPRING_FAST_SPATIAL,
  M3_TAP_PRESS,
} from '../utils/m3Motion';

const MODULE_ICONS: Record<CurriculumModuleId, string> = {
  excel: 'ph-file-xls',
  sql_world: 'ph-globe-hemisphere-west',
  sql_ordering: 'ph-sort-ascending',
  sql_movies: 'ph-film-strip',
};

export function ModuleTabs() {
  const activeModuleId = useActiveCurriculumModule();
  const summary = useCurriculumProgress();
  const { allowedModules, isInstructor } = useAccess();

  const isModuleAllowed = (moduleId: CurriculumModuleId) =>
    isInstructor || allowedModules.includes(moduleId);

  const handleSelect = (moduleId: CurriculumModuleId) => {
    if (!isModuleAllowed(moduleId)) return;
    if (typeof window.selectCurriculumModule === 'function') {
      window.selectCurriculumModule(moduleId);
    }
  };

  return (
    <LayoutGroup id="curriculum-module-selector">
      <div
        role="tablist"
        aria-label="Curriculum module selection"
        className="da-module-tabs-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 rounded-[22px] bg-slate-200/70 dark:bg-[#0e1523] border border-slate-300/75 dark:border-slate-800/90"
      >
        {summary.modules.map((mod) => {
          const unlocked = isModuleAllowed(mod.id);
          const isActive = mod.id === activeModuleId && unlocked;
          const iconClass = unlocked ? MODULE_ICONS[mod.id] : 'ph-lock-simple';

          return (
            <motion.button
              key={mod.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={!unlocked}
              disabled={!unlocked}
              onClick={() => handleSelect(mod.id)}
              whileHover={unlocked ? { y: -1 } : undefined}
              whileTap={unlocked ? M3_TAP_PRESS : undefined}
              transition={M3_SPRING_FAST_SPATIAL}
              title={
                unlocked
                  ? `Study ${mod.title}`
                  : `${mod.title} is locked by your current class access code`
              }
              className={`da-module-tab-btn no-ripple relative flex items-center justify-between gap-2.5 px-3.5 py-3 rounded-[16px] text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              } ${isActive ? 'is-active' : ''}`}
            >
              {/* Gliding Material 3 Expressive Active Tab Surface */}
              {isActive && (
                <motion.span
                  layoutId="curriculumModuleActiveSurface"
                  transition={M3_SPRING_DEFAULT_SPATIAL}
                  className="da-module-tab-active-bg absolute inset-0 rounded-[16px] pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* Gliding Bottom Accent Indicator Rail */}
              {isActive && (
                <motion.span
                  layoutId="curriculumModuleActiveRail"
                  transition={M3_SPRING_EXPRESSIVE_BOUNCE}
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
                    {unlocked ? mod.subtitle : 'Locked by class code'}
                  </div>
                </div>
              </div>

              <span
                className="da-module-tab-pct relative z-10 text-xs font-mono font-bold tabular-nums shrink-0"
                style={{
                  color: isActive ? mod.accentColor : undefined,
                }}
              >
                {unlocked ? `${mod.percentage}%` : 'Locked'}
              </span>
            </motion.button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
