import type { ISODate, TaskSchedule } from '../domain/types';

/**
 * Gregorian date helpers for task reminders and due dates.
 *
 * Persisted dates are `YYYY-MM-DD` strings interpreted in the user's local wall clock.
 * Times are `HH:mm`; an empty time means the schedule is all-day.
 */

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const longDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
});

export function toIsoDate(date: Date): ISODate {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Local-midnight parse; avoids the UTC shift of `new Date('YYYY-MM-DD')`. */
export function parseIsoDate(iso: ISODate): Date {
  const [yearPart, monthPart, dayPart] = iso.split('-');
  return new Date(
    Number(yearPart ?? 1970),
    Number(monthPart ?? 1) - 1,
    Number(dayPart ?? 1),
  );
}

export function formatIsoDate(iso: ISODate): string {
  return shortDateFormatter.format(parseIsoDate(iso));
}

export function formatIsoDateLong(iso: ISODate): string {
  return longDateFormatter.format(parseIsoDate(iso));
}

export function formatSchedule(schedule: TaskSchedule): string {
  const date = formatIsoDate(schedule.date);
  return schedule.time ? `${date} · ${schedule.time}` : date;
}

/** All-day schedules become overdue at the end of their date. */
export function isScheduleOverdue(schedule: TaskSchedule, now = new Date()): boolean {
  const date = parseIsoDate(schedule.date);

  if (schedule.time) {
    const [hoursPart, minutesPart] = schedule.time.split(':');
    date.setHours(Number(hoursPart ?? 0), Number(minutesPart ?? 0), 0, 0);
  } else {
    date.setHours(23, 59, 59, 999);
  }

  return date.getTime() < now.getTime();
}

/** Six-week, Monday-first grid used by the small calendar in the task panel. */
export function buildMonthGrid(year: number, month: number): ISODate[] {
  const firstOfMonth = new Date(year, month, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) =>
    toIsoDate(
      new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + index,
      ),
    ),
  );
}

export function formatMonthTitle(year: number, month: number): string {
  return monthFormatter.format(new Date(year, month, 1));
}

export function isSameMonth(iso: ISODate, year: number, month: number): boolean {
  const date = parseIsoDate(iso);
  return date.getFullYear() === year && date.getMonth() === month;
}
