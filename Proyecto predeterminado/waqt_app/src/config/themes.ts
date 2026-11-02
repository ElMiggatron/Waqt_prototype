import { SELECTABLE_THEME_IDS, type SelectableThemeId } from '../domain/types';

export interface ThemeDefinition {
  id: SelectableThemeId;
  mode: 'dark' | 'light';
}

/**
 * Registry for the ten user-selectable themes. The two automatic themes
 * (`sacred-month`, `ramadan`) have CSS files but are not offered as user choices.
 */
export const THEMES: readonly ThemeDefinition[] = [
  { id: 'abbasid-black', mode: 'dark' },
  { id: 'mughal-green', mode: 'dark' },
  { id: 'umayyad-white', mode: 'light' },
  { id: 'ottoman-red', mode: 'dark' },
  { id: 'sahel-yellow', mode: 'light' },
  { id: 'fatimid-blue', mode: 'dark' },
  { id: 'bosniak-blue', mode: 'light' },
  { id: 'sufi-turquoise', mode: 'light' },
  { id: 'isfahan-cobalt', mode: 'dark' },
  { id: 'omani-coral', mode: 'light' },
];

export const THEME_BY_ID: Record<SelectableThemeId, ThemeDefinition> = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme]),
) as Record<SelectableThemeId, ThemeDefinition>;

export const DEFAULT_THEME_ID: SelectableThemeId = 'abbasid-black';

/** Mirrored by the pre-paint script in `index.html`. */
export const THEME_STORAGE_KEY = 'waqt:theme';

export function isSelectableTheme(value: string): value is SelectableThemeId {
  return (SELECTABLE_THEME_IDS as readonly string[]).includes(value);
}
