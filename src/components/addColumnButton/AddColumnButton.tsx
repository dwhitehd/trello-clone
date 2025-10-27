'use client';

import styles from './AddColumnButton.module.scss';

interface AddColumnButtonProps {
  onClick: () => void;
}

export default function AddColumnButton({ onClick }: AddColumnButtonProps) {
  return (
    <div className={styles.container}>
      <button
        className={styles.addButton}
        onClick={onClick}
        aria-label="Add new column"
      >
        + Add Column
      </button>
    </div>
  );
}
