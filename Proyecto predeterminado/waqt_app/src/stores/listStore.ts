import { create } from 'zustand';

import { INITIAL_LISTS, INITIAL_TASKS } from '../data/placeholder';
import type { ID, Task, TaskList, TaskPatch, TaskStep } from '../domain/types';
import { newId } from '../lib/ids';

interface ListState {
  lists: TaskList[];
  tasks: Record<ID, Task>;
  addList(name: string): ID;
  /** DECISION: D3 — deleting a list cascade-deletes its tasks. Default lists are protected. */
  deleteList(listId: ID): void;
  updateTask(taskId: ID, patch: TaskPatch): void;
  moveTask(taskId: ID, listId: ID): void;
  addStep(taskId: ID, text: string): void;
  toggleStep(taskId: ID, stepId: ID): void;
  deleteStep(taskId: ID, stepId: ID): void;
  toggleTask(taskId: ID): void;
  reset(): void;
}

/** Placeholder rows share nested arrays; clone them so one task cannot mutate another. */
function cloneTask(task: Task): Task {
  return {
    ...task,
    steps: task.steps.map((step) => ({ ...step })),
    reminder: task.reminder ? { ...task.reminder } : null,
    dueDate: task.dueDate ? { ...task.dueDate } : null,
    repeat: { days: [...task.repeat.days], monthly: task.repeat.monthly },
  };
}

function toTaskRecord(tasks: readonly Task[]): Record<ID, Task> {
  return Object.fromEntries(tasks.map((task) => [task.id, cloneTask(task)])) as Record<
    ID,
    Task
  >;
}

function initialState(): Pick<ListState, 'lists' | 'tasks'> {
  return {
    lists: INITIAL_LISTS.map((list) => ({ ...list })),
    tasks: toTaskRecord(INITIAL_TASKS),
  };
}

export const useListStore = create<ListState>((set) => ({
  ...initialState(),
  addList: (name) => {
    const listId = newId('list');
    const list: TaskList = {
      id: listId,
      name: name.trim(),
      description: '',
      isDefault: false,
    };
    set((state) => ({ lists: [...state.lists, list] }));
    return listId;
  },
  deleteList: (listId) =>
    set((state) => {
      const list = state.lists.find((candidate) => candidate.id === listId);
      if (!list || list.isDefault) return {};

      const tasks = Object.fromEntries(
        Object.entries(state.tasks).filter(([, task]) => task.listId !== listId),
      ) as Record<ID, Task>;

      return { lists: state.lists.filter((candidate) => candidate.id !== listId), tasks };
    }),
  updateTask: (taskId, patch) =>
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return {};
      return { tasks: { ...state.tasks, [taskId]: { ...task, ...patch } } };
    }),
  moveTask: (taskId, listId) =>
    set((state) => {
      const task = state.tasks[taskId];
      if (!task || !state.lists.some((list) => list.id === listId)) return {};
      return { tasks: { ...state.tasks, [taskId]: { ...task, listId } } };
    }),
  addStep: (taskId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return {};
      const step: TaskStep = { id: newId('step'), text: trimmed, completed: false };
      return {
        tasks: { ...state.tasks, [taskId]: { ...task, steps: [...task.steps, step] } },
      };
    });
  },
  toggleStep: (taskId, stepId) =>
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return {};
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            steps: task.steps.map((step) =>
              step.id === stepId ? { ...step, completed: !step.completed } : step,
            ),
          },
        },
      };
    }),
  deleteStep: (taskId, stepId) =>
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return {};
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            steps: task.steps.filter((step) => step.id !== stepId),
          },
        },
      };
    }),
  toggleTask: (taskId) =>
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return {};
      return {
        tasks: {
          ...state.tasks,
          [taskId]: { ...task, completed: !task.completed },
        },
      };
    }),
  reset: () => set(initialState()),
}));
