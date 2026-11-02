import { useState } from 'react';

import { PageHeader } from '../../components/PageHeader';
import { en } from '../../i18n/en';
import { useAcademicStore } from '../../stores/academicStore';
import { AcademicSubjectCard } from './AcademicSubjectCard';
import { AcademicSubjectForm } from './AcademicSubjectForm';
import styles from './AcademicPanel.module.css';

const copy = en;

/** Container for the Academic module: subjects, sessions, and academic tasks. */
export function AcademicPanel() {
  const subjects = useAcademicStore((state) => state.subjects);
  const deleteSubject = useAcademicStore((state) => state.deleteSubject);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={copy.app.name}
        title={copy.academics.title}
        description={copy.academics.description}
        actions={
          <button
            type="button"
            className={styles.primaryButton}
            aria-expanded={isAdding}
            onClick={() => setIsAdding((current) => !current)}
          >
            {copy.academics.addSubject}
          </button>
        }
      />

      {isAdding ? (
        <AcademicSubjectForm onCancel={() => setIsAdding(false)} />
      ) : null}

      {subjects.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>{copy.academics.emptyTitle}</h2>
          <p className={styles.emptyBody}>{copy.academics.emptyBody}</p>
        </div>
      ) : (
        <ul className={styles.subjectList}>
          {subjects.map((subject) => (
            <li key={subject.id}>
              <AcademicSubjectCard
                subject={subject}
                onDelete={() => {
                  const confirmed = window.confirm(
                    copy.academics.deleteSubjectConfirm.replace('{name}', subject.name),
                  );
                  if (confirmed) deleteSubject(subject.id);
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
