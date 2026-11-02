import { useEffect, useMemo, useRef, useState } from 'react';

import type { ID, WorkspaceView } from '../domain/types';
import { en } from '../i18n/en';
import { searchWorkspace } from '../lib/search';
import { useIntellectualStore } from '../stores/intellectualStore';
import { useListStore } from '../stores/listStore';
import { useUiStore } from '../stores/uiStore';
import {
  AcademicIcon,
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  IntellectualIcon,
  ListIcon,
  MoreIcon,
  PlusIcon,
  ProjectIcon,
  SearchIcon,
  SettingsIcon,
  TrashIcon,
} from './Icons';
import { SoftDivider } from './SoftDivider';
import styles from './Sidebar.module.css';

const copy = en;

export function Sidebar() {
  const lists = useListStore((state) => state.lists);
  const tasks = useListStore((state) => state.tasks);
  const hasProjects = useIntellectualStore((state) =>
    state.subjects.some((subject) => subject.parentId === null && subject.isProject),
  );
  const addList = useListStore((state) => state.addList);
  const deleteList = useListStore((state) => state.deleteList);
  const activeView = useUiStore((state) => state.activeView);
  const query = useUiStore((state) => state.query);
  const navigate = useUiStore((state) => state.navigate);
  const setQuery = useUiStore((state) => state.setQuery);
  const clearSearch = useUiStore((state) => state.clearSearch);
  const openTask = useUiStore((state) => state.openTask);

  const [isAdding, setIsAdding] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [menuListId, setMenuListId] = useState<ID | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const taskItems = useMemo(() => Object.values(tasks), [tasks]);
  const results = useMemo(
    () => searchWorkspace(lists, taskItems, query),
    [lists, taskItems, query],
  );
  const listNames = useMemo(
    () => new Map(lists.map((list) => [list.id, list.name])),
    [lists],
  );

  const isSearching = query.trim().length > 0;
  const totalResults = results.lists.length + results.tasks.length;
  const isActiveList = (listId: ID) =>
    activeView.kind === 'list' && activeView.listId === listId;

  useEffect(() => {
    if (!menuListId) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-list-menu]')) {
        return;
      }
      setMenuListId(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuListId(null);
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuListId]);

  useEffect(() => {
    if (isAdding) addInputRef.current?.focus();
  }, [isAdding]);

  const openAddForm = () => {
    setNewListName('');
    setIsAdding(true);
  };

  const handleAddList = () => {
    const name = newListName.trim();
    if (!name) return;
    const listId = addList(name);
    setIsAdding(false);
    setNewListName('');
    navigate({ kind: 'list', listId });
  };

  const handleDeleteList = (listId: ID, name: string) => {
    const confirmed = window.confirm(
      copy.sidebar.deleteListConfirm.replace('{name}', name),
    );
    if (!confirmed) return;

    deleteList(listId);
    setMenuListId(null);
    if (isActiveList(listId)) navigate({ kind: 'lists' });
  };

  const goTo = (view: WorkspaceView) => {
    navigate(view);
  };

  return (
    <aside className={styles.sidebar} aria-label={copy.app.sidebarLabel}>
      <header className={styles.header}>
        <div className={styles.searchRow}>
          <div className={styles.searchField}>
            <SearchIcon size={18} />
            <input
              className={styles.searchInput}
              type="search"
              value={query}
              placeholder={copy.sidebar.searchPlaceholder}
              aria-label={copy.sidebar.searchLabel}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') clearSearch();
              }}
            />
            {isSearching ? (
              <button
                type="button"
                className={styles.clearButton}
                aria-label={copy.sidebar.clearSearch}
                onClick={clearSearch}
              >
                <CloseIcon size={16} />
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.gearButton}
            aria-label={copy.sidebar.settings}
            aria-current={activeView.kind === 'settings' ? 'page' : undefined}
            onClick={() => goTo({ kind: 'settings' })}
          >
            <SettingsIcon size={19} />
          </button>
        </div>

        {isSearching ? (
          <div
            className={styles.searchPanel}
            role="region"
            aria-label={copy.sidebar.searchResults}
          >
            <p className={styles.searchCount} aria-live="polite">
              {copy.sidebar.resultCount.replace('{count}', String(totalResults))}
            </p>

            {totalResults === 0 ? (
              <p className={styles.searchEmpty}>{copy.sidebar.noResults}</p>
            ) : null}

            {results.lists.length > 0 ? (
              <section className={styles.searchGroup}>
                <h3 className={styles.searchGroupTitle}>{copy.sidebar.searchLists}</h3>
                <ul className={styles.searchList}>
                  {results.lists.map((list) => (
                    <li key={list.id}>
                      <button
                        type="button"
                        className={styles.searchResult}
                        onClick={() => goTo({ kind: 'list', listId: list.id })}
                      >
                        <ListIcon size={16} />
                        <span className={styles.searchResultName}>{list.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {results.tasks.length > 0 ? (
              <section className={styles.searchGroup}>
                <h3 className={styles.searchGroupTitle}>{copy.sidebar.searchTasks}</h3>
                <ul className={styles.searchList}>
                  {results.tasks.map((task) => (
                    <li key={task.id}>
                      <button
                        type="button"
                        className={styles.searchResult}
                        onClick={() => {
                          goTo({ kind: 'list', listId: task.listId });
                          openTask(task.id);
                        }}
                      >
                        <CheckIcon size={16} />
                        <span className={styles.searchResultText}>
                          <span className={styles.searchResultName}>{task.title}</span>
                          <span className={styles.searchResultMeta}>
                            {listNames.get(task.listId) ?? ''}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}
      </header>

      <SoftDivider className={styles.divider} />

      <section className={styles.listsSection} aria-labelledby="sidebar-lists-heading">
        <h2 className={styles.sectionTitle} id="sidebar-lists-heading">
          {copy.sidebar.listsTitle}
        </h2>

        {isAdding ? (
          <form
            className={styles.addForm}
            onSubmit={(event) => {
              event.preventDefault();
              handleAddList();
            }}
          >
            <input
              ref={addInputRef}
              className={styles.addInput}
              value={newListName}
              placeholder={copy.sidebar.newListPlaceholder}
              aria-label={copy.sidebar.createList}
              onChange={(event) => setNewListName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setIsAdding(false);
                  setNewListName('');
                }
              }}
            />
            <button
              type="submit"
              className={styles.addAction}
              aria-label={copy.sidebar.createList}
            >
              <CheckIcon size={16} />
            </button>
            <button
              type="button"
              className={styles.addAction}
              aria-label={copy.common.cancel}
              onClick={() => {
                setIsAdding(false);
                setNewListName('');
              }}
            >
              <CloseIcon size={16} />
            </button>
          </form>
        ) : (
          <button type="button" className={styles.addButton} onClick={openAddForm}>
            <PlusIcon size={16} />
            <span>{copy.sidebar.addList}</span>
          </button>
        )}

        <div className={styles.listScroll}>
          <ul className={styles.listItems}>
            {lists.map((list) => (
              <li key={list.id} className={styles.listItem} data-list-menu>
                <button
                  type="button"
                  className={styles.listButton}
                  aria-current={isActiveList(list.id) ? 'page' : undefined}
                  onClick={() => goTo({ kind: 'list', listId: list.id })}
                  onContextMenu={(event) => {
                    if (list.isDefault) return;
                    event.preventDefault();
                    setMenuListId(list.id);
                  }}
                >
                  <span className={styles.listBullet} aria-hidden="true" />
                  <span className={styles.listName}>{list.name}</span>
                </button>

                {!list.isDefault ? (
                  <button
                    type="button"
                    className={styles.menuTrigger}
                    aria-label={`${copy.sidebar.listOptions}: ${list.name}`}
                    aria-expanded={menuListId === list.id}
                    onClick={() =>
                      setMenuListId((current) => (current === list.id ? null : list.id))
                    }
                  >
                    <MoreIcon size={16} />
                  </button>
                ) : null}

                {menuListId === list.id ? (
                  <div className={styles.listMenu} role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      className={styles.menuDelete}
                      onClick={() => handleDeleteList(list.id, list.name)}
                    >
                      <TrashIcon size={15} />
                      <span>{copy.sidebar.deleteList}</span>
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SoftDivider className={styles.divider} />

      <nav className={styles.nav} aria-label={copy.app.sidebarLabel}>
        <button
          type="button"
          className={styles.navButton}
          aria-current={activeView.kind === 'calendar' ? 'page' : undefined}
          onClick={() => goTo({ kind: 'calendar' })}
        >
          <CalendarIcon size={18} />
          <span>{copy.sidebar.calendar}</span>
        </button>

        <SoftDivider className={styles.divider} />

        <button
          type="button"
          className={styles.navButton}
          aria-current={activeView.kind === 'academics' ? 'page' : undefined}
          onClick={() => goTo({ kind: 'academics' })}
        >
          <AcademicIcon size={18} />
          <span>{copy.sidebar.academics}</span>
        </button>

        {hasProjects ? (
          <button
            type="button"
            className={styles.navButton}
            aria-current={activeView.kind === 'projects' ? 'page' : undefined}
            onClick={() => goTo({ kind: 'projects' })}
          >
            <ProjectIcon size={18} />
            <span>{copy.sidebar.projects}</span>
          </button>
        ) : null}

        <button
          type="button"
          className={styles.navButton}
          aria-current={activeView.kind === 'intellectual' ? 'page' : undefined}
          onClick={() => goTo({ kind: 'intellectual' })}
        >
          <IntellectualIcon size={18} />
          <span>{copy.sidebar.intellectual}</span>
        </button>

        <button
          type="button"
          className={styles.navButton}
          aria-current={activeView.kind === 'lists' ? 'page' : undefined}
          onClick={() => goTo({ kind: 'lists' })}
        >
          <ListIcon size={18} />
          <span>{copy.sidebar.lists}</span>
        </button>
      </nav>
    </aside>
  );
}
