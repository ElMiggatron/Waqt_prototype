import { create } from 'zustand';

import type { ID, LayoutMode, WorkspaceView } from '../domain/types';
import { getLayoutMode } from '../lib/layout';

interface UiState {
  layoutMode: LayoutMode;
  isSidebarOpen: boolean;
  activeView: WorkspaceView;
  query: string;
  /** SPEC: the task panel is UI state, not a route, so it overlays any view. */
  selectedTaskId: ID | null;
  /** Collapsed intellectual subjects. UI state only; never stored on the entity. */
  collapsedSubjectIds: Record<ID, true>;
  setLayoutMode(mode: LayoutMode): void;
  setSidebarOpen(isOpen: boolean): void;
  /** Selecting a view clears search, closes the task panel, and closes the sidebar on phone. */
  navigate(view: WorkspaceView): void;
  setQuery(query: string): void;
  clearSearch(): void;
  openTask(taskId: ID): void;
  closeTask(): void;
  toggleSubjectCollapsed(subjectId: ID): void;
}

export const useUiStore = create<UiState>((set) => ({
  layoutMode: getLayoutMode(),
  isSidebarOpen: true,
  activeView: { kind: 'lists' },
  query: '',
  selectedTaskId: null,
  collapsedSubjectIds: {},
  setLayoutMode: (layoutMode) => set({ layoutMode, isSidebarOpen: true }),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  navigate: (view) =>
    set((state) => ({
      activeView: view,
      query: '',
      selectedTaskId: null,
      isSidebarOpen: state.layoutMode === 'broad',
    })),
  setQuery: (query) => set({ query }),
  clearSearch: () => set({ query: '' }),
  openTask: (selectedTaskId) => set({ selectedTaskId }),
  closeTask: () => set({ selectedTaskId: null }),
  toggleSubjectCollapsed: (subjectId) =>
    set((state) => {
      const next = { ...state.collapsedSubjectIds };
      if (next[subjectId]) delete next[subjectId];
      else next[subjectId] = true;
      return { collapsedSubjectIds: next };
    }),
}));
