import { useEffect, useRef, useState } from 'react';

import { CheckIcon, CloseIcon, PlusIcon, TrashIcon } from '../../components/Icons';
import type { ID, TaskStep } from '../../domain/types';
import { en } from '../../i18n/en';
import styles from './StepList.module.css';

const copy = en;

export interface StepListProps {
  steps: readonly TaskStep[];
  onAddStep: (text: string) => void;
  onToggleStep: (stepId: ID) => void;
  onDeleteStep: (stepId: ID) => void;
}

/** SPEC: "+ new step" becomes an input; Enter appends a row with circle, text, and trash. */
export function StepList({ steps, onAddStep, onToggleStep, onDeleteStep }: StepListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  const closeComposer = () => {
    setIsAdding(false);
    setDraft('');
  };

  const submitStep = () => {
    const text = draft.trim();
    if (!text) return;
    onAddStep(text);
    setDraft('');
    inputRef.current?.focus();
  };

  return (
    <div className={styles.steps}>
      {steps.length > 0 ? (
        <ul className={styles.list}>
          {steps.map((step) => (
            <li
              key={step.id}
              className={[styles.step, step.completed ? styles.isDone : '']
                .filter(Boolean)
                .join(' ')}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={step.completed}
                className={styles.circle}
                aria-label={
                  step.completed
                    ? copy.task.uncompleteStep.replace('{name}', step.text)
                    : copy.task.completeStep.replace('{name}', step.text)
                }
                onClick={() => onToggleStep(step.id)}
              >
                {step.completed ? <CheckIcon size={11} /> : null}
              </button>

              <span className={styles.text}>{step.text}</span>

              <button
                type="button"
                className={styles.delete}
                aria-label={copy.task.deleteStep.replace('{name}', step.text)}
                onClick={() => onDeleteStep(step.id)}
              >
                <TrashIcon size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {isAdding ? (
        <form
          className={styles.composer}
          onSubmit={(event) => {
            event.preventDefault();
            submitStep();
          }}
        >
          <input
            ref={inputRef}
            className={styles.input}
            value={draft}
            placeholder={copy.task.stepPlaceholder}
            aria-label={copy.task.addStepLabel}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                closeComposer();
              }
            }}
          />
          <button
            type="submit"
            className={styles.composerAction}
            aria-label={copy.task.addStepLabel}
            disabled={draft.trim().length === 0}
          >
            <CheckIcon size={15} />
          </button>
          <button
            type="button"
            className={styles.composerAction}
            aria-label={copy.task.cancelStep}
            onClick={closeComposer}
          >
            <CloseIcon size={15} />
          </button>
        </form>
      ) : (
        <button type="button" className={styles.addButton} onClick={() => setIsAdding(true)}>
          <PlusIcon size={15} />
          <span>{copy.task.addStep}</span>
        </button>
      )}
    </div>
  );
}
