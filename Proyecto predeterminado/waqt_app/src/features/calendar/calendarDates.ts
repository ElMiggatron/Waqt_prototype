/** Date helpers for the calendar shell. Persisted dates are always Gregorian ISO strings. */

import type { CalendarSystem } from '../../domain/types';
import {
  formatHijriLong as formatHijriLongDate,
  formatHijriMonth as formatHijriMonthDate,
  toHijri,
} from '../../lib/hijri';
import { addDays } from '../../lib/calendar';

export {
  addDays,
  buildHijriMonthGrid,
  buildMonthGrid,
  buildWeekDays,
  startOfMonth,
  startOfWeek,
  toIsoDate,
} from '../../lib/calendar';
export type { CalendarDay } from '../../lib/calendar';

const gregorianMonthFormatter = new Intl.DateTimeFormat('en', {
  month: 'long',
  year: 'numeric',
});

const gregorianLongFormatter = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const gregorianDayMonthFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
});

const gregorianDayMonthYearFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatGregorianMonth(date: Date): string {
  return gregorianMonthFormatter.format(date);
}

export function formatGregorianLong(date: Date): string {
  return gregorianLongFormatter.format(date);
}

export function formatHijriLong(date: Date): string {
  return formatHijriLongDate(date);
}

export function formatHijriMonth(date: Date): string {
  return formatHijriMonthDate(date);
}

/** A compact title for the weekly toolbar, in whichever calendar is active. */
export function formatWeekRange(
  calendar: CalendarSystem,
  start: Date,
  end: Date,
): string {
  if (calendar === 'gregorian') {
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.getDate()}–${end.getDate()} ${formatGregorianMonth(start)}`;
    }
    return `${gregorianDayMonthFormatter.format(start)} – ${gregorianDayMonthYearFormatter.format(end)}`;
  }

  const hijriStart = toHijri(start);
  const hijriEnd = toHijri(end);

  if (hijriStart.year === hijriEnd.year && hijriStart.month === hijriEnd.month) {
    return `${hijriStart.day}–${hijriEnd.day} ${formatHijriMonth(start)}`;
  }

  return `${hijriStart.day} ${formatHijriMonth(start)} – ${hijriEnd.day} ${formatHijriMonth(end)}`;
}

export function weekEnd(start: Date): Date {
  return addDays(start, 6);
}
