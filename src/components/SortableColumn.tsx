'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Column from './column/Column';

interface SortableColumnProps {
  id: number;
  title: string;
  onAddCard: () => void;
  onEditTitle: (newTitle: string) => void;
  onDeleteColumn: () => void;
  children?: React.ReactNode;
  cardIds: number[];
  isDropTarget?: boolean;
  dropIndex?: number;
}

export default function SortableColumn(props: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: props.id,
    data: {
      type: 'column',
      columnId: props.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isOver && !isDragging ? 'column-drop-indicator' : ''}
    >
      <Column
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDropTarget={props.isDropTarget}
        dropIndex={props.dropIndex}
      />
    </div>
  );
}
