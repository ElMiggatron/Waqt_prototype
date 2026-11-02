import { useState } from 'react';

import { en } from '../../i18n/en';
import { useAcademicStore } from '../../stores/academicStore';
import styles from './AcademicPanel.module.css';

const copy = en;

interface AcademicSubjectFormProps {
  onCancel: () => void;
}

/** SPEC: subject name, duration in terms, and grade / year level. */
export function AcademicSubjectForm({ onCancel }: AcademicSubjectFormProps) {
  const addSubject = useAcademicStore((state) => state.addSubject);
  const [name, setName] = useState('');
  const [termCount, setTermCount] = useState('1');
  const [gradeLevel, setGradeLevel] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const trimmedName = name.trim();
    const trimmedGrade = gradeLevel.trim();
    const terms = Number(termCount);

    if (!trimmedName) {
      setError(copy.academics.errors.nameRequired);
      return;
    }
    if (!trimmedGrade) {
      setError(copy.academics.errors.gradeRequired);
      return;
    }
    if (!Number.isInteger(terms) || terms < 1) {
      setError(copy.academics.errors.termsInvalid);
      return;
    }

    addSubject({ name: trimmedName, gradeLevel: trimmedGrade, termCount: terms });
    onCancel();
  };

  return (
    <form
      className={styles.formCard}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{copy.academics.subjectName}</span>
          <input
            className={styles.control}
            value={name}
            autoFocus
            onChange={(event) => {
              setName(event.target.value);
              setError('');
            }}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>{copy.academics.termsLabel}</span>
          <input
            className={styles.control}
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={termCount}
            onChange={(event) => {
              setTermCount(event.target.value);
              setError('');
            }}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>{copy.academics.gradeLabel}</span>
          <input
            className={styles.control}
            value={gradeLevel}
            placeholder={copy.academics.gradePlaceholder}
            onChange={(event) => {
              setGradeLevel(event.target.value);
              setError('');
            }}
          />
        </label>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.formActions}>
        <button type="submit" className={styles.primaryButton}>
          {copy.academics.saveSubject}
        </button>
        <button type="button" className={styles.ghostButton} onClick={onCancel}>
          {copy.academics.cancel}
        </button>
      </div>
    </form>
  );
}
