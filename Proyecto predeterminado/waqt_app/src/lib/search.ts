import type { SearchResults, Task, TaskList } from '../domain/types';

const DIACRITICS = /[\u0300-\u036f]/g;
const ARABIC_MARKS = /[\u064b-\u065f\u0670\u06d6-\u06ed]/g;
const TATWEEL = /\u0640/g;

/**
 * Normalises Latin diacritics, Arabic harakat, and casing so a simple substring search
 * behaves predictably. MiniSearch can replace this when the search module is wired.
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(ARABIC_MARKS, '')
    .replace(TATWEEL, '')
    .toLowerCase()
    .trim();
}

export function tokenizeQuery(query: string): string[] {
  return normalizeSearchText(query).split(/\s+/).filter(Boolean);
}

export function matchesTokens(text: string, tokens: readonly string[]): boolean {
  if (tokens.length === 0) return false;
  const haystack = normalizeSearchText(text);
  return tokens.every((token) => haystack.includes(token));
}

/** Basic name filtering for lists and tasks; every query token must match. */
export function searchWorkspace(
  lists: readonly TaskList[],
  tasks: readonly Task[],
  query: string,
): SearchResults {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return { lists: [], tasks: [] };

  return {
    lists: lists.filter((list) => matchesTokens(list.name, tokens)),
    tasks: tasks.filter((task) => matchesTokens(task.title, tokens)),
  };
}
