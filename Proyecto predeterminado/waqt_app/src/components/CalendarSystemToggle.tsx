import type { CalendarSystem } from '../domain/types';
import { en } from '../i18n/en';
import { SegmentedSwitch } from './SegmentedSwitch';
import styles from './CalendarSystemToggle.module.css';

const copy = en;

interface CalendarSystemToggleProps {
  value: CalendarSystem;
  onChange: (value: CalendarSystem) => void;
  compact?: boolean;
  className?: string;
  label?: string;
}

/** The Spec's g / ه calendar switch, shared by every calendar surface. */
export function CalendarSystemToggle({
  value,
  onChange,
  compact = false,
  className,
  label = copy.calendar.switchLabel,
}: CalendarSystemToggleProps) {
  return (
    <SegmentedSwitch
      value={value}
      onChange={onChange}
      label={label}
      compact={compact}
      className={className}
      options={[
        {
          value: 'gregorian',
          label: copy.calendar.gregorianShort,
          ariaLabel: copy.calendar.gregorianName,
        },
        {
          value: 'hijri',
          label: (
            <span lang="ar" className={styles.arabic}>
              {copy.calendar.hijriShort}
            </span>
          ),
          ariaLabel: copy.calendar.hijriName,
        },
      ]}
    />
  );
}
