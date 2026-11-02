import { useMemo, useState } from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
} from '../../components/Icons';
import type { SubjectNode } from '../../domain/types';
import { en } from '../../i18n/en';
import { MAX_SUBJECT_DEPTH } from '../../lib/subjectTree';
import { useIntellectualStore } from '../../stores/intellectualStore';
import { useUiStore } from '../../stores/uiStore';
import styles from './IntellectualPanel.module.css';

const copy = en;

interface SubjectTreeNodeProps {
  node: SubjectNode;
  depth: number;
}

/**
 * Recursive greater/nested subject node. Collapsed state lives in `uiStore`, never on
 * the entity (standards §2.7). Tasks can be added at any depth, and only root subjects
 * expose the Project switch.
 */
export function SubjectTreeNode({ node, depth }: SubjectTreeNodeProps) {
  const tasks = useIntellectualStore((state) => state.tasks);
  const addSubject = useIntellectualStore((state) => state.addSubject);
  const deleteSubject = useIntellectualStore((state) => state.deleteSubject);
  const setProject = useIntellectualStore((state) => state.setProject);
  const addTask = useIntellectualStore((state) => state.addTask);
  const toggleTask = useIntellectualStore((state) => state.toggleTask);
  const deleteTask = useIntellectualStore((state) => state.deleteTask);
  const isCollapsed = useUiStore((state) =>
    Boolean(state.collapsedSubjectIds[node.id]),
  );
  const toggleCollapsed = useUiStore((state) => state.toggleSubjectCollapsed);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskError, setTaskError] = useState('');
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [childName, setChildName] = useState('');
  const [childDescription, setChildDescription] = useState('');
  const [childError, setChildError] = useState('');

  const isRoot = depth === 0;
  const canNest = depth < MAX_SUBJECT_DEPTH - 1;
  const subjectTasks = useMemo(
    () => tasks.filter((task) => task.subjectId === node.id),
    [tasks, node.id],
  );

  const submitTask = () => {
    const trimmed = taskTitle.trim();
    if (!trimmed) {
      setTaskError(copy.intellectual.nameRequired);
      return;
    }

    addTask(node.id, trimmed);
    setTaskTitle('');
    setTaskError('');
    setIsAddingTask(false);
  };

  const submitChild = () => {
    const trimmed = childName.trim();
    if (!trimmed) {
      setChildError(copy.intellectual.nameRequired);
      return;
    }

    addSubject({
      name: trimmed,
      description: childDescription,
      parentId: node.id,
      isProject: false,
    });
    setChildName('');
    setChildDescription('');
    setChildError('');
    setIsAddingChild(false);
  };

  return (
    <li className={styles.node} data-depth={depth}>
      <div className={styles.nodeHeader}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={!isCollapsed}
          aria-label={`${isCollapsed ? copy.intellectual.expand : copy.intellectual.collapse}: ${node.name}`}
          onClick={() => toggleCollapsed(node.id)}
        >
          <span className={styles.chevron} data-open={!isCollapsed}>
            <ChevronDownIcon size={17} />
          </span>
        </button>

        <div className={styles.nodeText}>
          <h3 className={isRoot ? styles.rootTitle : styles.nodeTitle}>
            {node.name}
          </h3>
          {node.description ? (
            <p className={styles.description}>{node.description}</p>
          ) : null}
        </div>

        <div className={styles.nodeActions}>
          {isRoot ? (
            <label className={styles.projectToggle}>
              <input
                type="checkbox"
                role="switch"
                className={styles.switchInput}
                checked={node.isProject}
                aria-label={copy.intellectual.projectSwitchLabel.replace(
                  '{name}',
                  node.name,
                )}
                onChange={(event) => setProject(node.id, event.target.checked)}
              />
              <span className={styles.switchTrack} aria-hidden="true">
                <span className={styles.switchThumb} />
              </span>
              <span className={styles.switchLabel}>
                {copy.intellectual.projectSwitch}
              </span>
            </label>
          ) : null}

          <button
            type="button"
            className={styles.deleteButton}
            aria-label={`${copy.intellectual.deleteSubject}: ${node.name}`}
            onClick={() => {
              const confirmed = window.confirm(
                copy.intellectual.deleteSubjectConfirm.replace('{name}', node.name),
              );
              if (confirmed) deleteSubject(node.id);
            }}
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>

      {isCollapsed ? null : (
        <div className={styles.nodeBody}>
          <section className={styles.tasks} aria-label={copy.intellectual.tasksTitle}>
            <div className={styles.tasksHeader}>
              <h4 className={styles.tasksTitle}>{copy.intellectual.tasksTitle}</h4>
              <button
                type="button"
                className={styles.addTaskButton}
                aria-expanded={isAddingTask}
                onClick={() => setIsAddingTask((current) => !current)}
              >
                <PlusIcon size={14} />
                <span>{copy.intellectual.addTask}</span>
              </button>
            </div>

            {isAddingTask ? (
              <form
                className={styles.taskForm}
                onSubmit={(event) => {
                  event.preventDefault();
                  submitTask();
                }}
              >
                <input
                  className={styles.control}
                  value={taskTitle}
                  autoFocus
                  placeholder={copy.intellectual.taskPlaceholder}
                  aria-label={copy.intellectual.taskPlaceholder}
                  onChange={(event) => {
                    setTaskTitle(event.target.value);
                    setTaskError('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setIsAddingTask(false);
                      setTaskTitle('');
                      setTaskError('');
                    }
                  }}
                />
                <button type="submit" className={styles.primaryButton}>
                  {copy.intellectual.addTaskConfirm}
                </button>
              </form>
            ) : null}

            {taskError ? (
              <p className={styles.error} role="alert">
                {taskError}
              </p>
            ) : null}

            {subjectTasks.length === 0 ? (
              <p className={styles.muted}>{copy.intellectual.noTasks}</p>
            ) : (
              <ul className={styles.taskList}>
                {subjectTasks.map((task) => (
                  <li key={task.id} className={styles.taskRow}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={task.completed}
                      aria-label={`${
                        task.completed
                          ? copy.list.markIncomplete
                          : copy.list.markComplete
                      }: ${task.title}`}
                      className={styles.check}
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.completed ? <CheckIcon size={12} /> : null}
                    </button>

                    <span
                      className={[
                        styles.taskTitle,
                        task.completed ? styles.isDone : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {task.title}
                    </span>

                    <button
                      type="button"
                      className={styles.taskDelete}
                      aria-label={`${copy.intellectual.deleteTask}: ${task.title}`}
                      onClick={() => deleteTask(task.id)}
                    >
                      <TrashIcon size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className={styles.childBar}>
            {canNest ? (
              <button
                type="button"
                className={styles.addNestedButton}
                aria-expanded={isAddingChild}
                onClick={() => setIsAddingChild((current) => !current)}
              >
                <PlusIcon size={14} />
                <span>{copy.intellectual.addNested}</span>
              </button>
            ) : (
              <span className={styles.muted}>{copy.intellectual.maxDepth}</span>
            )}
          </div>

          {isAddingChild ? (
            <form
              className={styles.childForm}
              onSubmit={(event) => {
                event.preventDefault();
                submitChild();
              }}
            >
              <input
                className={styles.control}
                value={childName}
                autoFocus
                placeholder={copy.intellectual.nestedName}
                aria-label={copy.intellectual.nestedName}
                onChange={(event) => {
                  setChildName(event.target.value);
                  setChildError('');
                }}
              />
              <textarea
                className={styles.textarea}
                rows={2}
                value={childDescription}
                placeholder={copy.intellectual.descriptionPlaceholder}
                aria-label={copy.intellectual.description_}
                onChange={(event) => setChildDescription(event.target.value)}
              />
              {childError ? (
                <p className={styles.error} role="alert">
                  {childError}
                </p>
              ) : null}
              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryButton}>
                  {copy.intellectual.save}
                </button>
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={() => {
                    setIsAddingChild(false);
                    setChildName('');
                    setChildDescription('');
                    setChildError('');
                  }}
                >
                  {copy.intellectual.cancel}
                </button>
              </div>
            </form>
          ) : null}

          {node.children.length > 0 ? (
            <ul className={styles.children}>
              {node.children.map((child) => (
                <SubjectTreeNode key={child.id} node={child} depth={depth + 1} />
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </li>
  );
}
