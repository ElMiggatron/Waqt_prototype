import type { ISODate, TaskRepeat, TaskSchedule } from '../../domain/types';
import { parseIsoDate, toIsoDate } from '../../lib/dates';

export const EMPTY_REPEAT: TaskRepeat = {
  days: [false, false, false, false, false, false, false],
  monthly: false,
};

export function hasRepeat(repeat: TaskRepeat): boolean {
  return repeat.monthly || repeat.days.some(Boolean);
}

/**
 * SPEC (§2.6): class sessions hide the monthly calendar and derive `start.date` /
 * `end.date` from the first occurrence of the earliest selected weekday on/after today.
 * Monday-first, matching `TaskRepeat.days`.
 */
export function firstWeekdayOnOrAfter(
  days: readonly boolean[],
  from = new Date(),
): ISODate {
  const todayIndex = (from.getDay() + 6) % 7;

  for (let offset = 0; offset < 7; offset += 1) {
    const index = (todayIndex + offset) % 7;
    if (days[index]) {
      return toIsoDate(
        new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset),
      );
    }
  }

  return toIsoDate(from);
}

/** Compares two date + optional-time schedules as local wall-clock instants. */
export function compareSchedules(a: TaskSchedule, b: TaskSchedule): number {
  const toInstant = (schedule: TaskSchedule) => {
    const date = parseIsoDate(schedule.date);
    const [hoursPart, minutesPart] = schedule.time.split(':');
    date.setHours(Number(hoursPart ?? 0), Number(minutesPart ?? 0), 0, 0);
    return date.getTime();
  };

  return toInstant(a) - toInstant(b);
}
