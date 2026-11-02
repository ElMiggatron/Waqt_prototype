import { ArrowLeftIcon } from './Icons';
import type { WorkspaceView } from '../domain/types';
import { AcademicsView } from '../features/academic/AcademicsView';
import { CalendarView } from '../features/calendar/CalendarView';
import { IntellectualView } from '../features/intellectual/IntellectualView';
import { ListView } from '../features/lists/ListView';
import { ListsView } from '../features/lists/ListsView';
import { ProjectsView } from '../features/projects/ProjectsView';
import { SettingsView } from '../features/settings/SettingsView';
import { en } from '../i18n/en';
import { useUiStore } from '../stores/uiStore';
import styles from './MainDisplay.module.css';

const copy = en;

function renderView(view: WorkspaceView) {
  switch (view.kind) {
    case 'list':
      return <ListView listId={view.listId} />;
    case 'lists':
      return <ListsView />;
    case 'calendar':
      return <CalendarView />;
    case 'academics':
      return <AcademicsView />;
    case 'projects':
      return <ProjectsView />;
    case 'intellectual':
      return <IntellectualView />;
    case 'settings':
      return <SettingsView />;
  }
}

/** The right-hand display. On phone layout it replaces the sidebar entirely. */
export function MainDisplay() {
  const activeView = useUiStore((state) => state.activeView);
  const layoutMode = useUiStore((state) => state.layoutMode);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const closeTask = useUiStore((state) => state.closeTask);

  return (
    <main className={styles.display} aria-label={copy.app.displayLabel}>
      {layoutMode === 'phone' ? (
        <button
          type="button"
          className={styles.backButton}
          onClick={() => {
            closeTask();
            setSidebarOpen(true);
          }}
        >
          <ArrowLeftIcon size={17} />
          <span>{copy.app.backToSidebar}</span>
        </button>
      ) : null}

      <div className={styles.content} key={`${activeView.kind}-${'listId' in activeView ? activeView.listId : ''}`}>
        {renderView(activeView)}
      </div>
    </main>
  );
}
