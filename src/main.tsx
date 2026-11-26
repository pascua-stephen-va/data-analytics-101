import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeTogglePortalHost } from './components/ThemeToggle';

function mountThemeToggles() {
  const hostElement = document.createElement('div');
  hostElement.id = 'theme-toggle-portal-root';
  hostElement.style.display = 'none';
  document.body.appendChild(hostElement);

  createRoot(hostElement).render(
    <StrictMode>
      <ThemeTogglePortalHost />
    </StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountThemeToggles, { once: true });
} else {
  mountThemeToggles();
}
