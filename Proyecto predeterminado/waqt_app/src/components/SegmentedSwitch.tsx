import type { ReactNode } from 'react';

import styles from './SegmentedSwitch.module.css';

export interface SegmentedSwitchOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Spoken label when the visible text is a single character or symbol. */
  ariaLabel?: string;
}

interface SegmentedSwitchProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedSwitchOption<T>[];
  label: string;
  compact?: boolean;
  className?: string;
}

/** A two-or-more option pill switch. Used for calendar system and month/week. */
export function SegmentedSwitch<T extends string>({
  value,
  onChange,
  options,
  label,
  compact = false,
  className,
}: SegmentedSwitchProps<T>) {
  return (
    <div
      className={[styles.switch, compact ? styles.compact : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.option}
          aria-pressed={value === option.value}
          aria-label={option.ariaLabel}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
