import { useMemo, useState } from 'react';

import { CalendarSystemToggle } from '../../components/CalendarSystemToggle';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/Icons';
import { PageHeader } from '../../components/PageHeader';
import { SegmentedSwitch } from '../../components/SegmentedSwitch';
import type { CalendarSystem } from '../../domain/types';
import { en } from '../../i18n/en';
import { addHijriMonths, hijriMonthStart, toHijri } from '../../lib/hijri';
import { WeeklyCalendar } from './WeeklyCalendar';
import {
  addDays,
  buildHijriMonthGrid,
  buildMonthGrid,
  formatGregorianLong,
  formatGregorianMonth,
  formatHijriLong,
  formatHijriMonth,
  formatWeekRange,
  startOfMonth,
  startOfWeek,
  toIsoDate,
  weekEnd,
} from './calendarDates';
import styles from './CalendarView.module.css';

const copy = en;

type ViewMode = 'month' | 'week';

function startOfCurrentMonth(): Date {
  return startOfMonth(new Date());
}

export function CalendarView() {
  const [cursor, setCursor] = useState<Date>(startOfCurrentMonth);
  const [calendar, setCalendar] = useState<CalendarSystem>('gregorian');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);

  const monthDays = useMemo(() => {
    if (viewMode !== 'month') return [];

    if (calendar === 'gregorian') {
      return buildMonthGrid(cursor.getFullYear(), cursor.getMonth(), today);
    }

    const hijri = toHijri(cursor);
    return buildHijriMonthGrid(hijri.year, hijri.month, today);
  }, [calendar, cursor, today, viewMode]);

  const weekStart = useMemo(() => startOfWeek(cursor), [cursor]);
  const selected = monthDays.find((day) => day.iso === selectedIso) ?? null;

  const title =
    viewMode === 'week'
      ? formatWeekRange(calendar, weekStart, weekEnd(weekStart))
      : calendar === 'gregorian'
        ? formatGregorianMonth(cursor)
        : formatHijriMonth(cursor);

  const move = (offset: number) => {
    setSelectedIso(null);

    if (viewMode === 'week') {
      setCursor((current) => addDays(startOfWeek(current), offset * 7));
      return;
    }

    setCursor((current) => {
      if (calendar === 'gregorian') {
        return new Date(current.getFullYear(), current.getMonth() + offset, 1);
      }

      const hijri = toHijri(current);
      const next = addHijriMonths(hijri.year, hijri.month, offset);
      return hijriMonthStart(next.year, next.month);
    });
  };

  const changeView = (next: ViewMode) => {
    if (next === viewMode) return;

    setSelectedIso(null);
    setCursor((current) => {
      if (next === 'week') {
        const now = new Date();
        const isCurrentMonth =
          current.getFullYear() === now.getFullYear() && current.getMonth() === now.getMonth();
        return startOfWeek(isCurrentMonth ? now : current);
      }
      if (calendar === 'gregorian') return startOfMonth(current);

      const hijri = toHijri(current);
      return hijriMonthStart(hijri.year, hijri.month);
    });
    setViewMode(next);
  };

  const changeCalendar = (next: CalendarSystem) => {
    if (next === calendar) return;

    if (next === 'hijri' && viewMode === 'month') {
      // Use mid-Gregorian-month so the Hijri month covering most of the visible
      // month becomes the anchor, then snap to that Hijri month's first day.
      const anchor = new Date(cursor.getFullYear(), cursor.getMonth(), 15);
      const hijri = toHijri(anchor);
      setCursor(hijriMonthStart(hijri.year, hijri.month));
    }

    setCalendar(next);
    setSelectedIso(null);
  };

  const goToToday = () => {
    const now = new Date();

    if (viewMode === 'week') {
      setCursor(startOfWeek(now));
    } else if (calendar === 'gregorian') {
      setCursor(startOfMonth(now));
    } else {
      const hijri = toHijri(now);
      setCursor(hijriMonthStart(hijri.year, hijri.month));
    }

    setSelectedIso(toIsoDate(now));
  };

  const previousLabel =
    viewMode === 'week' ? copy.calendar.previousWeek : copy.calendar.previousMonth;
  const nextLabel = viewMode === 'week' ? copy.calendar.nextWeek : copy.calendar.nextMonth;

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={copy.app.name}
        title={copy.calendar.title}
        description={copy.calendar.description}
        actions={
          <div className={styles.headerActions}>
            <CalendarSystemToggle value={calendar} onChange={changeCalendar} />
            <SegmentedSwitch
              value={viewMode}
              onChange={changeView}
              label={copy.calendar.viewSwitchLabel}
              options={[
                { value: 'month', label: copy.calendar.monthView },
                { value: 'week', label: copy.calendar.weekView },
              ]}
            />
          </div>
        }
      />

      <section className={styles.calendarCard} aria-label={title}>
        <div className={styles.toolbar}>
          <div className={styles.monthControls}>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={previousLabel}
              onClick={() => move(-1)}
            >
              <ChevronLeftIcon size={18} />
            </button>
            <h2 className={styles.monthTitle}>{title}</h2>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={nextLabel}
              onClick={() => move(1)}
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>
          <button type="button" className={styles.todayButton} onClick={goToToday}>
            {copy.calendar.today}
          </button>
        </div>

        {viewMode === 'month' ? (
          <>
            <div className={styles.weekdayRow} aria-hidden="true">
              {copy.calendar.weekdays.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className={styles.grid}>
              {monthDays.map((day) => {
                const isSelected = selectedIso === day.iso;
                return (
                  <button
                    key={day.iso}
                    type="button"
                    className={[
                      styles.day,
                      day.inMonth ? '' : styles.isOutside,
                      day.isToday ? styles.isToday : '',
                      isSelected ? styles.isSelected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={isSelected}
                    aria-label={`${formatGregorianLong(day.date)}; ${formatHijriLong(day.date)}`}
                    onClick={() => setSelectedIso(day.iso)}
                  >
                    <span className={styles.dayNumber}>
                      {calendar === 'gregorian' ? day.gregorianDay : day.hijriDay}
                    </span>
                    <span className={styles.daySecondary}>
                      {calendar === 'gregorian' ? day.hijriDay : day.gregorianDay}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className={styles.caption}>
              {calendar === 'hijri' ? copy.calendar.hijriNote : copy.calendar.pickDay}
            </p>
          </>
        ) : (
          <WeeklyCalendar weekStart={weekStart} today={today} calendar={calendar} />
        )}
      </section>

      {viewMode === 'month' ? (
        <section className={styles.selection} aria-live="polite">
          {selected ? (
            <>
              <div className={styles.selectionBlock}>
                <p className={styles.selectionLabel}>{copy.calendar.gregorianLabel}</p>
                <p className={styles.selectionValue}>{formatGregorianLong(selected.date)}</p>
              </div>
              <div className={styles.selectionBlock}>
                <p className={styles.selectionLabel}>{copy.calendar.hijriLabel}</p>
                <p className={styles.selectionValue}>{formatHijriLong(selected.date)}</p>
              </div>
            </>
          ) : (
            <p className={styles.selectionEmpty}>{copy.calendar.pickDay}</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
