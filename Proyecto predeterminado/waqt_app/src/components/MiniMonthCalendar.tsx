import { useState } from 'react';

import type { CalendarSystem, ISODate } from '../domain/types';
import { buildHijriMonthGrid, buildMonthGrid, toIsoDate } from '../lib/calendar';
import { formatIsoDateLong, formatMonthTitle, parseIsoDate } from '../lib/dates';
import { addHijriMonths, formatHijriLong, formatHijriMonth, hijriMonthStart, toHijri } from '../lib/hijri';
import { CalendarSystemToggle } from './CalendarSystemToggle';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import styles from './MiniMonthCalendar.module.css';

export interface MiniMonthCalendarLabels {
  previousMonth: string;
  nextMonth: string;
  /** Monday-first, seven entries. */
  weekdays: readonly string[];
}

interface MiniMonthCalendarProps {
  /** Selected date, or `null` when nothing is chosen yet. */
  value: ISODate | null;
  onSelect: (date: ISODate) => void;
  labels: MiniMonthCalendarLabels;
}

/**
 * Compact six-week month grid used inside the task panel.
 * The parent owns the selected Gregorian date; this component owns the visible
 * month and the Gregorian/Hijri presentation.
 */
export function MiniMonthCalendar({ value, onSelect, labels }: MiniMonthCalendarProps) {
  const todayIso = toIsoDate(new Date());
  const [calendar, setCalendar] = useState<CalendarSystem>('gregorian');
  const [cursor, setCursor] = useState<Date>(() => parseIsoDate(value ?? todayIso));

  const hijriCursor = toHijri(cursor);
  const days =
    calendar === 'gregorian'
      ? buildMonthGrid(cursor.getFullYear(), cursor.getMonth())
      : buildHijriMonthGrid(hijriCursor.year, hijriCursor.month);
  const monthTitle =
    calendar === 'gregorian'
      ? formatMonthTitle(cursor.getFullYear(), cursor.getMonth())
      : formatHijriMonth(cursor);

  const moveMonth = (offset: number) => {
    setCursor((current) => {
      if (calendar === 'gregorian') {
        return new Date(current.getFullYear(), current.getMonth() + offset, 1);
      }
      const hijri = toHijri(current);
      const next = addHijriMonths(hijri.year, hijri.month, offset);
      return hijriMonthStart(next.year, next.month);
    });
  };

  return (
    <div className={styles.calendar} role="group" aria-label={monthTitle}>
      <div className={styles.topBar}>
        <CalendarSystemToggle compact value={calendar} onChange={setCalendar} />
      </div>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={labels.previousMonth}
          onClick={() => moveMonth(-1)}
        >
          <ChevronLeftIcon size={16} />
        </button>
        <p className={styles.monthTitle} aria-live="polite">
          {monthTitle}
        </p>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={labels.nextMonth}
          onClick={() => moveMonth(1)}
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>

      <div className={styles.weekdayRow} aria-hidden="true">
        {labels.weekdays.map((weekday, index) => (
          <span key={`${weekday}-${index}`}>{weekday}</span>
        ))}
      </div>

      <div className={styles.grid}>
        {days.map((day) => {
          const isSelected = day.iso === value;
          const isToday = day.iso === todayIso;

          return (
            <button
              key={day.iso}
              type="button"
              className={[
                styles.day,
                day.inMonth ? '' : styles.isOutside,
                isToday ? styles.isToday : '',
                isSelected ? styles.isSelected : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-pressed={isSelected}
              aria-label={`${formatIsoDateLong(day.iso)}; ${formatHijriLong(day.date)}`}
              onClick={() => onSelect(day.iso)}
            >
              {calendar === 'gregorian' ? day.gregorianDay : day.hijriDay}
            </button>
          );
        })}
      </div>
    </div>
  );
}
