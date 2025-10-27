'use client';

import { memo } from 'react';
import styles from './Column.module.scss';
import React from 'react';

interface ColumnProps {
  id: number;
  title: string;
  onAddCard: () => void;
  onEditTitle: (newTitle: string) => void;
  onDeleteColumn: () => void;
  children?: React.ReactNode;
  cardIds: number[];
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDropTarget?: boolean;
  dropIndex?: number;
}

const Column = memo(function Column({
  title,
  onAddCard,
  children,
  cardIds,
  dragHandleProps,
  isDropTarget = false,
  dropIndex,
}: ColumnProps) {

  const childrenArray = React.Children.toArray(children);

  return (
    <div className={styles.column}>
      {/* Header is the drag handle for column dragging */}
      <div className={styles.header} {...dragHandleProps}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.cardList}>
     
          {childrenArray.map((child, index) => (
            <React.Fragment key={cardIds[index]}>
              {/* Show drop indicator before this card */}
              {isDropTarget && dropIndex === index && (
                <div className={styles.dropIndicator} />
              )}
              {child}
            </React.Fragment>
          ))}

          {/* Show drop indicator at the end */}
          {isDropTarget && dropIndex === childrenArray.length && (
            <div className={styles.dropIndicator} />
          )}

          {/* Show empty state when no cards and dragging over */}
          {childrenArray.length === 0 && (
            <div className={styles.emptyDropZone}>
              Drop card here
            </div>
          )}

      </div>
      <button className={styles.addButton} onClick={onAddCard}>
        + Add another card
      </button>
    </div>
  );
});

export default Column;
