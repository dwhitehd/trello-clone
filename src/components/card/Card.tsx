'use client';

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './Card.module.scss';

interface CardProps {
  id: number;
  title: string;
  commentCount?: number;
  onCardClick: (cardId: number) => void;
}

const Card = memo(function Card({
  id,
  title,
  commentCount = 0,
  onCardClick,
}: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: id,
    data: {
      type: 'card',
      cardId: id
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleClick = () => {
    // Prevent opening modal while dragging
    if (!isDragging) {
      onCardClick(id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.card}
      onClick={handleClick}
      data-dragging={isDragging}
      {...attributes}
      {...listeners}
    >
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.footer}>
        <span className={styles.commentCount}>
          💬 {commentCount}
        </span>
      </div>
    </div>
  );
});

export default Card;
