/** Shared UI/domain types for the Waqt layout scaffold. */

export type ID = string;

/** Persisted dates are always Gregorian. `YYYY-MM-DD`. */
export type ISODate = string;

/** Wall-clock time in 24-hour form. `HH:mm`, empty when a date is all-day. */
export type TimeOfDay = string;

/** The Spec defines broad view by width > height and phone view by height ≥ width. */
export type LayoutMode = 'broad' | 'phone';

export type CalendarSystem = 'gregorian' | 'hijri';

export const SELECTABLE_THEME_IDS = [
  'abbasid-black',
  'mughal-green',
  'umayyad-white',
  'ottoman-red',
  'sahel-yellow',
  'fatimid-blue',
  'bosniak-blue',
  'sufi-turquoise',
  'isfahan-cobalt',
  'omani-coral',
] as const;

export type SelectableThemeId = (typeof SELECTABLE_THEME_IDS)[number];

export type Madhab = 'maliki' | 'shafii' | 'hanafi' | 'hanbali' | 'jafari';

export type WorkspaceView =
  | { kind: 'list'; listId: ID }
  | { kind: 'lists' }
  | { kind: 'calendar' }
  | { kind: 'academics' }
  | { kind: 'projects' }
  | { kind: 'intellectual' }
  | { kind: 'settings' };

export type WorkspaceViewKind = WorkspaceView['kind'];

export interface TaskList {
  id: ID;
  name: string;
  description: string;
  isDefault: boolean;
}

export interface TaskStep {
  id: ID;
  text: string;
  completed: boolean;
}

/** Date + optional time used by reminders and task due dates. */
export interface TaskSchedule {
  date: ISODate;
  time: TimeOfDay;
}

/** `days` is Monday-first and always has seven entries; `monthly` is the Spec's tick box. */
export interface TaskRepeat {
  days: boolean[];
  monthly: boolean;
}

export interface Task {
  id: ID;
  listId: ID;
  title: string;
  completed: boolean;
  important: boolean;
  note: string;
  steps: TaskStep[];
  reminder: TaskSchedule | null;
  dueDate: TaskSchedule | null;
  repeat: TaskRepeat;
}

/** Patch accepted by the task store. `id` and timestamps stay immutable. */
export type TaskPatch = Partial<Omit<Task, 'id'>>;

export type SessionType = 'class' | 'excursion' | 'exam' | 'lab';

/**
 * `start` / `end` are the two scheduling checks. For `class` sessions only the time part
 * is meaningful; the date is derived from the first selected repeat weekday.
 */
export interface AcademicSession {
  id: ID;
  type: SessionType;
  title: string;
  start: TaskSchedule;
  end: TaskSchedule;
  repeat: TaskRepeat;
}

export interface AcademicSubject {
  id: ID;
  name: string;
  gradeLevel: string;
  /** Duration in terms, integer ≥ 1. */
  termCount: number;
  sessions: AcademicSession[];
}

/**
 * Task that lives inside a subject instead of a list. Academic tasks use both due dates
 * and can never be moved to a list; intellectual tasks only use `finalDue`.
 */
export interface SubjectTask {
  id: ID;
  subjectId: ID;
  title: string;
  completed: boolean;
  draftDue: TaskSchedule | null;
  finalDue: TaskSchedule | null;
}

/** Flat adjacency list: `parentId === null` is a greater subject. */
export interface IntellectualSubject {
  id: ID;
  name: string;
  description: string;
  parentId: ID | null;
  /** Meaningful on greater subjects only; descendants inherit it. */
  isProject: boolean;
}

export interface SubjectNode extends IntellectualSubject {
  children: SubjectNode[];
}

export interface SearchResults {
  lists: TaskList[];
  tasks: Task[];
}
