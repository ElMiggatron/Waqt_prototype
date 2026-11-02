import { useMemo } from 'react';

import { PageHeader } from '../../components/PageHeader';
import { en } from '../../i18n/en';
import { useListStore } from '../../stores/listStore';
import { useUiStore } from '../../stores/uiStore';
import styles from './ListsView.module.css';

const copy = en;

interface ListCounts {
  open: number;
  done: number;
}

export function ListsView() {
  const lists = useListStore((state) => state.lists);
  const tasks = useListStore((state) => state.tasks);
  const navigate = useUiStore((state) => state.navigate);

  const counts = useMemo(() => {
    const result = new Map<string, ListCounts>(
      lists.map((list) => [list.id, { open: 0, done: 0 }]),
    );

    for (const task of Object.values(tasks)) {
      const entry = result.get(task.listId);
      if (!entry) continue;
      if (task.completed) entry.done += 1;
      else entry.open += 1;
    }

    return result;
  }, [lists, tasks]);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={copy.app.name}
        title={copy.lists.title}
        description={copy.lists.description}
      />

      <ul className={styles.grid}>
        {lists.map((list) => {
          const entry = counts.get(list.id) ?? { open: 0, done: 0 };
          const total = entry.open + entry.done;
          const percent = total === 0 ? 0 : Math.round((entry.done / total) * 100);

          return (
            <li key={list.id}>
              <button
                type="button"
                className={styles.card}
                onClick={() => navigate({ kind: 'list', listId: list.id })}
              >
                <span className={styles.cardTop}>
                  <span className={styles.cardMark} aria-hidden="true" />
                  <span className={styles.cardTitle}>{list.name}</span>
                </span>

                <span className={styles.cardDescription}>
                  {list.description || copy.list.noteEmpty}
                </span>

                <span className={styles.cardStats}>
                  <span>{copy.lists.openTasks.replace('{count}', String(entry.open))}</span>
                  <span>{copy.lists.completedTasks.replace('{count}', String(entry.done))}</span>
                </span>

                <span
                  className={styles.progress}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                  aria-label={copy.list.completedSummary
                    .replace('{done}', String(entry.done))
                    .replace('{total}', String(total))}
                >
                  <span className={styles.progressBar} style={{ inlineSize: `${percent}%` }} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className={styles.note}>{copy.lists.note}</p>
    </div>
  );
}
