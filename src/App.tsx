import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MotionConfig } from 'motion/react';
import { AccessProvider } from './context/AccessContext';
import { ThemeToggle } from './components/ThemeToggle';
import { CurriculumAnalyticsDashboard } from './components/CurriculumAnalyticsDashboard';
import { ModuleTabs } from './components/ModuleTabs';
import { ClassAccessGate } from './components/ClassAccessGate';
import { InstructorPanel } from './components/InstructorPanel';
import { SignOutConfirmModal } from './components/SignOutConfirmModal';
import { SqlErrorToast } from './components/SqlErrorToast';
import { ExpiryReminderToast } from './components/ExpiryReminderToast';
import { ResilienceBanners } from './components/ResilienceBanners';
import {
  SqlEditorStatusBar,
  SqlSchemaBar,
  type SqlLabKey,
} from './components/SqlEditorAssist';
import { LabExerciseDots } from './components/LabExerciseDots';
import { HeaderCountdownTimer } from './components/HeaderCountdownTimer';
import {
  ExpiredExportBanner,
  ModuleCardExportActions,
} from './components/ExpiredExportBanner';
import {
  FooterInstructorTrigger,
  HeaderAccessControls,
} from './components/AccessHeaderControl';
import {
  HeaderToolsMenu,
  type HeaderToolsLabId,
} from './components/HeaderToolsMenu';
import {
  useCurriculumProgress,
  type CurriculumModuleId,
} from './utils/curriculumProgress';
import { initAllLabSplitters } from './utils/labSplitters';

interface ToolsSlot {
  element: HTMLElement;
  labId: HeaderToolsLabId;
  key: string;
}

interface VariantSlot {
  element: HTMLElement;
  variant: 'default' | 'excel' | 'ordering';
  key: string;
}

interface ExportSlot {
  element: HTMLElement;
  moduleId: CurriculumModuleId;
  key: string;
}

interface SqlAssistSlot {
  element: HTMLElement;
  labId: SqlLabKey;
  key: string;
}

interface DotsSlot {
  element: HTMLElement;
  moduleId: CurriculumModuleId;
  key: string;
}

const VALID_MODULE_IDS = new Set<string>([
  'excel',
  'sql_world',
  'sql_ordering',
  'sql_movies',
]);

const VALID_SQL_LAB_IDS = new Set<string>([
  'sql_world',
  'sql_ordering',
  'sql_movies',
]);

const HOME_LAUNCH_BTN_TEXT_IDS: Record<CurriculumModuleId, string> = {
  excel: 'homeLaunchBtnTextExcel',
  sql_world: 'homeLaunchBtnText',
  sql_ordering: 'homeLaunchBtnTextOrdering',
  sql_movies: 'homeLaunchBtnTextMovies',
};

function HomeCardContinueSync() {
  const summary = useCurriculumProgress();

  useEffect(() => {
    const applyLabels = () => {
      for (const mod of summary.modules) {
        const span = document.getElementById(HOME_LAUNCH_BTN_TEXT_IDS[mod.id]);
        if (!span) continue;
        if (mod.status === 'Completed') {
          span.textContent = 'Review Completed Lab';
        } else if (mod.status === 'In Progress' && mod.nextExerciseNumber) {
          span.textContent = `Continue (Exercise #${mod.nextExerciseNumber})`;
        } else if (mod.status === 'In Progress') {
          span.textContent = 'Continue Lab';
        } else {
          span.textContent = 'Launch Lab';
        }
      }
    };

    applyLabels();
    const onProgressChange = () => {
      window.requestAnimationFrame(applyLabels);
    };
    window.addEventListener('curriculumprogresschange', onProgressChange);
    return () => {
      window.removeEventListener('curriculumprogresschange', onProgressChange);
    };
  }, [summary]);

  return null;
}

function mapVariantSlots(
  selector: string,
  dataAttr: 'themeVariant' | 'timerVariant',
): VariantSlot[] {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return nodes.map((element, index) => {
    const rawVariant = element.dataset[dataAttr];
    const variant: 'default' | 'excel' | 'ordering' =
      rawVariant === 'excel' || rawVariant === 'ordering'
        ? rawVariant
        : 'default';
    return {
      element,
      variant,
      key: element.id || `${selector}-${index}`,
    };
  });
}

function AppPortals() {
  const [themeSlots, setThemeSlots] = useState<VariantSlot[]>([]);
  const [timerSlots, setTimerSlots] = useState<VariantSlot[]>([]);
  const [toolsSlots, setToolsSlots] = useState<ToolsSlot[]>([]);
  const [exportSlots, setExportSlots] = useState<ExportSlot[]>([]);
  const [sqlSchemaSlots, setSqlSchemaSlots] = useState<SqlAssistSlot[]>([]);
  const [sqlStatusSlots, setSqlStatusSlots] = useState<SqlAssistSlot[]>([]);
  const [dotsSlots, setDotsSlots] = useState<DotsSlot[]>([]);
  const [expiredBannerSlot, setExpiredBannerSlot] =
    useState<HTMLElement | null>(null);
  const [analyticsSlot, setAnalyticsSlot] = useState<HTMLElement | null>(null);
  const [moduleTabsSlot, setModuleTabsSlot] = useState<HTMLElement | null>(null);
  const [headerAccountSlot, setHeaderAccountSlot] =
    useState<HTMLElement | null>(null);
  const [footerInstructorSlot, setFooterInstructorSlot] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    setThemeSlots(mapVariantSlots('.theme-toggle-slot', 'themeVariant'));
    setTimerSlots(mapVariantSlots('.header-timer-slot', 'timerVariant'));

    const toolsNodes = Array.from(
      document.querySelectorAll<HTMLElement>('.header-tools-slot'),
    );
    const mappedTools: ToolsSlot[] = [];
    toolsNodes.forEach((element, index) => {
      const labId = element.dataset.toolsLab || '';
      if (VALID_MODULE_IDS.has(labId)) {
        element.innerHTML = '';
        mappedTools.push({
          element,
          labId: labId as HeaderToolsLabId,
          key: element.id || `header-tools-${labId}-${index}`,
        });
      }
    });
    setToolsSlots(mappedTools);

    const exportNodes = Array.from(
      document.querySelectorAll<HTMLElement>('.module-export-slot'),
    );
    const mappedExports: ExportSlot[] = [];
    exportNodes.forEach((element, index) => {
      const modId = element.dataset.exportModule || '';
      if (VALID_MODULE_IDS.has(modId)) {
        mappedExports.push({
          element,
          moduleId: modId as CurriculumModuleId,
          key: element.id || `module-export-${modId}-${index}`,
        });
      }
    });
    setExportSlots(mappedExports);

    const schemaNodes = Array.from(
      document.querySelectorAll<HTMLElement>('.sql-schema-slot'),
    );
    const mappedSchemas: SqlAssistSlot[] = [];
    schemaNodes.forEach((element, index) => {
      const labId = element.dataset.sqlLab || '';
      if (VALID_SQL_LAB_IDS.has(labId)) {
        mappedSchemas.push({
          element,
          labId: labId as SqlLabKey,
          key: element.id || `sql-schema-${labId}-${index}`,
        });
      }
    });
    setSqlSchemaSlots(mappedSchemas);

    const statusNodes = Array.from(
      document.querySelectorAll<HTMLElement>('.sql-status-slot'),
    );
    const mappedStatuses: SqlAssistSlot[] = [];
    statusNodes.forEach((element, index) => {
      const labId = element.dataset.sqlLab || '';
      if (VALID_SQL_LAB_IDS.has(labId)) {
        mappedStatuses.push({
          element,
          labId: labId as SqlLabKey,
          key: element.id || `sql-status-${labId}-${index}`,
        });
      }
    });
    setSqlStatusSlots(mappedStatuses);

    const dotsNodes = Array.from(
      document.querySelectorAll<HTMLElement>('.lab-dots-slot'),
    );
    const mappedDots: DotsSlot[] = [];
    dotsNodes.forEach((element, index) => {
      const modId = element.dataset.dotsLab || '';
      if (VALID_MODULE_IDS.has(modId)) {
        mappedDots.push({
          element,
          moduleId: modId as CurriculumModuleId,
          key: element.id || `lab-dots-${modId}-${index}`,
        });
      }
    });
    setDotsSlots(mappedDots);

    const bannerEl = document.getElementById('expiredExportBannerSlot');
    if (bannerEl) {
      setExpiredBannerSlot(bannerEl);
    }

    const dashboardEl = document.getElementById(
      'curriculumAnalyticsDashboardSlot',
    );
    if (dashboardEl) {
      setAnalyticsSlot(dashboardEl);
    }

    const moduleNavEl = document.getElementById('curriculumModuleNav');
    if (moduleNavEl) {
      moduleNavEl.dataset.reactMounted = 'true';
      moduleNavEl.innerHTML = '';
      setModuleTabsSlot(moduleNavEl);
    }

    const accountEl = document.getElementById('homeHeaderAccountSlot');
    if (accountEl) {
      setHeaderAccountSlot(accountEl);
    }

    const instructorFooterEl = document.getElementById('footerInstructorSlot');
    if (instructorFooterEl) {
      setFooterInstructorSlot(instructorFooterEl);
    }

    const cleanupSplitters = initAllLabSplitters();
    return () => {
      cleanupSplitters();
    };
  }, []);

  return (
    <>
      <HomeCardContinueSync />
      {themeSlots.map(({ element, variant, key }) =>
        createPortal(<ThemeToggle variant={variant} />, element, key),
      )}
      {timerSlots.map(({ element, variant, key }) =>
        createPortal(<HeaderCountdownTimer variant={variant} />, element, key),
      )}
      {toolsSlots.map(({ element, labId, key }) =>
        createPortal(<HeaderToolsMenu labId={labId} />, element, key),
      )}
      {sqlSchemaSlots.map(({ element, labId, key }) =>
        createPortal(<SqlSchemaBar labId={labId} />, element, key),
      )}
      {sqlStatusSlots.map(({ element, labId, key }) =>
        createPortal(<SqlEditorStatusBar labId={labId} />, element, key),
      )}
      {dotsSlots.map(({ element, moduleId, key }) =>
        createPortal(<LabExerciseDots moduleId={moduleId} />, element, key),
      )}
      {expiredBannerSlot &&
        createPortal(
          <ExpiredExportBanner />,
          expiredBannerSlot,
          'expired-export-banner',
        )}
      {exportSlots.map(({ element, moduleId, key }) =>
        createPortal(
          <ModuleCardExportActions moduleId={moduleId} />,
          element,
          key,
        ),
      )}
      {analyticsSlot &&
        createPortal(
          <CurriculumAnalyticsDashboard />,
          analyticsSlot,
          'curriculum-analytics',
        )}
      {moduleTabsSlot &&
        createPortal(<ModuleTabs />, moduleTabsSlot, 'curriculum-module-tabs')}
      {headerAccountSlot &&
        createPortal(
          <HeaderAccessControls />,
          headerAccountSlot,
          'header-access-controls',
        )}
      {footerInstructorSlot &&
        createPortal(
          <FooterInstructorTrigger />,
          footerInstructorSlot,
          'footer-instructor-trigger',
        )}
      {typeof document !== 'undefined' &&
        createPortal(<ResilienceBanners />, document.body, 'resilience-banners')}
      {typeof document !== 'undefined' &&
        createPortal(<ClassAccessGate />, document.body, 'class-access-gate')}
      {typeof document !== 'undefined' &&
        createPortal(<InstructorPanel />, document.body, 'instructor-panel')}
      {typeof document !== 'undefined' &&
        createPortal(
          <SignOutConfirmModal />,
          document.body,
          'sign-out-confirm-modal',
        )}
      {typeof document !== 'undefined' &&
        createPortal(<SqlErrorToast />, document.body, 'sql-error-toast')}
      {typeof document !== 'undefined' &&
        createPortal(
          <ExpiryReminderToast />,
          document.body,
          'expiry-reminder-toast',
        )}
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AccessProvider>
        <AppPortals />
      </AccessProvider>
    </MotionConfig>
  );
}
