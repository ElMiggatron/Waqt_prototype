import { useEffect } from 'react';

import { useListStore } from '../../stores/listStore';
import { useUiStore } from '../../stores/uiStore';
import { TaskDetailPanel } from './TaskDetailPanel';

/**
 * Adapter between the controlled `TaskDetailPanel` and the session stores.
 * Keeping the wiring here means the panel can be reused by another data source later.
 */
export function TaskDetailPanelContainer() {
  const selectedTaskId = useUiStore((state) => state.selectedTaskId);
  const closeTask = useUiStore((state) => state.closeTask);
  const task = useListStore((state) =>
    selectedTaskId ? (state.tasks[selectedTaskId] ?? null) : null,
  );
  const lists = useListStore((state) => state.lists);
  const updateTask = useListStore((state) => state.updateTask);
  const moveTask = useListStore((state) => state.moveTask);
  const addStep = useListStore((state) => state.addStep);
  const toggleStep = useListStore((state) => state.toggleStep);
  const deleteStep = useListStore((state) => state.deleteStep);

  // A cascade-deleted list can remove the selected task; drop the stale selection.
  useEffect(() => {
    if (selectedTaskId && !task) closeTask();
  }, [selectedTaskId, task, closeTask]);

  if (!task) return null;

  return (
    <TaskDetailPanel
      key={task.id}
      task={task}
      lists={lists}
      onClose={closeTask}
      onUpdate={(patch) => updateTask(task.id, patch)}
      onMove={(listId) => moveTask(task.id, listId)}
      onAddStep={(text) => addStep(task.id, text)}
      onToggleStep={(stepId) => toggleStep(task.id, stepId)}
      onDeleteStep={(stepId) => deleteStep(task.id, stepId)}
    />
  );
}
