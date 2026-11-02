import { useEffect, useRef, useState } from 'react';

import { CloseIcon, MoreIcon, StarIcon } from '../../components/Icons';
import { SoftDivider } from '../../components/SoftDivider';
import type { ID, Task, TaskList, TaskPatch } from '../../domain/types';
import { en } from '../../i18n/en';
import { RepeatMenu } from '../calendar';
import { StepList } from './StepList';
import { TaskScheduleField } from './TaskScheduleField';
import styles from './TaskDetailPanel.module.css';

const copy = en;

export interface TaskDetailPanelProps {
  /** The task being edited. The container unmounts the panel when this is `null`. */
  task: Task;
  /** Every list, so the move menu can offer the other ones. */
  lists: readonly TaskList[];
  onClose: () => void;
  /** Partial task update; the panel never mutates the task object itself. */
  onUpdate: (patch: TaskPatch) => void;
  onMove: (listId: ID) => void;
  onAddStep: (text: string) => void;
  onToggleStep: (stepId: ID) => void;
  onDeleteStep: (stepId: ID) => void;
}

/**
 * Controlled task-detail panel. All persistence goes through the callbacks so the same
 * component can be driven by Zustand today and by a Dexie-backed store later.
 */
export function TaskDetailPanel({
  task,
  lists,
  onClose,
  onUpdate,
  onMove,
  onAddStep,
  onToggleStep,
  onDeleteStep,
}: TaskDetailPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const skipTitleCommit = useRef(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const currentList = lists.find((list) => list.id === task.listId);
  const otherLists = lists.filter((list) => list.id !== task.listId);
  const doneSteps = task.steps.filter((step) => step.completed).length;

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (!isMoveOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-task-move]')) {
        return;
      }
      setIsMoveOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress);
  }, [isMoveOpen]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (isMoveOpen) {
        setIsMoveOpen(false);
        return;
      }
      onClose();
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isMoveOpen, onClose]);

  const startEditingTitle = () => {
    skipTitleCommit.current = false;
    setTitleDraft(task.title);
    setIsEditingTitle(true);
  };

  const commitTitle = () => {
    if (skipTitleCommit.current) {
      skipTitleCommit.current = false;
      return;
    }
    const title = titleDraft.trim();
    if (title && title !== task.title) onUpdate({ title });
    setIsEditingTitle(false);
  };

  return (
    <aside
      ref={panelRef}
      className={styles.panel}
      aria-label={copy.task.panelLabel}
      tabIndex={-1}
    >
      <header className={styles.header}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.star}
            aria-pressed={task.important}
            aria-label={task.important ? copy.task.unmarkImportant : copy.task.markImportant}
            onClick={() => onUpdate({ important: !task.important })}
          >
            <StarIcon size={19} />
          </button>

          <div className={styles.moveWrap} data-task-move>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={copy.task.move}
              aria-haspopup="menu"
              aria-expanded={isMoveOpen}
              onClick={() => setIsMoveOpen((current) => !current)}
            >
              <MoreIcon size={19} />
            </button>

            {isMoveOpen ? (
              <div className={styles.moveMenu} role="menu" aria-label={copy.task.moveTitle}>
                <p className={styles.moveTitle}>{copy.task.moveTitle}</p>
                {otherLists.length > 0 ? (
                  otherLists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      role="menuitem"
                      className={styles.moveItem}
                      onClick={() => {
                        onMove(list.id);
                        setIsMoveOpen(false);
                      }}
                    >
                      {copy.task.moveTo.replace('{name}', list.name)}
                    </button>
                  ))
                ) : (
                  <p className={styles.moveEmpty}>{copy.task.moveEmpty}</p>
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className={styles.iconButton}
            aria-label={copy.task.close}
            onClick={onClose}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className={styles.titleBlock}>
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              className={styles.titleInput}
              value={titleDraft}
              aria-label={copy.task.titleLabel}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={commitTitle}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitTitle();
                }
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  skipTitleCommit.current = true;
                  setTitleDraft(task.title);
                  setIsEditingTitle(false);
                }
              }}
            />
          ) : (
            <h2 className={styles.title}>
              <button
                type="button"
                className={styles.titleButton}
                aria-label={`${copy.task.editTitle}: ${task.title}`}
                onClick={startEditingTitle}
              >
                {task.title}
              </button>
            </h2>
          )}

          {currentList ? <p className={styles.listName}>{currentList.name}</p> : null}
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.section} aria-labelledby="task-steps-heading">
          <div className={styles.sectionHeading}>
            <h3 className={styles.sectionTitle} id="task-steps-heading">
              {copy.task.stepsTitle}
            </h3>
            {task.steps.length > 0 ? (
              <span className={styles.progress}>
                {copy.task.stepProgress
                  .replace('{done}', String(doneSteps))
                  .replace('{total}', String(task.steps.length))}
              </span>
            ) : null}
          </div>
          <StepList
            steps={task.steps}
            onAddStep={onAddStep}
            onToggleStep={onToggleStep}
            onDeleteStep={onDeleteStep}
          />
        </section>

        <SoftDivider />

        <section className={styles.section} aria-label={copy.task.remindMe}>
          <TaskScheduleField
            kind="reminder"
            label={copy.task.remindMe}
            value={task.reminder}
            onChange={(reminder) => onUpdate({ reminder })}
          />
          <TaskScheduleField
            kind="due"
            label={copy.task.dueDate}
            value={task.dueDate}
            showOverdue
            onChange={(dueDate) => onUpdate({ dueDate })}
          />
        </section>

        <SoftDivider />

        <RepeatMenu
          value={task.repeat}
          onConfirm={(repeat) => onUpdate({ repeat })}
        />

        <section className={styles.section} aria-labelledby="task-notes-heading">
          <h3 className={styles.sectionTitle} id="task-notes-heading">
            {copy.task.notes}
          </h3>
          <textarea
            className={styles.notes}
            value={task.note}
            placeholder={copy.task.notesPlaceholder}
            aria-label={copy.task.notes}
            rows={5}
            onChange={(event) => onUpdate({ note: event.target.value })}
          />
        </section>
      </div>
    </aside>
  );
}
