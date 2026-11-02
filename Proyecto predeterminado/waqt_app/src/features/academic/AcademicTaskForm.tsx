import { useState } from 'react';

import type { ID, TaskSchedule } from '../../domain/types';
import { en } from '../../i18n/en';
import { useAcademicStore } from '../../stores/academicStore';
import { compareSchedules } from './academicScheduling';
import { TaskScheduleField } from '../tasks/TaskScheduleField';
import styles from './AcademicPanel.module.css';

const copy = en;

interface AcademicTaskFormProps {
  subjectId: ID;
}

/**
 * SPEC: title, a monthly calendar for the draft due date, and a second one for the
 * final due date. Academic tasks never offer a list move.
 */
export function AcademicTaskForm({ subjectId }: AcademicTaskFormProps) {
  const addTask = useAcademicStore((state) => state.addTask);
  const [title, setTitle] = useState('');
  const [draftDue, setDraftDue] = useState<TaskSchedule | null>(null);
  const [finalDue, setFinalDue] = useState<TaskSchedule | null>(null);
  const [error, setError] = useState('');

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError(copy.academics.errors.taskTitleRequired);
      return;
    }
    if (draftDue && finalDue && compareSchedules(draftDue, finalDue) > 0) {
      setError(copy.academics.errors.draftAfterFinal);
      return;
    }

    addTask(subjectId, trimmed, draftDue, finalDue);
    setTitle('');
    setDraftDue(null);
    setFinalDue(null);
    setError('');
  };

  return (
    <form
      className={styles.taskForm}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className={styles.taskInputRow}>
        <input
          className={styles.control}
          value={title}
          placeholder={copy.academics.taskPlaceholder}
          aria-label={copy.academics.taskPlaceholder}
          onChange={(event) => {
            setTitle(event.target.value);
            setError('');
          }}
        />
        <button type="submit" className={styles.primaryButton}>
          {copy.academics.addTask}
        </button>
      </div>

      <div className={styles.scheduleGrid}>
        <TaskScheduleField
          kind="due"
          label={copy.academics.draftDue}
          value={draftDue}
          onChange={(value) => {
            setDraftDue(value);
            setError('');
          }}
        />
        <TaskScheduleField
          kind="due"
          label={copy.academics.finalDue}
          value={finalDue}
          showOverdue
          onChange={(value) => {
            setFinalDue(value);
            setError('');
          }}
        />
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
