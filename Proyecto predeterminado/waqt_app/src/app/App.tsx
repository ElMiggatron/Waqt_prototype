import { MainDisplay } from '../components/MainDisplay';
import { Sidebar } from '../components/Sidebar';
import { TaskDetailPanelContainer } from '../features/tasks';
import { useLayoutMode } from '../hooks/useLayoutMode';
import { useSettingsStore } from '../stores/settingsStore';
import { useUiStore } from '../stores/uiStore';
import { useThemeApplier } from './themeApplier';
import styles from './App.module.css';

/**
 * SPEC: broad layout = sidebar + display; phone layout = one pane at a time,
 * starting on the sidebar and returning to it through the display's back button.
 * The task panel is UI state, so it mounts beside the display on broad screens and
 * becomes a full-screen sheet in portrait.
 */
export function App() {
  const layoutMode = useLayoutMode();
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const themeId = useSettingsStore((state) => state.themeId);

  useThemeApplier(themeId);

  const isBroad = layoutMode === 'broad';
  const showSidebar = isBroad || isSidebarOpen;
  const showDisplay = isBroad || !isSidebarOpen;

  return (
    <div className={styles.app} data-layout={layoutMode}>
      {showSidebar ? <Sidebar /> : null}
      {showDisplay ? (
        <>
          <TaskDetailPanelContainer />
          <MainDisplay />
        </>
      ) : null}
    </div>
  );
}
