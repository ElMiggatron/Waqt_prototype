/** Placeholder workspace data. Every entity will come from Dexie in the next module. */

import type {
  AcademicSession,
  AcademicSubject,
  IntellectualSubject,
  SubjectTask,
  Task,
  TaskList,
  TaskRepeat,
  TaskSchedule,
  TaskStep,
} from '../domain/types';

const NO_REPEAT: TaskRepeat = {
  days: [false, false, false, false, false, false, false],
  monthly: false,
};

/** Monday-first repeat rule. Pass 0 = Monday … 6 = Sunday. */
function weeklyRepeat(...weekdays: number[]): TaskRepeat {
  return {
    days: [0, 1, 2, 3, 4, 5, 6].map((index) => weekdays.includes(index)),
    monthly: false,
  };
}

function step(id: string, text: string, completed = false): TaskStep {
  return { id, text, completed };
}

function at(date: string, time = ''): TaskSchedule {
  return { date, time };
}

export const INITIAL_LISTS: readonly TaskList[] = [
  {
    id: 'list-tasks',
    name: 'Tasks',
    description: 'Errands, chores, and everything that does not belong to a project.',
    isDefault: true,
  },
  {
    id: 'list-groceries',
    name: 'Groceries',
    description: 'The weekly shop, pantry restock, and household supplies.',
    isDefault: false,
  },
  {
    id: 'list-reading',
    name: 'Reading',
    description: 'Books, essays, and notes to finish this term.',
    isDefault: false,
  },
  {
    id: 'list-fitness',
    name: 'Fitness',
    description: 'Training sessions, walks, and recovery habits.',
    isDefault: false,
  },
  {
    id: 'list-deep-work',
    name: 'Deep work',
    description: 'Focused blocks for the work that actually moves things forward.',
    isDefault: false,
  },
];

export const INITIAL_TASKS: readonly Task[] = [
  {
    id: 'task-dentist',
    listId: 'list-tasks',
    title: 'Book dentist appointment',
    completed: false,
    important: true,
    note: 'Ask about the evening slots and whether the check-up includes a clean.',
    steps: [
      step('step-dentist-1', 'Find the clinic number', true),
      step('step-dentist-2', 'Confirm insurance coverage'),
    ],
    reminder: at('2026-11-02', '09:30'),
    dueDate: at('2026-11-03', '15:00'),
    repeat: NO_REPEAT,
  },
  {
    id: 'task-library',
    listId: 'list-tasks',
    title: 'Renew library card',
    completed: false,
    important: false,
    note: '',
    steps: [],
    reminder: null,
    dueDate: at('2026-10-30', '12:00'),
    repeat: NO_REPEAT,
  },
  {
    id: 'task-family',
    listId: 'list-tasks',
    title: 'Call family after Maghrib',
    completed: true,
    important: false,
    note: '',
    steps: [],
    reminder: null,
    dueDate: at('2026-11-01', '19:30'),
    repeat: NO_REPEAT,
  },
  {
    id: 'task-olives',
    listId: 'list-groceries',
    title: 'Olives, dates, and tahini',
    completed: false,
    important: false,
    note: '',
    steps: [],
    reminder: null,
    dueDate: at('2026-11-07'),
    repeat: NO_REPEAT,
  },
  {
    id: 'task-meal-prep',
    listId: 'list-groceries',
    title: 'Meal prep for the week',
    completed: false,
    important: true,
    note: 'Double the lentil soup and freeze half.',
    steps: [step('step-meal-1', 'Choose three recipes')],
    reminder: null,
    dueDate: at('2026-11-08', '18:00'),
    repeat: NO_REPEAT,
  },
  {
    id: 'task-cleaning',
    listId: 'list-groceries',
    title: 'Restock cleaning supplies',
    completed: true,
    important: false,
    note: '',
    steps: [],
    reminder: null,
    dueDate: null,
    repeat: NO_REPEAT,
  },
  {
    id: 'task-sealed-nectar',
    listId: 'list-reading',
    title: 'Finish The Sealed Nectar',
    completed: false,
    important: false,
    note: '',
    steps: [],
    reminder: null,
    dueDate: at('2026-11-12'),
    repeat: NO_REPEAT,
  },
  {
    id: 'task-deep-work',
    listId: 'list-reading',
    title: 'Read 20 pages of Deep Work',
    completed: false,
    important: false,
    note: '',
    steps: [],
    reminder: at('2026-11-01', '20:30'),
    dueDate: at('2026-11-01', '21:00'),
    repeat: NO_REPEAT,
  },
  {
    id: 'task-chapter-four',
    listId: 'list-reading',
    title: 'Summarise chapter four',
    completed: true,
    important: false,
    note: '',
    steps: [],
    reminder: null,
    dueDate: null,
    repeat: NO_REPEAT,
  },
  {
    id: 'task-walk',
    listId: 'list-fitness',
    title: 'Morning walk — 30 minutes',
    completed: false,
    important: false,
    note: '',
    steps: [],
    reminder: null,
    dueDate: at('2026-11-02', '07:00'),
    repeat: weeklyRepeat(0, 1, 2, 3, 4, 5, 6),
  },
  {
    id: 'task-upper-body',
    listId: 'list-fitness',
    title: 'Upper body session',
    completed: false,
    important: false,
    note: '',
    steps: [],
    reminder: at('2026-11-10', '17:30'),
    dueDate: at('2026-11-10', '18:00'),
    repeat: weeklyRepeat(1, 4),
  },
  {
    id: 'task-stretch',
    listId: 'list-fitness',
    title: 'Stretch before Maghrib',
    completed: false,
    important: true,
    note: '',
    steps: [],
    reminder: null,
    dueDate: at('2026-11-01', '17:30'),
    repeat: weeklyRepeat(0, 1, 2, 3, 4, 5, 6),
  },
  {
    id: 'task-essay',
    listId: 'list-deep-work',
    title: 'Draft history essay outline',
    completed: false,
    important: true,
    note: 'Keep the argument narrow: one city, one decade, three sources.',
    steps: [
      step('step-essay-1', 'Collect three sources'),
      step('step-essay-2', 'Write the thesis statement', true),
      step('step-essay-3', 'Draft the conclusion'),
    ],
    reminder: at('2026-11-10', '18:00'),
    dueDate: at('2026-11-11', '23:59'),
    repeat: NO_REPEAT,
  },
  {
    id: 'task-physics',
    listId: 'list-deep-work',
    title: 'Review physics notes',
    completed: false,
    important: false,
    note: '',
    steps: [step('step-physics-1', 'Rewrite the electromagnetism summary')],
    reminder: null,
    dueDate: at('2026-11-12', '18:00'),
    repeat: NO_REPEAT,
  },
  {
    id: 'task-week-plan',
    listId: 'list-deep-work',
    title: 'Plan next week',
    completed: true,
    important: false,
    note: 'Start with the fixed Salah blocks, then place the deep-work sessions.',
    steps: [],
    reminder: null,
    dueDate: at('2026-11-01', '20:00'),
    repeat: weeklyRepeat(6),
  },
];

function session(
  id: string,
  type: AcademicSession['type'],
  title: string,
  start: TaskSchedule,
  end: TaskSchedule,
  repeat: TaskRepeat = NO_REPEAT,
): AcademicSession {
  return { id, type, title, start, end, repeat };
}

export const INITIAL_ACADEMIC_SUBJECTS: readonly AcademicSubject[] = [
  {
    id: 'subject-physics',
    name: 'Advanced Physics',
    gradeLevel: 'Year 12',
    termCount: 3,
    sessions: [
      session('session-physics-class', 'class', 'Class', at('2026-11-02', '09:00'), at('2026-11-02', '10:00'), weeklyRepeat(0, 3)),
      session('session-physics-exam', 'exam', 'Mid-term exam', at('2026-11-20', '09:00'), at('2026-11-20', '11:00')),
    ],
  },
  {
    id: 'subject-history',
    name: 'Modern History',
    gradeLevel: 'Year 12',
    termCount: 3,
    sessions: [
      session('session-history-class', 'class', 'Class', at('2026-11-03', '11:30'), at('2026-11-03', '12:30'), weeklyRepeat(1)),
    ],
  },
  {
    id: 'subject-arabic',
    name: 'Arabic Literature',
    gradeLevel: 'Year 11',
    termCount: 2,
    sessions: [],
  },
];

export const INITIAL_ACADEMIC_TASKS: readonly SubjectTask[] = [
  {
    id: 'atask-physics-report',
    subjectId: 'subject-physics',
    title: 'Pendulum lab report',
    completed: false,
    draftDue: at('2026-11-10'),
    finalDue: at('2026-11-17'),
  },
];

function subject(
  id: string,
  name: string,
  parentId: string | null,
  description = '',
  isProject = false,
): IntellectualSubject {
  return { id, name, description, parentId, isProject };
}

export const INITIAL_INTELLECTUAL_SUBJECTS: readonly IntellectualSubject[] = [
  subject('intel-physics', 'Physics', null, 'Build a first-principles understanding, one branch at a time.'),
  subject('intel-energies', 'Energies', 'intel-physics', 'Forms, conservation, and transfer.'),
  subject('intel-gravitational', 'Gravitational / potential', 'intel-energies'),
  subject('intel-kinetic', 'Kinetic', 'intel-energies'),
  subject('intel-elastic', 'Elastic', 'intel-energies'),
  subject('intel-electromagnetism', 'Electromagnetism', 'intel-physics', 'Fields, circuits, and forces.'),
  subject('intel-waves', 'Waves', 'intel-physics', 'Oscillation, sound, and light.'),
  subject('intel-astronomy', 'Astronomy', null, 'The sky as a calendar, a map, and a sign.'),
  subject('intel-seasonal', 'Seasonal markers', 'intel-astronomy'),
  subject('intel-history', 'Islamic history', null, 'Reading the past through places, people, and institutions.'),
  subject('intel-abbasid', 'Abbasid period', 'intel-history'),
  subject('project-waqt', 'Waqt app', null, 'Design and build a calm, local-first life manager around Salah.', true),
  subject('project-waqt-design', 'Design system', 'project-waqt'),
];

export const INITIAL_INTELLECTUAL_TASKS: readonly SubjectTask[] = [
  {
    id: 'itask-kinetic',
    subjectId: 'intel-kinetic',
    title: 'Derive kinetic energy from work',
    completed: false,
    draftDue: null,
    finalDue: null,
  },
];
