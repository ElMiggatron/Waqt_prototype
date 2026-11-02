import { useEffect, useId, useState } from 'react';

import { CloseIcon, TrashIcon } from '../../components/Icons';
import type {
  AcademicSession,
  SessionType,
  TaskRepeat,
  TaskSchedule,
} from '../../domain/types';
import { en } from '../../i18n/en';
import { RepeatMenu } from '../calendar';
import { TaskScheduleField } from '../tasks/TaskScheduleField';
import type { SessionInput } from '../../stores/academicStore';
import {
  compareSchedules,
  EMPTY_REPEAT,
  firstWeekdayOnOrAfter,
  hasRepeat,
} from './academicScheduling';
import styles from './AcademicPanel.module.css';

const copy = en;

interface SessionEditorProps {
  type: SessionType;
  session?: AcademicSession;
  onClose: () => void;
  onSave: (input: SessionInput, sessionId?: string) => void;
  onDelete?: () => void;
}

function cloneRepeat(repeat: TaskRepeat): TaskRepeat {
  return { days: [...repeat.days], monthly: repeat.monthly };
}

/**
 * Session editor for all four session types.
 *
 * `class` hides the monthly calendar: the dates are derived from the first selected
 * repeat weekday. Excursions, exams, and labs show the pop-up monthly calendar for
 * both scheduling checks.
 */
export function SessionEditor({
  type,
  session,
  onClose,
  onSave,
  onDelete,
}: SessionEditorProps) {
  const titleId = useId();
  const isClass = type === 'class';

  const [title, setTitle] = useState(
    () => session?.title ?? copy.academics.sessionTypes[type],
  );
  const [repeat, setRepeat] = useState<TaskRepeat>(() =>
    cloneRepeat(session?.repeat ?? EMPTY_REPEAT),
  );
  const [startTime, setStartTime] = useState(() => session?.start.time ?? '');
  const [endTime, setEndTime] = useState(() => session?.end.time ?? '');
  const [start, setStart] = useState<TaskSchedule | null>(() => session?.start ?? null);
  const [end, setEnd] = useState<TaskSchedule | null>(() => session?.end ?? null);
  const [error, setError] = useState('');

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const submit = () => {
    const trimmedTitle = title.trim() || copy.academics.sessionTypes[type];

    if (isClass) {
      if (!startTime || !endTime) {
        setError(copy.academics.errors.timesRequired);
        return;
      }
      if (!hasRepeat(repeat)) {
        setError(copy.academics.errors.weekdayRequired);
        return;
      }
      if (endTime <= startTime) {
        setError(copy.academics.errors.endBeforeStart);
        return;
      }

      const date = firstWeekdayOnOrAfter(repeat.days);
      onSave(
        {
          type,
          title: trimmedTitle,
          start: { date, time: startTime },
          end: { date, time: endTime },
          repeat: cloneRepeat(repeat),
        },
        session?.id,
      );
      onClose();
      return;
    }

    if (!start || !end) {
      setError(copy.academics.errors.datesRequired);
      return;
    }
    if (!start.time || !end.time) {
      setError(copy.academics.errors.timesRequired);
      return;
    }
    if (compareSchedules(end, start) <= 0) {
      setError(copy.academics.errors.endBeforeStart);
      return;
    }

    onSave(
      {
        type,
        title: trimmedTitle,
        start,
        end,
        repeat: cloneRepeat(repeat),
      },
      session?.id,
    );
    onClose();
  };

  const dialogTitle = (
    session ? copy.academics.editDialogTitle : copy.academics.sessionDialogTitle
  ).replace('{type}', copy.academics.sessionTypes[type]);

  return (
    <div
      className={styles.dialogBackdrop}
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.dialogHeader}>
          <div>
            <p className={styles.dialogEyebrow}>{copy.academics.sessionsTitle}</p>
            <h2 className={styles.dialogTitle} id={titleId}>
              {dialogTitle}
            </h2>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={copy.common.close}
            onClick={onClose}
          >
            <CloseIcon size={18} />
          </button>
        </header>

        <form
          className={styles.dialogBody}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{copy.academics.sessionTitleLabel}</span>
            <input
              className={styles.control}
              value={title}
              autoFocus
              onChange={(event) => {
                setTitle(event.target.value);
                setError('');
              }}
            />
          </label>

          {isClass ? (
            <div className={styles.timeGrid}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>{copy.academics.startTime}</span>
                <input
                  className={styles.control}
                  type="time"
                  value={startTime}
                  onChange={(event) => {
                    setStartTime(event.target.value);
                    setError('');
                  }}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>{copy.academics.endTime}</span>
                <input
                  className={styles.control}
                  type="time"
                  value={endTime}
                  onChange={(event) => {
                    setEndTime(event.target.value);
                    setError('');
                  }}
                />
              </label>
            </div>
          ) : (
            <div className={styles.scheduleGrid}>
              <TaskScheduleField
                kind="due"
                label={copy.academics.startsAt}
                value={start}
                onChange={(value) => {
                  setStart(value);
                  setError('');
                }}
              />
              <TaskScheduleField
                kind="due"
                label={copy.academics.endsAt}
                value={end}
                onChange={(value) => {
                  setEnd(value);
                  setError('');
                }}
              />
            </div>
          )}

          <RepeatMenu
            value={repeat}
            onConfirm={(next) => {
              setRepeat(next);
              setError('');
            }}
            onDiscard={() => setError('')}
          />

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <div className={styles.dialogActions}>
            <button type="submit" className={styles.primaryButton}>
              {copy.academics.saveSession}
            </button>
            <button type="button" className={styles.ghostButton} onClick={onClose}>
              {copy.academics.cancel}
            </button>
            {onDelete ? (
              <button
                type="button"
                className={styles.dangerButton}
                onClick={onDelete}
              >
                <TrashIcon size={15} />
                {copy.academics.deleteSession}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
