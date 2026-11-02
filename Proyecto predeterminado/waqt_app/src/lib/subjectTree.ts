import type { ID, IntellectualSubject, SubjectNode } from '../domain/types';

/** UI soft limit from the standards (§2.7): the model itself is unlimited. */
export const MAX_SUBJECT_DEPTH = 12;

/** Builds a forest from the flat adjacency list. Orphans (missing parent) are dropped. */
export function buildSubjectTree(subjects: readonly IntellectualSubject[]): SubjectNode[] {
  const nodes = new Map<ID, SubjectNode>(
    subjects.map((subject) => [subject.id, { ...subject, children: [] }]),
  );
  const roots: SubjectNode[] = [];

  for (const subject of subjects) {
    const node = nodes.get(subject.id);
    if (!node) continue;
    if (subject.parentId === null) {
      roots.push(node);
    } else {
      nodes.get(subject.parentId)?.children.push(node);
    }
  }
  return roots;
}

/** The id itself plus every descendant id. Used for cascade deletes. */
export function collectSubtreeIds(subjects: readonly IntellectualSubject[], rootId: ID): Set<ID> {
  const ids = new Set<ID>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const subject of subjects) {
      if (subject.parentId !== null && ids.has(subject.parentId) && !ids.has(subject.id)) {
        ids.add(subject.id);
        changed = true;
      }
    }
  }
  return ids;
}
