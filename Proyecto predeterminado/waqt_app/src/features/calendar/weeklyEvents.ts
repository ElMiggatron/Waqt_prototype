import type {
  AcademicSubject,
  ID,
  IntellectualSubject,
  ISODate,
  SubjectTask,
  Task,
  TaskRepeat,
} from '../../domain/types';
import { addDays, toIsoDate } from '../../lib/calendar';
import { parseIsoDate } from '../../lib/dates';

export type WeekEventKind = 'academic' | 'intellectual' | 'project' | 'list';

export interface WeekEvent {
  id: string;
  title: string;
  kind: WeekEventKind;
  /** Null means the event belongs in the all-day row. */
  startMinutes: number | null;
  endMinutes: number | null;
  completed: boolean;
}

export interface WeekEventSources {
  tasks: Record<ID, Task>;
  subjects: readonly AcademicSubject[];
  academicTasks: readonly SubjectTask[];
  intellectualSubjects: readonly IntellectualSubject[];
  intellectualTasks: readonly SubjectTask[];
}

const DEFAULT_TASK_DURATION = 45;
const DEFAULT_STUDY_DURATION = 30;

export function timeToMinutes(time: string): number | null {
  const [hoursPart, minutesPart] = time.split(':');
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

export function formatMinutes(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const remaining = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

function occursOn(
  anchorIso: ISODate,
  repeat: TaskRepeat,
  iso: ISODate,
  weekdayIndex: number,
): boolean {
  const anchor = parseIsoDate(anchorIso);
  const date = parseIsoDate(iso);
  if (date.getTime() < anchor.getTime()) return false;

  if (repeat.days.some(Boolean)) return repeat.days[weekdayIndex] === true;
  if (repeat.monthly) return date.getDate() === anchor.getDate();
  return iso === anchorIso;
}

function endAfterStart(start: number | null, durationMinutes: number): number | null {
  return start === null ? null : start + durationMinutes;
}

function findRootSubject(
  subjectId: ID,
  subjects: Map<ID, IntellectualSubject>,
): IntellectualSubject | null {
  let current = subjects.get(subjectId);
  const seen = new Set<ID>();

  while (current && current.parentId !== null) {
    if (seen.has(current.id)) break;
    seen.add(current.id);
    const parent = subjects.get(current.parentId);
    if (!parent) return current;
    current = parent;
  }

  return current ?? null;
}

/**
 * Turns list tasks, academic sessions/tasks, and intellectual tasks into the
 * week's display events. This is a presentation helper; the future repeat
 * engine remains the only owner of persisted occurrence dates.
 */
export function collectWeekEvents(
  weekStart: Date,
  sources: WeekEventSources,
): Record<ISODate, WeekEvent[]> {
  const result: Record<ISODate, WeekEvent[]> = {};
  const academicSubjectNames = new Map(
    sources.subjects.map((subject) => [subject.id, subject.name]),
  );
  const intellectualSubjects = new Map(
    sources.intellectualSubjects.map((subject) => [subject.id, subject]),
  );

  for (let index = 0; index < 7; index += 1) {
    const date = addDays(weekStart, index);
    const iso = toIsoDate(date);
    const weekdayIndex = (date.getDay() + 6) % 7;
    const dayEvents: WeekEvent[] = [];

    for (const task of Object.values(sources.tasks)) {
      const schedule = task.dueDate;
      if (!schedule || !occursOn(schedule.date, task.repeat, iso, weekdayIndex)) continue;

      const start = timeToMinutes(schedule.time);
      dayEvents.push({
        id: `list-${task.id}-${iso}`,
        title: task.title,
        kind: 'list',
        startMinutes: start,
        endMinutes: endAfterStart(start, DEFAULT_TASK_DURATION),
        completed: task.completed,
      });
    }

    for (const subject of sources.subjects) {
      for (const session of subject.sessions) {
        if (session.type === 'class') {
          if (!occursOn(session.start.date, session.repeat, iso, weekdayIndex)) continue;
        } else if (session.start.date !== iso) {
          continue;
        }

        const start = timeToMinutes(session.start.time);
        const end = timeToMinutes(session.end.time);
        dayEvents.push({
          id: `session-${session.id}-${iso}`,
          title: `${subject.name} · ${session.title}`,
          kind: 'academic',
          startMinutes: start,
          endMinutes: end ?? endAfterStart(start, 60),
          completed: false,
        });
      }
    }

    for (const task of sources.academicTasks) {
      const subjectName = academicSubjectNames.get(task.subjectId);
      if (!subjectName) continue;

      const schedules = [
        { schedule: task.draftDue, suffix: 'draft' },
        { schedule: task.finalDue, suffix: '' },
      ] as const;

      for (const { schedule, suffix } of schedules) {
        if (!schedule || schedule.date !== iso) continue;

        const start = timeToMinutes(schedule.time);
        dayEvents.push({
          id: `academic-${task.id}-${suffix}-${iso}`,
          title: `${subjectName} · ${task.title}${suffix ? ` (${suffix})` : ''}`,
          kind: 'academic',
          startMinutes: start,
          endMinutes: endAfterStart(start, DEFAULT_STUDY_DURATION),
          completed: task.completed,
        });
      }
    }

    for (const task of sources.intellectualTasks) {
      const schedule = task.finalDue ?? task.draftDue;
      if (!schedule || schedule.date !== iso) continue;

      const subject = intellectualSubjects.get(task.subjectId);
      const root = findRootSubject(task.subjectId, intellectualSubjects);
      const kind: WeekEventKind = root?.isProject ? 'project' : 'intellectual';
      const start = timeToMinutes(schedule.time);

      dayEvents.push({
        id: `intellectual-${task.id}-${iso}`,
        title: subject ? `${subject.name} · ${task.title}` : task.title,
        kind,
        startMinutes: start,
        endMinutes: endAfterStart(start, DEFAULT_STUDY_DURATION),
        completed: task.completed,
      });
    }

    result[iso] = dayEvents;
  }

  return result;
}
