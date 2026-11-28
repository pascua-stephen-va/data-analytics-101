import type { Transition } from 'motion/react';

/**
 * Material 3 Expressive Motion Physics (Google Research)
 * https://design.google/library/expressive-material-design-google-research
 *
 * All transitions strictly animate GPU-composited properties (transform & opacity)
 * for locked 60fps performance on low-end laptops, and respect <MotionConfig reducedMotion="user">.
 */

/** Material 3 Expressive emphasized easing curve */
export const M3_EASE_EXPRESSIVE: [number, number, number, number] = [0.2, 0, 0, 1];

/** Fast spatial spring — buttons, chips, dropdown triggers, tactile taps */
export const M3_SPRING_FAST_SPATIAL: Transition = {
  type: 'spring',
  stiffness: 680,
  damping: 32,
  mass: 0.82,
};

/** Default spatial spring — modals, panels, dialogs, gliding tabs, toasts */
export const M3_SPRING_DEFAULT_SPATIAL: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
  mass: 0.9,
};

/** Slow spatial spring — large surface containers & banners */
export const M3_SPRING_SLOW_SPATIAL: Transition = {
  type: 'spring',
  stiffness: 250,
  damping: 26,
  mass: 1,
};

/** Expressive bouncy spring — active indicators, badges, checkmarks, icon morphs */
export const M3_SPRING_EXPRESSIVE_BOUNCE: Transition = {
  type: 'spring',
  stiffness: 480,
  damping: 22,
  mass: 0.82,
};

/** Fast effects transition — opacity, backdrop scrim (zero overshoot) */
export const M3_EFFECTS_FAST: Transition = {
  duration: 0.18,
  ease: M3_EASE_EXPRESSIVE,
};

/** Screen / View transition (200ms–280ms subtle fade + vertical slide) */
export const M3_VIEW_TRANSITION: Transition = {
  duration: 0.24,
  ease: M3_EASE_EXPRESSIVE,
};

/** View step fade + vertical slide preset (Sign-In Gate <-> Registration <-> Home) */
export const M3_VIEW_MOTION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: M3_VIEW_TRANSITION,
};

/** Modal dialog container spring motion props */
export const M3_MODAL_MOTION = {
  initial: { opacity: 0, y: 16, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.96 },
  transition: M3_SPRING_DEFAULT_SPATIAL,
};

/** Backdrop scrim fade props */
export const M3_BACKDROP_MOTION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: M3_EFFECTS_FAST,
};

/** Header Tools dropdown spring scale + slide motion props */
export const M3_DROPDOWN_MOTION = {
  initial: { opacity: 0, y: -8, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.95 },
  transition: M3_SPRING_FAST_SPATIAL,
};

/** Toast notification motion props (entering from bottom — SQL error toast) */
export const M3_TOAST_BOTTOM_MOTION = {
  initial: { opacity: 0, y: 24, scale: 0.93 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 18, scale: 0.94 },
  transition: M3_SPRING_DEFAULT_SPATIAL,
};

/** Toast notification motion props (entering from top — 5m / 1m expiry warnings) */
export const M3_TOAST_TOP_MOTION = {
  initial: { opacity: 0, y: -20, scale: 0.93 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.94 },
  transition: M3_SPRING_DEFAULT_SPATIAL,
};

/** Tactile button press interaction (GPU transform only) */
export const M3_TAP_PRESS = {
  scale: 0.96,
  transition: M3_SPRING_FAST_SPATIAL,
};

export const M3_HOVER_LIFT = {
  y: -1.5,
  transition: M3_SPRING_FAST_SPATIAL,
};
