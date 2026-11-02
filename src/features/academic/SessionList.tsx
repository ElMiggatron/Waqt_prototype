import { AcademicSession } from '../../domain/types';
import { ScheduleDisplay } from '../../features/calendar/ScheduleDisplay';
import styles from './SessionList.module.css';

type Props = {
  sessions: AcademicSession[];
};

export const SessionList = ({ sessions }: Props) => {
  if (sessions.length === 0) {
    return (
      <p className={styles.emptyMessage}>
        No sessions yet. Add your first session to get started.
      </p>
    );
  }

  return (
    <ul className={styles.list} aria-label="Session list">
      {sessions.map((session) => (
        <li key={session.id} className={styles.item}>
          <div className={styles.header}>
            <span className={styles.type}>{session.type}</span>
            <h3 className={styles.title}>{session.title}</h3>
          </div>
          
          <ScheduleDisplay 
            start={session.start} 
            end={session.end} 
            repeat={session.repeat} 
          />
          
          {session.notes && (
            <div className={styles.notes}>
              <p>{session.notes}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};