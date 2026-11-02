import { useEffect, useMemo, useState } from 'react';

import type { TaskRepeat } from '../../domain/types';
import { en } from '../../i18n/en';
import styles from './RepeatMenu.module.css';

const copy = en;

export interface RepeatMenuProps {
  /** Committed repeat rule owned by the task. */
  value: TaskRepeat;
  onConfirm: (repeat: TaskRepeat) => void;
  onDiscard?: () => void;
}

function summarize(repeat: TaskRepeat): string {
  if (repeat.monthly) return copy.task.repeatMonthly;

  const days = repeat.days
    .map((isOn, index) => (isOn ? copy.calendar.weekdays[index] : null))
    .filter((day) => Boolean(day));

  if (days.length === 0) return copy.task.repeatNone;
  return copy.task.repeatWeekly.replace('{days}', days.join(', '));
}

/**
 * SPEC: a box titled "Repeat" with seven Monday-first day circles, a monthly tick box,
 * and Confirm / Discard actions. Edits are staged locally until Confirm.
 */
export function RepeatMenu({ value, onConfirm, onDiscard }: RepeatMenuProps) {
  const [draft, setDraft] = useState<TaskRepeat>(() => ({
    days: [...value.days],
    monthly: value.monthly,
  }));

  useEffect(() => {
    setDraft({ days: [...value.days], monthly: value.monthly });
  }, [value]);

  const summary = useMemo(() => summarize(draft), [draft]);

  const toggleDay = (index: number) => {
    setDraft((current) => {
      const days = [...current.days];
      days[index] = !days[index];
      // DECISION: the monthly tick box and weekday circles are mutually exclusive.
      return { days, monthly: false };
    });
  };

  const toggleMonthly = () => {
    setDraft((current) =>
      current.monthly
        ? { days: [...current.days], monthly: false }
        : { days: current.days.map(() => false), monthly: true },
    );
  };

  return (
    <section className={styles.repeat} aria-labelledby="task-repeat-heading">
      <div className={styles.heading}>
        <h3 className={styles.title} id="task-repeat-heading">
          {copy.task.repeatTitle}
        </h3>
        <p className={styles.summary}>{summary}</p>
      </div>

      <p className={styles.hint} id="task-repeat-hint">
        {copy.task.repeatHint}
      </p>

      <div
        className={styles.days}
        role="group"
        aria-label={copy.task.repeatTitle}
        aria-describedby="task-repeat-hint"
      >
        {draft.days.map((isOn, index) => (
          <button
            key={`${copy.calendar.weekdaysLong[index]}`}
            type="button"
            className={styles.day}
            aria-pressed={isOn}
            aria-label={copy.task.repeatDayLabel.replace(
              '{day}',
              copy.calendar.weekdaysLong[index] ?? '',
            )}
            onClick={() => toggleDay(index)}
          >
            {copy.task.repeatDays[index]}
          </button>
        ))}
      </div>

      <label className={styles.monthly}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={draft.monthly}
          onChange={toggleMonthly}
        />
        <span>{copy.task.monthly}</span>
      </label>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.confirm}
          onClick={() =>
            onConfirm({ days: [...draft.days], monthly: draft.monthly })
          }
        >
          {copy.task.confirm}
        </button>
        <button
          type="button"
          className={styles.discard}
          onClick={() => {
            setDraft({ days: [...value.days], monthly: value.monthly });
            onDiscard?.();
          }}
        >
          {copy.task.discard}
        </button>
      </div>
    </section>
  );
}
