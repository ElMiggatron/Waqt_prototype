import styles from './SoftDivider.module.css';

interface SoftDividerProps {
  className?: string;
}

/** SPEC: the “soft border” — a long, quiet horizontal separator. */
export function SoftDivider({ className }: SoftDividerProps) {
  return <hr className={[styles.divider, className].filter(Boolean).join(' ')} />;
}
