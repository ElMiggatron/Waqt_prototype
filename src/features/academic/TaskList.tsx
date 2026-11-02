import { Task } from '../../domain/types';
import { ScheduleDisplay } from '../../features/calendar/ScheduleDisplay';
import styles from './TaskList.module.css';

type Props = {
  tasks: Task[];
};

export const TaskList = ({ tasks }: Props) => {
  if (tasks.length === 0) {
    return (
      <p className={styles.emptyMessage}>
        No tasks yet. Add your first task to get started.
      </p>
    );
  }

  return (
    <ul className={styles.list} aria-label="Task list">
      {tasks.map((task) => (
        <li key={task.id} className={styles.item}>
          <div className={styles.header}>
            <input 
              type="checkbox" 
              checked={!!task.completedAt} 
              aria-label={task.completedAt ? 'Completed' : 'Pending'}
              readOnly
            />
            <h3 className={styles.title}>{task.title}</h3>
            {task.important && (
              <span className={styles.important} aria-hidden="true">★</span>
            )}
          </div>
          
          {task.note && (
            <div className={styles.note}>
              <p>{task.note}</p>
            </div>
          )}
          
          {task.draftDue && (
            <div className={styles.dueDate}>
              <span className={styles.label}>Draft due:</span>
              <ScheduleDisplay spec={task.draftDue} />
            </div>
          )}
          
          {task.due && (
            <div className={styles.dueDate}>
              <span className={styles.label}>Final due:</span>
              <ScheduleDisplay spec={task.due} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};