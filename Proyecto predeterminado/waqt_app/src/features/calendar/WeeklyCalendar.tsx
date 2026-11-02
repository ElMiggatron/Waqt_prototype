import { useMemo } from 'react';

import type { CalendarSystem } from '../../domain/types';
import { buildWeekDays, startOfWeek } from '../../lib/calendar';
import { en } from '../../i18n/en';
import { useAcademicStore } from '../../stores/academicStore';
import { useIntellectualStore } from '../../stores/intellectualStore';
import { useListStore } from '../../stores/listStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatGregorianLong, formatHijriLong } from './calendarDates';
import { collectWeekEvents, formatMinutes, timeToMinutes } from './weeklyEvents';
import type { WeekEvent, WeekEventKind } from './weeklyEvents';
import styles from './WeeklyCalendar.module.css';

const copy = en;
const HOUR_HEIGHT = 56;

const KIND_CLASS: Record<WeekEventKind, string> = {
  academic: styles.kindAcademic ?? '',
  intellectual: styles.kindIntellectual ?? '',
  project: styles.kindProject ?? '',
  list: styles.kindList ?? '',
};

interface WeeklyCalendarProps {
  weekStart: Date;
  today: Date;
  calendar: CalendarSystem;
}

function eventPosition(
  event: WeekEvent,
  rangeStart: number,
  laneHeight: number,
): { top: number; height: number } | null {
  if (event.startMinutes === null) return null;

  const top = Math.max(0, ((event.startMinutes - rangeStart) / 60) * HOUR_HEIGHT);
  const duration = Math.max(30, (event.endMinutes ?? event.startMinutes + 30) - event.startMinutes);
  const rawHeight = Math.max(26, (duration / 60) * HOUR_HEIGHT);
  return { top, height: Math.max(12, Math.min(rawHeight, laneHeight - top)) };
}

/**
 * SPEC weekly view: seven day columns in broad view, two scrollable columns in
 * phone view, from the wake time to the sleep time, with colour-coded tasks.
 */
export function WeeklyCalendar({ weekStart, today, calendar }: WeeklyCalendarProps) {
  const tasks = useListStore((state) => state.tasks);
  const subjects = useAcademicStore((state) => state.subjects);
  const academicTasks = useAcademicStore((state) => state.tasks);
  const intellectualSubjects = useIntellectualStore((state) => state.subjects);
  const intellectualTasks = useIntellectualStore((state) => state.tasks);
  const wakeTime = useSettingsStore((state) => state.wakeTime);
  const sleepTime = useSettingsStore((state) => state.sleepTime);

  const monday = useMemo(() => startOfWeek(weekStart), [weekStart]);
  const days = useMemo(() => buildWeekDays(monday, today), [monday, today]);
  const weekEvents = useMemo(
    () =>
      collectWeekEvents(monday, {
        tasks,
        subjects,
        academicTasks,
        intellectualSubjects,
        intellectualTasks,
      }),
    [academicTasks, intellectualSubjects, intellectualTasks, monday, subjects, tasks],
  );

  const rangeStart = timeToMinutes(wakeTime) ?? 5 * 60;
  const rawRangeEnd = timeToMinutes(sleepTime) ?? 22 * 60 + 30;
  const rangeEnd = rawRangeEnd > rangeStart ? rawRangeEnd : rawRangeEnd + 24 * 60;
  const laneHeight = ((rangeEnd - rangeStart) / 60) * HOUR_HEIGHT;

  const hourMarks: number[] = [];
  for (let minute = Math.ceil(rangeStart / 60) * 60; minute <= rangeEnd; minute += 60) {
    hourMarks.push(minute);
  }

  const outsideCount = days.reduce((total, day) => {
    const dayEvents = weekEvents[day.iso] ?? [];
    return (
      total +
      dayEvents.filter((event) => {
        const start = event.startMinutes;
        return start !== null && (start < rangeStart || start >= rangeEnd);
      }).length
    );
  }, 0);

  return (
    <div className={styles.weekView}>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={[styles.swatch, styles.kindAcademic].join(' ')} />
          {copy.calendar.legendAcademic}
        </span>
        <span className={styles.legendItem}>
          <span className={[styles.swatch, styles.kindIntellectual].join(' ')} />
          {copy.calendar.legendIntellectual}
        </span>
        <span className={styles.legendItem}>
          <span className={[styles.swatch, styles.kindProject].join(' ')} />
          {copy.calendar.legendProject}
        </span>
        <span className={styles.legendItem}>
          <span className={[styles.swatch, styles.kindList].join(' ')} />
          {copy.calendar.legendList}
        </span>
        <span className={styles.legendItem}>
          <span className={[styles.swatch, styles.salah].join(' ')} />
          {copy.calendar.legendSalah}
        </span>
      </div>

      <div className={styles.scroll} role="region" aria-label={copy.calendar.weekView}>
        <div className={styles.grid}>
          <div className={styles.gutter} aria-hidden="true">
            <div className={styles.headerSpacer} />
            <div className={styles.allDaySpacer}>{copy.calendar.allDay}</div>
            <div className={styles.timeColumn} style={{ height: `${laneHeight}px` }}>
              {hourMarks.map((minute) => (
                <span
                  key={minute}
                  className={styles.timeLabel}
                  style={{ top: `${((minute - rangeStart) / 60) * HOUR_HEIGHT}px` }}
                >
                  {formatMinutes(minute)}
                </span>
              ))}
            </div>
          </div>

          {days.map((day) => {
            const dayEvents = weekEvents[day.iso] ?? [];
            const allDayEvents = dayEvents.filter((event) => event.startMinutes === null);
            const timedEvents = dayEvents
              .filter((event) => {
                const start = event.startMinutes;
                return start !== null && start >= rangeStart && start < rangeEnd;
              })
              .sort((left, right) => (left.startMinutes ?? 0) - (right.startMinutes ?? 0));

            return (
              <section
                key={day.iso}
                className={styles.dayColumn}
                aria-label={`${copy.calendar.weekdaysLong[day.weekdayIndex] ?? ''}: ${formatGregorianLong(day.date)}; ${formatHijriLong(day.date)}`}
              >
                <header className={styles.dayHeader}>
                  <span className={styles.weekday}>
                    {copy.calendar.weekdays[day.weekdayIndex] ?? ''}
                  </span>
                  <span
                    className={[styles.dateCircle, day.isToday ? styles.isToday : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {calendar === 'gregorian' ? day.gregorianDay : day.hijriDay}
                  </span>
                  <span className={styles.secondaryDate}>
                    {calendar === 'gregorian' ? day.hijriDay : day.gregorianDay}
                  </span>
                </header>

                <div className={styles.allDayRow}>
                  {allDayEvents.map((event) => (
                    <span
                      key={event.id}
                      className={[styles.allDayEvent, KIND_CLASS[event.kind], event.completed ? styles.isDone : '']
                        .filter(Boolean)
                        .join(' ')}
                      title={event.title}
                    >
                      {event.title}
                    </span>
                  ))}
                </div>

                <div className={styles.lane} style={{ height: `${laneHeight}px` }}>
                  {hourMarks.map((minute) => (
                    <span
                      key={minute}
                      className={styles.hourLine}
                      style={{ top: `${((minute - rangeStart) / 60) * HOUR_HEIGHT}px` }}
                    />
                  ))}

                  {timedEvents.map((event) => {
                    const position = eventPosition(event, rangeStart, laneHeight);
                    if (!position) return null;

                    return (
                      <div
                        key={event.id}
                        className={[styles.event, KIND_CLASS[event.kind], event.completed ? styles.isDone : '']
                          .filter(Boolean)
                          .join(' ')}
                        style={{ top: `${position.top}px`, height: `${position.height}px` }}
                        title={`${event.title} · ${formatMinutes(event.startMinutes ?? 0)}`}
                      >
                        <span className={styles.eventTime}>
                          {formatMinutes(event.startMinutes ?? 0)}
                        </span>
                        <span className={styles.eventTitle}>{event.title}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {outsideCount > 0 ? (
        <p className={styles.outsideNote}>
          {copy.calendar.outsideHours.replace('{count}', String(outsideCount))}
        </p>
      ) : null}
      <p className={styles.salahNote}>{copy.calendar.salahPending}</p>
    </div>
  );
}
