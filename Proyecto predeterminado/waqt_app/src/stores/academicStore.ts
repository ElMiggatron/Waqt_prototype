import { create } from 'zustand';

import { INITIAL_ACADEMIC_SUBJECTS, INITIAL_ACADEMIC_TASKS } from '../data/placeholder';
import type {
  AcademicSession,
  AcademicSubject,
  ID,
  SubjectTask,
  TaskSchedule,
} from '../domain/types';
import { newId } from '../lib/ids';

export interface NewSubjectInput {
  name: string;
  gradeLevel: string;
  termCount: number;
}

export type SessionInput = Omit<AcademicSession, 'id'>;

interface AcademicState {
  subjects: AcademicSubject[];
  tasks: SubjectTask[];
  addSubject(input: NewSubjectInput): ID;
  /** Cascade: sessions live on the subject, tasks are removed with it. */
  deleteSubject(subjectId: ID): void;
  saveSession(subjectId: ID, input: SessionInput, sessionId?: ID): void;
  deleteSession(subjectId: ID, sessionId: ID): void;
  addTask(
    subjectId: ID,
    title: string,
    draftDue: TaskSchedule | null,
    finalDue: TaskSchedule | null,
  ): void;
  toggleTask(taskId: ID): void;
  deleteTask(taskId: ID): void;
  reset(): void;
}

function cloneSubject(subject: AcademicSubject): AcademicSubject {
  return {
    ...subject,
    sessions: subject.sessions.map((session) => ({
      ...session,
      start: { ...session.start },
      end: { ...session.end },
      repeat: { days: [...session.repeat.days], monthly: session.repeat.monthly },
    })),
  };
}

function initialState(): Pick<AcademicState, 'subjects' | 'tasks'> {
  return {
    subjects: INITIAL_ACADEMIC_SUBJECTS.map(cloneSubject),
    tasks: INITIAL_ACADEMIC_TASKS.map((task) => ({ ...task })),
  };
}

export const useAcademicStore = create<AcademicState>((set) => ({
  ...initialState(),
  addSubject: (input) => {
    const id = newId('subject');
    const subject: AcademicSubject = {
      id,
      name: input.name.trim(),
      gradeLevel: input.gradeLevel.trim(),
      termCount: Math.max(1, Math.floor(input.termCount)),
      sessions: [],
    };
    set((state) => ({ subjects: [...state.subjects, subject] }));
    return id;
  },
  deleteSubject: (subjectId) =>
    set((state) => ({
      subjects: state.subjects.filter((subject) => subject.id !== subjectId),
      tasks: state.tasks.filter((task) => task.subjectId !== subjectId),
    })),
  saveSession: (subjectId, input, sessionId) =>
    set((state) => ({
      subjects: state.subjects.map((subject) => {
        if (subject.id !== subjectId) return subject;
        if (sessionId) {
          return {
            ...subject,
            sessions: subject.sessions.map((session) =>
              session.id === sessionId ? { ...input, id: sessionId } : session,
            ),
          };
        }
        return { ...subject, sessions: [...subject.sessions, { ...input, id: newId('session') }] };
      }),
    })),
  deleteSession: (subjectId, sessionId) =>
    set((state) => ({
      subjects: state.subjects.map((subject) =>
        subject.id === subjectId
          ? { ...subject, sessions: subject.sessions.filter((session) => session.id !== sessionId) }
          : subject,
      ),
    })),
  addTask: (subjectId, title, draftDue, finalDue) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const task: SubjectTask = {
      id: newId('atask'),
      subjectId,
      title: trimmed,
      completed: false,
      draftDue,
      finalDue,
    };
    set((state) => ({ tasks: [...state.tasks, task] }));
  },
  toggleTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    })),
  deleteTask: (taskId) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== taskId) })),
  reset: () => set(initialState()),
}));
