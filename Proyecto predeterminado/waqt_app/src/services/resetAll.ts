import { useAcademicStore } from '../stores/academicStore';
import { useIntellectualStore } from '../stores/intellectualStore';
import { useListStore } from '../stores/listStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUiStore } from '../stores/uiStore';

/**
 * Cross-store reset. Stores never import each other, so coordination lives here.
 * TODO(settings): replace the in-memory reset with the Dexie `resetAll` flow.
 */
export function resetAll(): void {
  useListStore.getState().reset();
  useAcademicStore.getState().reset();
  useIntellectualStore.getState().reset();
  useSettingsStore.getState().reset();
  useUiStore.getState().setSidebarOpen(true);
  useUiStore.getState().navigate({ kind: 'lists' });
}
