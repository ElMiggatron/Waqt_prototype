/**
 * Hijri conversion helpers.
 *
 * Persisted dates stay Gregorian. Hijri is a presentation layer built on the
 * Umm al-Qura calendar that ships with `Intl`, so no external table is needed.
 */

const HIJRI_LOCALE = 'en-u-ca-islamic-umalqura';

const partsFormatter = new Intl.DateTimeFormat(HIJRI_LOCALE, {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

const hijriDayFormatter = new Intl.DateTimeFormat(HIJRI_LOCALE, {
  day: 'numeric',
});

const hijriLongFormatter = new Intl.DateTimeFormat(HIJRI_LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const hijriMonthFormatter = new Intl.DateTimeFormat(HIJRI_LOCALE, {
  month: 'long',
  year: 'numeric',
});

export interface HijriDate {
  year: number;
  /** 1 = Muharram … 12 = Dhul-Hijjah. */
  month: number;
  day: number;
}

/** A stable reference point for estimating a Hijri month start. */
const ANCHOR_GREGORIAN = new Date(2026, 10, 2);
const ANCHOR_HIJRI: HijriDate = { year: 1448, month: 5, day: 22 };
const AVERAGE_HIJRI_YEAR = 354.36667;
const AVERAGE_HIJRI_MONTH = 29.53058;

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function toHijri(date: Date): HijriDate {
  let year = 0;
  let month = 0;
  let day = 0;

  for (const part of partsFormatter.formatToParts(date)) {
    if (part.type === 'year') year = Number(part.value);
    else if (part.type === 'month') month = Number(part.value);
    else if (part.type === 'day') day = Number(part.value);
  }

  return { year, month, day };
}

export function formatHijriDay(date: Date): string {
  return hijriDayFormatter.format(date);
}

export function formatHijriLong(date: Date): string {
  return hijriLongFormatter.format(date);
}

export function formatHijriMonth(date: Date): string {
  return hijriMonthFormatter.format(date);
}

/** Moves a Hijri year/month pair without touching a Gregorian date. */
export function addHijriMonths(
  year: number,
  month: number,
  offset: number,
): { year: number; month: number } {
  const index = year * 12 + (month - 1) + offset;
  return {
    year: Math.floor(index / 12),
    month: (((index % 12) + 12) % 12) + 1,
  };
}

/**
 * Resolves the Gregorian date of Hijri day 1 for a month.
 *
 * `Intl` only converts Gregorian → Hijri, so we estimate the date from a nearby
 * anchor and scan the surrounding days for an exact match. The scan is tiny and
 * runs only when the visible Hijri month changes.
 */
export function hijriMonthStart(year: number, month: number): Date {
  const estimate = addDays(
    ANCHOR_GREGORIAN,
    Math.round(
      (year - ANCHOR_HIJRI.year) * AVERAGE_HIJRI_YEAR +
        (month - ANCHOR_HIJRI.month) * AVERAGE_HIJRI_MONTH +
        (1 - ANCHOR_HIJRI.day),
    ),
  );

  let closest: Date | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (let offset = -60; offset <= 60; offset += 1) {
    const candidate = addDays(estimate, offset);
    const parts = toHijri(candidate);
    if (parts.year !== year || parts.month !== month) continue;

    if (parts.day === 1) return candidate;

    const distance = Math.abs(parts.day - 1);
    if (distance < closestDistance) {
      closest = candidate;
      closestDistance = distance;
    }
  }

  return closest ?? estimate;
}

export function formatHijriMonthFor(year: number, month: number): string {
  return formatHijriMonth(hijriMonthStart(year, month));
}
