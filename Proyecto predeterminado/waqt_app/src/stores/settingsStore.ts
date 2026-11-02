import { create } from 'zustand';

import { DEFAULT_THEME_ID, isSelectableTheme, THEME_STORAGE_KEY } from '../config/themes';
import type { Madhab, SelectableThemeId } from '../domain/types';

export interface SetupValues {
  madhab: Madhab;
  calculationMethodId: number;
  location: string;
  wakeTime: string;
  sleepTime: string;
  jumuahKhutbah: string;
  jumuahSalah: string;
  remindDayBefore: boolean;
  remindTwoHours: boolean;
  notificationsEnabled: boolean;
}

interface SettingsState extends SetupValues {
  themeId: SelectableThemeId;
  setSetup(patch: Partial<SetupValues>): void;
  setTheme(themeId: SelectableThemeId): void;
  reset(): void;
}

const DEFAULT_SETUP: SetupValues = {
  madhab: 'shafii',
  calculationMethodId: 3,
  location: 'Melbourne, AU',
  wakeTime: '05:00',
  sleepTime: '22:30',
  jumuahKhutbah: '13:00',
  jumuahSalah: '13:30',
  remindDayBefore: true,
  remindTwoHours: false,
  notificationsEnabled: false,
};

function readStoredTheme(): SelectableThemeId {
  if (typeof window === 'undefined') return DEFAULT_THEME_ID;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isSelectableTheme(stored)) return stored;
  } catch {
    // Storage can be blocked (private mode). The in-memory default still applies.
  }
  return DEFAULT_THEME_ID;
}

function initialSettings(): SetupValues & { themeId: SelectableThemeId } {
  return { ...DEFAULT_SETUP, themeId: readStoredTheme() };
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...initialSettings(),
  setSetup: (patch) => set(patch),
  setTheme: (themeId) => set({ themeId }),
  reset: () => set({ ...DEFAULT_SETUP, themeId: DEFAULT_THEME_ID }),
}));
