import type { LayoutMode } from '../domain/types';

/**
 * The Spec defines broad view purely by orientation: width greater than height.
 * Keep the media query in one place so CSS and JS cannot disagree.
 */
export const LANDSCAPE_QUERY = '(orientation: landscape)';

export function getLayoutMode(): LayoutMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'broad';
  }
  return window.matchMedia(LANDSCAPE_QUERY).matches ? 'broad' : 'phone';
}
