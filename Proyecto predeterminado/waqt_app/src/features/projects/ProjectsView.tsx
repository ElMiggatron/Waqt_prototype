import { IntellectualPanel } from '../intellectual/IntellectualPanel';

/** Projects reuse the intellectual tree, filtered to roots with `isProject = true`. */
export function ProjectsView() {
  return <IntellectualPanel mode="projects" />;
}
