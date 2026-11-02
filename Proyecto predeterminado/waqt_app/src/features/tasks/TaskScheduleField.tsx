import { useId, useState } from 'react';

import { BellIcon, CalendarIcon } from '../../components/Icons';
import { MiniMonthCalendar } from '../../components/MiniMonthCalendar';
import type { ISODate, TaskSchedule } from '../../domain/types';
import { en } from '../../i18n/en';
import { formatSchedule, isScheduleOverdue, toIsoDate } from '../../lib/dates';
import styles from './TaskScheduleField.module.css';

const copy = en;

export interface TaskScheduleFieldProps {
  kind: 'reminder' | 'due';
  label: string;
  value: TaskSchedule | null;
  onChange: (value: TaskSchedule | null) => void;
  /** Due dates turn red once their instant has passed. */
  showOverdue?: boolean;
}

/**
 * SPEC: clicking the field reveals an embedded monthly calendar. Once set, the field
 * shows coloured date / time text and reopens the picker when clicked again.
 */
export function TaskScheduleField({
  kind,
  label,
  value,
  onChange,
  showOverdue = false,
}: TaskScheduleFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<ISODate>(
    () => value?.date ?? toIsoDate(new Date()),
  );
  const [draftTime, setDraftTime] = useState(() => value?.time ?? '');

  const isOverdue = Boolean(value && showOverdue && isScheduleOverdue(value));
  const Icon = kind === 'reminder' ? BellIcon : CalendarIcon;
  const inputId = `task-schedule-${useId()}`;

  const openPicker = () => {
    setDraftDate(value?.date ?? toIsoDate(new Date()));
    setDraftTime(value?.time ?? '');
    setIsOpen((current) => !current);
  };

  const commit = (next: TaskSchedule | null) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <div className={styles.field} data-schedule-field={kind}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${inputId}-picker` : undefined}
        onClick={openPicker}
      >
        <span className={styles.icon} aria-hidden="true">
          <Icon size={16} />
        </span>
        <span className={styles.label}>{label}</span>
        <span
          className={[
            styles.value,
            value ? styles.hasValue : '',
            isOverdue ? styles.isOverdue : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value ? formatSchedule(value) : copy.task.notSet}
        </span>
        {isOverdue ? <span className={styles.overdueTag}>{copy.task.overdue}</span> : null}
      </button>

      {isOpen ? (
        <div className={styles.picker} id={`${inputId}-picker`}>
          <MiniMonthCalendar
            value={draftDate}
            onSelect={setDraftDate}
            labels={{
              previousMonth: copy.calendar.previousMonth,
              nextMonth: copy.calendar.nextMonth,
              weekdays: copy.calendar.narrowWeekdays,
            }}
          />

          <label className={styles.timeField} htmlFor={inputId}>
            <span>{copy.task.time}</span>
            <input
              id={inputId}
              type="time"
              className={styles.timeInput}
              value={draftTime}
              onChange={(event) => setDraftTime(event.target.value)}
            />
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.apply}
              onClick={() => commit({ date: draftDate, time: draftTime })}
            >
              {copy.task.set}
            </button>
            <button
              type="button"
              className={styles.clear}
              disabled={!value}
              onClick={() => commit(null)}
            >
              {copy.task.clear}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
