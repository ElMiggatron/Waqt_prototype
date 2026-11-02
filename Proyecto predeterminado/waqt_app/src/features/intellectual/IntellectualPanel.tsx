import { useMemo, useState } from 'react';

import { PageHeader } from '../../components/PageHeader';
import { en } from '../../i18n/en';
import { buildSubjectTree } from '../../lib/subjectTree';
import { useIntellectualStore } from '../../stores/intellectualStore';
import { SubjectTreeNode } from './SubjectTreeNode';
import styles from './IntellectualPanel.module.css';

const copy = en;

export type IntellectualPanelMode = 'intellectual' | 'projects';

interface IntellectualPanelProps {
  mode?: IntellectualPanelMode;
}

/**
 * Container for the Intellectual module. The same panel drives the Projects view:
 * the mode only changes the header and which roots are shown.
 */
export function IntellectualPanel({ mode = 'intellectual' }: IntellectualPanelProps) {
  const subjects = useIntellectualStore((state) => state.subjects);
  const addSubject = useIntellectualStore((state) => state.addSubject);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const isProjectView = mode === 'projects';
  const roots = useMemo(
    () =>
      buildSubjectTree(subjects).filter((root) => root.isProject === isProjectView),
    [subjects, isProjectView],
  );

  const header = isProjectView
    ? { title: copy.projects.title, description: copy.projects.description }
    : { title: copy.intellectual.title, description: copy.intellectual.description };

  const submit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(copy.intellectual.nameRequired);
      return;
    }

    addSubject({
      name: trimmedName,
      description,
      parentId: null,
      isProject: isProjectView,
    });
    setName('');
    setDescription('');
    setError('');
    setIsAdding(false);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={copy.app.name}
        title={header.title}
        description={header.description}
        actions={
          <button
            type="button"
            className={styles.primaryButton}
            aria-expanded={isAdding}
            onClick={() => setIsAdding((current) => !current)}
          >
            {copy.intellectual.addGreater}
          </button>
        }
      />

      {isAdding ? (
        <form
          className={styles.formCard}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className={styles.addGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                {copy.intellectual.greaterName}
              </span>
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
              <span className={styles.fieldLabel}>{copy.intellectual.description_}</span>
              <textarea
                className={styles.textarea}
                rows={2}
                value={description}
                placeholder={copy.intellectual.descriptionPlaceholder}
                onChange={(event) => setDescription(event.target.value)}
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
              {copy.intellectual.save}
            </button>
            <button
              type="button"
              className={styles.ghostButton}
              onClick={() => {
                setIsAdding(false);
                setError('');
              }}
            >
              {copy.intellectual.cancel}
            </button>
          </div>
        </form>
      ) : null}

      {roots.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>
            {isProjectView ? copy.projects.emptyTitle : copy.intellectual.emptyTitle}
          </h2>
          <p className={styles.emptyBody}>
            {isProjectView ? copy.projects.emptyBody : copy.intellectual.emptyBody}
          </p>
        </div>
      ) : (
        <ul className={styles.roots}>
          {roots.map((root) => (
            <SubjectTreeNode key={root.id} node={root} depth={0} />
          ))}
        </ul>
      )}
    </div>
  );
}
