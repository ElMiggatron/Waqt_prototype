import { useMemo, useState } from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  TrashIcon,
} from '../../components/Icons';
import { SoftDivider } from '../../components/SoftDivider';
import type {
  AcademicSession,
  AcademicSubject,
  SessionType,
} from '../../domain/types';
import { en } from '../../i18n/en';
import { formatSchedule, isScheduleOverdue } from '../../lib/dates';
import { useAcademicStore } from '../../stores/academicStore';
import { AcademicTaskForm } from './AcademicTaskForm';
import { hasRepeat } from './academicScheduling';
import { SessionEditor } from './SessionEditor';
import styles from './AcademicPanel.module.css';

const copy = en;

const SESSION_TYPES: readonly SessionType[] = ['class', 'excursion', 'exam', 'lab'];
const ADD_LABEL: Record<SessionType, string> = {
  class: copy.academics.addClass,
  excursion: copy.academics.addExcursion,
  exam: copy.academics.addExam,
  lab: copy.academics.addLab,
};

function repeatSummary(repeat: AcademicSession['repeat']): string {
  if (repeat.monthly) return copy.task.repeatMonthly;

  const days = repeat.days
    .map((isOn, index) => (isOn ? copy.calendar.weekdaysLong[index] : null))
    .filter(Boolean);

  if (days.length === 0) return copy.task.repeatNone;
  return copy.task.repeatWeekly.replace('{days}', days.join(', '));
}

function sessionSummary(session: AcademicSession): string {
  if (session.type === 'class') {
    const times = `${session.start.time} – ${session.end.time}`;
    return hasRepeat(session.repeat)
      ? `${times} · ${repeatSummary(session.repeat)}`
      : times;
  }

  const range = `${formatSchedule(session.start)} → ${formatSchedule(session.end)}`;
  return hasRepeat(session.repeat)
    ? `${range} · ${repeatSummary(session.repeat)}`
    : range;
}

interface SessionEditorTarget {
  type: SessionType;
  session?: AcademicSession;
}

interface AcademicSubjectCardProps {
  subject: AcademicSubject;
  onDelete: () => void;
}

/** One subject: setup, sessions, and the academic task workspace. */
export function AcademicSubjectCard({ subject, onDelete }: AcademicSubjectCardProps) {
  const tasks = useAcademicStore((state) => state.tasks);
  const saveSession = useAcademicStore((state) => state.saveSession);
  const deleteSession = useAcademicStore((state) => state.deleteSession);
  const toggleTask = useAcademicStore((state) => state.toggleTask);
  const deleteTask = useAcademicStore((state) => state.deleteTask);
  const [isOpen, setIsOpen] = useState(true);
  const [editor, setEditor] = useState<SessionEditorTarget | null>(null);

  const subjectTasks = useMemo(
    () => tasks.filter((task) => task.subjectId === subject.id),
    [tasks, subject.id],
  );

  return (
    <>
      <article className={styles.card} data-subject={subject.id}>
        <header className={styles.cardHeader}>
          <button
            type="button"
            className={styles.cardToggle}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? copy.academics.collapse : copy.academics.expand}: ${subject.name}`}
            onClick={() => setIsOpen((current) => !current)}
          >
            <span className={styles.chevron} data-open={isOpen}>
              <ChevronDownIcon size={18} />
            </span>
            <span className={styles.cardTitle}>{subject.name}</span>
            <span className={styles.grade}>{subject.gradeLevel}</span>
            <span className={styles.terms}>
              {copy.academics.termsCount.replace('{count}', String(subject.termCount))}
            </span>
          </button>

          <button
            type="button"
            className={styles.iconButton}
            aria-label={`${copy.academics.deleteSubject}: ${subject.name}`}
            onClick={onDelete}
          >
            <TrashIcon size={17} />
          </button>
        </header>

        {isOpen ? (
          <div className={styles.cardBody}>
            <section
              className={styles.section}
              aria-labelledby={`sessions-${subject.id}`}
            >
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle} id={`sessions-${subject.id}`}>
                  {copy.academics.sessionsTitle}
                </h3>
                <div className={styles.sessionActions}>
                  {SESSION_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={styles.chipButton}
                      onClick={() => setEditor({ type })}
                    >
                      {ADD_LABEL[type]}
                    </button>
                  ))}
                </div>
              </div>

              {subject.sessions.length === 0 ? (
                <p className={styles.muted}>{copy.academics.noSessions}</p>
              ) : (
                <ul className={styles.sessionList}>
                  {subject.sessions.map((session) => (
                    <li key={session.id} className={styles.sessionRow}>
                      <span className={styles.sessionType} data-type={session.type}>
                        {copy.academics.sessionTypes[session.type]}
                      </span>
                      <span className={styles.sessionText}>
                        <span className={styles.sessionTitle}>{session.title}</span>
                        <span className={styles.sessionMeta}>{sessionSummary(session)}</span>
                      </span>
                      <span className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.smallButton}
                          aria-label={`${copy.academics.editSession}: ${session.title}`}
                          onClick={() => setEditor({ type: session.type, session })}
                        >
                          {copy.academics.edit}
                        </button>
                        <button
                          type="button"
                          className={styles.smallIconButton}
                          aria-label={`${copy.academics.deleteSession}: ${session.title}`}
                          onClick={() => {
                            const confirmed = window.confirm(
                              copy.academics.deleteSessionConfirm,
                            );
                            if (confirmed) deleteSession(subject.id, session.id);
                          }}
                        >
                          <TrashIcon size={15} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <SoftDivider />

            <section className={styles.section} aria-labelledby={`tasks-${subject.id}`}>
              <h3 className={styles.sectionTitle} id={`tasks-${subject.id}`}>
                {copy.academics.tasksTitle}
              </h3>

              <AcademicTaskForm subjectId={subject.id} />

              {subjectTasks.length === 0 ? (
                <p className={styles.muted}>{copy.academics.noTasks}</p>
              ) : (
                <ul className={styles.taskList}>
                  {subjectTasks.map((task) => {
                    const finalOverdue = Boolean(
                      task.finalDue && !task.completed && isScheduleOverdue(task.finalDue),
                    );

                    return (
                      <li
                        key={task.id}
                        className={[
                          styles.taskRow,
                          task.completed ? styles.isDone : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={task.completed}
                          aria-label={`${
                            task.completed
                              ? copy.list.markIncomplete
                              : copy.list.markComplete
                          }: ${task.title}`}
                          className={styles.check}
                          onClick={() => toggleTask(task.id)}
                        >
                          {task.completed ? <CheckIcon size={13} /> : null}
                        </button>

                        <span className={styles.taskBody}>
                          <span className={styles.taskTitle}>{task.title}</span>
                          <span className={styles.taskDates}>
                            <span className={styles.taskDate}>
                              <ClockIcon size={12} />
                              {copy.academics.draftDue}:{' '}
                              {task.draftDue
                                ? formatSchedule(task.draftDue)
                                : copy.task.notSet}
                            </span>
                            <span
                              className={[
                                styles.taskDate,
                                finalOverdue ? styles.isOverdue : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                            >
                              <ClockIcon size={12} />
                              {copy.academics.finalDue}:{' '}
                              {task.finalDue
                                ? formatSchedule(task.finalDue)
                                : copy.task.notSet}
                            </span>
                          </span>
                        </span>

                        <button
                          type="button"
                          className={styles.smallIconButton}
                          aria-label={`${copy.academics.deleteTask}: ${task.title}`}
                          onClick={() => deleteTask(task.id)}
                        >
                          <TrashIcon size={15} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <p className={styles.note}>{copy.academics.tasksLockedNote}</p>
            </section>
          </div>
        ) : null}
      </article>

      {editor ? (
        <SessionEditor
          key={`${subject.id}-${editor.type}-${editor.session?.id ?? 'new'}`}
          type={editor.type}
          session={editor.session}
          onClose={() => setEditor(null)}
          onSave={(input, sessionId) => saveSession(subject.id, input, sessionId)}
          onDelete={
            editor.session
              ? () => {
                  const session = editor.session;
                  if (!session) return;
                  const confirmed = window.confirm(copy.academics.deleteSessionConfirm);
                  if (!confirmed) return;
                  deleteSession(subject.id, session.id);
                  setEditor(null);
                }
              : undefined
          }
        />
      ) : null}
    </>
  );
}
