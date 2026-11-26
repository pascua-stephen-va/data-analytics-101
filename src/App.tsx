import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MotionConfig } from 'motion/react';
import { ThemeToggle } from './components/ThemeToggle';
import { CurriculumAnalyticsDashboard } from './components/CurriculumAnalyticsDashboard';
import { ModuleTabs } from './components/ModuleTabs';

interface ThemeSlot {
  element: HTMLElement;
  variant: 'default' | 'excel' | 'ordering';
  key: string;
}

export default function App() {
  const [themeSlots, setThemeSlots] = useState<ThemeSlot[]>([]);
  const [analyticsSlot, setAnalyticsSlot] = useState<HTMLElement | null>(null);
  const [moduleTabsSlot, setModuleTabsSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('.theme-toggle-slot'),
    );
    const mapped: ThemeSlot[] = nodes.map((element, index) => {
      const rawVariant = element.dataset.themeVariant;
      const variant: 'default' | 'excel' | 'ordering' =
        rawVariant === 'excel' || rawVariant === 'ordering'
          ? rawVariant
          : 'default';
      return {
        element,
        variant,
        key: element.id || `theme-slot-${index}`,
      };
    });
    setThemeSlots(mapped);

    const dashboardEl = document.getElementById('curriculumAnalyticsDashboardSlot');
    if (dashboardEl) {
      setAnalyticsSlot(dashboardEl);
    }

    const moduleNavEl = document.getElementById('curriculumModuleNav');
    if (moduleNavEl) {
      moduleNavEl.dataset.reactMounted = 'true';
      moduleNavEl.innerHTML = '';
      setModuleTabsSlot(moduleNavEl);
    }
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {themeSlots.map(({ element, variant, key }) =>
        createPortal(<ThemeToggle variant={variant} />, element, key),
      )}
      {analyticsSlot &&
        createPortal(<CurriculumAnalyticsDashboard />, analyticsSlot, 'curriculum-analytics')}
      {moduleTabsSlot &&
        createPortal(<ModuleTabs />, moduleTabsSlot, 'curriculum-module-tabs')}
    </MotionConfig>
  );
}
