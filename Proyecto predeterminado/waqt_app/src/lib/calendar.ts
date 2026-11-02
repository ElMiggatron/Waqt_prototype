import type { ISODate } from '../domain/types';
import { formatHijriDay, hijriMonthStart, toHijri } from './hijri';
import { toIsoDate } from './dates';

export { toIsoDate };

export interface CalendarDay {
  date: Date;
  iso: ISODate;
  gregorianYear: number;
  gregorianMonth: number;
  gregorianDay: number;
  hijriYear: number;
  hijriMonth: number;
  /** Numeric string from `Intl`, e.g. "22". */
  hijriDay: string;
  hijriDayNumber: number;
  inMonth: boolean;
  isToday: boolean;
  /** Monday-first index: 0 = Monday … 6 = Sunday. */
  weekdayIndex: number;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Local Monday at midnight for the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayOffset = (copy.getDay() + 6) % 7;
  return addDays(copy, -mondayOffset);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function makeCalendarDay(date: Date, today: Date, inMonth: boolean): CalendarDay {
  const hijri = toHijri(date);

  return {
    date,
    iso: toIsoDate(date),
    gregorianYear: date.getFullYear(),
    gregorianMonth: date.getMonth(),
    gregorianDay: date.getDate(),
    hijriYear: hijri.year,
    hijriMonth: hijri.month,
    hijriDay: formatHijriDay(date),
    hijriDayNumber: hijri.day,
    inMonth,
    isToday: toIsoDate(date) === toIsoDate(today),
    weekdayIndex: (date.getDay() + 6) % 7,
  };
}

/** Six weeks, Monday first, for a Gregorian month. */
export function buildMonthGrid(
  year: number,
  month: number,
  today = new Date(),
): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addDays(firstOfMonth, -mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return makeCalendarDay(date, today, date.getMonth() === month);
  });
}

/** Six weeks, Monday first, spanning one Hijri month. */
export function buildHijriMonthGrid(
  hijriYear: number,
  hijriMonth: number,
  today = new Date(),
): CalendarDay[] {
  const monthStart = hijriMonthStart(hijriYear, hijriMonth);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = addDays(monthStart, -mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    const hijri = toHijri(date);
    return makeCalendarDay(
      date,
      today,
      hijri.year === hijriYear && hijri.month === hijriMonth,
    );
  });
}

/** Seven days beginning on `weekStart` (which should be a Monday). */
export function buildWeekDays(weekStart: Date, today = new Date()): CalendarDay[] {
  const monday = startOfWeek(weekStart);
  return Array.from({ length: 7 }, (_, index) =>
    makeCalendarDay(addDays(monday, index), today, true),
  );
}
