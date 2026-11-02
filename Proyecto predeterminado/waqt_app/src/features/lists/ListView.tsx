import { ClockIcon, StarIcon, CheckIcon } from '../../components/Icons';
import { PageHeader } from '../../components/PageHeader';
import type { ID, Task } from '../../domain/types';
import { en } from '../../i18n/en';
import { formatSchedule, isScheduleOverdue } from '../../lib/dates';
import { useListStore } from '../../stores/listStore';
import { useUiStore } from '../../stores/uiStore';
import styles from './ListView.module.css';

const copy = en;

interface TaskRowProps {
  task: Task;
  onToggle: (taskId: ID) => void;
  onOpen: (taskId: ID) => void;
}

function TaskRow({ task, onToggle, onOpen }: TaskRowProps) {
  const toggleLabel = task.completed ? copy.list.markIncomplete : copy.list.markComplete;
  const isOverdue = Boolean(task.dueDate && isScheduleOverdue(task.dueDate));

  return (
    <li className={[styles.task, task.completed ? styles.isDone : ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={`${toggleLabel}: ${task.title}`}
        className={styles.check}
        onClick={() => onToggle(task.id)}
      >
        {task.completed ? <CheckIcon size={13} /> : null}
      </button>

      <button
        type="button"
        className={styles.taskBody}
        aria-label={copy.task.openTask.replace('{name}', task.title)}
        onClick={() => onOpen(task.id)}
      >
        <span className={styles.taskTitle}>{task.title}</span>
        <span className={styles.taskMeta}>
          {task.important ? (
            <span className={styles.flag} role="img" aria-label={copy.common.important}>
              <StarIcon size={13} />
            </span>
          ) : null}
          {task.dueDate ? (
            <span className={[styles.metaItem, isOverdue ? styles.isOverdue : ''].filter(Boolean).join(' ')}>
              <ClockIcon size={13} />
              <span>
                {copy.list.due}: {formatSchedule(task.dueDate)}
              </span>
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

interface ListViewProps {
  listId: ID;
}

export function ListView({ listId }: ListViewProps) {
  const list = useListStore((state) => state.lists.find((candidate) => candidate.id === listId));
  const tasks = useListStore((state) => state.tasks);
  const toggleTask = useListStore((state) => state.toggleTask);
  const navigate = useUiStore((state) => state.navigate);
  const openTask = useUiStore((state) => state.openTask);

  const listTasks = Object.values(tasks).filter((task) => task.listId === listId);
  const openTasks = listTasks.filter((task) => !task.completed);
  const doneTasks = listTasks.filter((task) => task.completed);

  if (!list) {
    return (
      <div className={styles.page}>
        <PageHeader title={copy.lists.title} description={copy.lists.description} />
        <div className={styles.empty}>
          <p>{copy.list.emptyBody}</p>
          <button
            type="button"
            className={styles.emptyAction}
            onClick={() => navigate({ kind: 'lists' })}
          >
            {copy.sidebar.lists}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={copy.sidebar.listsTitle}
        title={list.name}
        description={list.description || copy.list.noteEmpty}
        actions={
          <span className={styles.summaryChip}>
            {copy.list.completedSummary
              .replace('{done}', String(doneTasks.length))
              .replace('{total}', String(listTasks.length))}
          </span>
        }
      />

      {listTasks.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>{copy.list.emptyTitle}</h2>
          <p>{copy.list.emptyBody}</p>
        </div>
      ) : (
        <>
          {openTasks.length > 0 ? (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{copy.list.openSection}</h2>
              <ul className={styles.taskList}>
                {openTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onOpen={openTask}
                  />
                ))}
              </ul>
            </section>
          ) : null}

          {doneTasks.length > 0 ? (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{copy.list.doneSection}</h2>
              <ul className={styles.taskList}>
                {doneTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onOpen={openTask}
                  />
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <section className={styles.note} aria-labelledby="list-note-heading">
        <h2 className={styles.noteTitle} id="list-note-heading">
          {copy.list.noteTitle}
        </h2>
        <p className={styles.noteBody}>{list.description || copy.list.noteEmpty}</p>
      </section>
    </div>
  );
}
