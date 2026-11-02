import { create } from 'zustand';

import {
  INITIAL_INTELLECTUAL_SUBJECTS,
  INITIAL_INTELLECTUAL_TASKS,
} from '../data/placeholder';
import type { ID, IntellectualSubject, SubjectTask } from '../domain/types';
import { newId } from '../lib/ids';
import { collectSubtreeIds } from '../lib/subjectTree';

interface IntellectualState {
  subjects: IntellectualSubject[];
  tasks: SubjectTask[];
  /** `parentId === null` creates a greater subject; `isProject` only applies there. */
  addSubject(input: {
    name: string;
    description: string;
    parentId: ID | null;
    isProject?: boolean;
  }): ID;
  /** Cascade-deletes nested subjects and every task beneath them. */
  deleteSubject(subjectId: ID): void;
  /** Ignored for nested subjects: descendants inherit the root's flag. */
  setProject(subjectId: ID, isProject: boolean): void;
  addTask(subjectId: ID, title: string): void;
  toggleTask(taskId: ID): void;
  deleteTask(taskId: ID): void;
  reset(): void;
}

function initialState(): Pick<IntellectualState, 'subjects' | 'tasks'> {
  return {
    subjects: INITIAL_INTELLECTUAL_SUBJECTS.map((subject) => ({ ...subject })),
    tasks: INITIAL_INTELLECTUAL_TASKS.map((task) => ({ ...task })),
  };
}

export const useIntellectualStore = create<IntellectualState>((set) => ({
  ...initialState(),
  addSubject: ({ name, description, parentId, isProject = false }) => {
    const id = newId('intel');
    const subject: IntellectualSubject = {
      id,
      name: name.trim(),
      description: description.trim(),
      parentId,
      isProject: parentId === null ? isProject : false,
    };
    set((state) => ({ subjects: [...state.subjects, subject] }));
    return id;
  },
  deleteSubject: (subjectId) =>
    set((state) => {
      const removed = collectSubtreeIds(state.subjects, subjectId);
      return {
        subjects: state.subjects.filter((subject) => !removed.has(subject.id)),
        tasks: state.tasks.filter((task) => !removed.has(task.subjectId)),
      };
    }),
  setProject: (subjectId, isProject) =>
    set((state) => ({
      subjects: state.subjects.map((subject) =>
        subject.id === subjectId && subject.parentId === null ? { ...subject, isProject } : subject,
      ),
    })),
  addTask: (subjectId, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const task: SubjectTask = {
      id: newId('itask'),
      subjectId,
      title: trimmed,
      completed: false,
      draftDue: null,
      finalDue: null,
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
