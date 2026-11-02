import { useEffect } from 'react';

import { THEME_BY_ID, THEME_STORAGE_KEY } from '../config/themes';
import type { SelectableThemeId } from '../domain/types';

/**
 * Applies the chosen theme to `<html>` and mirrors the user choice to localStorage.
 * Automatic Ramadan / sacred-month themes will layer on top through the calendar module.
 */
export function useThemeApplier(themeId: SelectableThemeId): void {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeId;
    root.style.colorScheme = THEME_BY_ID[themeId].mode;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {
      // Storage may be blocked; the theme still applies for the current session.
    }
  }, [themeId]);
}
