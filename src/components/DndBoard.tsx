'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableColumn from './SortableColumn';
import Card from './card/Card';
import AddColumnButton from './addColumnButton/AddColumnButton';
import { useBoardStore } from '@/store/useBoardStore';
import styles from '@/app/page.module.scss';
import CardModal from './modals/cardModal/CardModal';


interface ActiveCard {
  id: number;
  title: string;
  commentCount: number;
}

interface DndBoardProps {
  onAddCard: (columnId: number) => void;
  onAddColumn: () => void;
}

export default function DndBoard({ onAddCard, onAddColumn }: DndBoardProps) {
  // Zustand store integration
  const {
    columns,
    moveCard,
    reorderCardsInColumn,
    reorderColumns,
    deleteColumn,
    updateColumnTitle,
    addComment,
    updateCardTitle,
    updateCardDescription,
  } = useBoardStore();

  // State for drag overlay
  const [activeCard, setActiveCard] = useState<ActiveCard | null>(null);

  // State for card modal - just store the card ID
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // Find the full card data from columns based on selectedCardId
  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    for (const column of columns) {
      const card = column.items.find((c) => c.id === selectedCardId);
      if (card) return card;
    }
    return null;
  }, [selectedCardId, columns]);

  // Local state to track drag position for visual feedback (no Zustand updates)
  const [dragPosition, setDragPosition] = useState<{
    activeId: number;
    fromColumnId: number;
    toColumnId: number;
    toIndex: number;
  } | null>(null);

  // Sensor configuration - 8px activation distance prevents accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Drag start handler - captures the active card for overlay
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    // Check if dragging a column - if so, no card overlay needed
    if (activeData?.type === 'column') {
      setActiveCard(null);
      return;
    }

    // Handle card dragging
    const cardId = active.id as number;

    // Find the card in columns
    for (const column of columns) {
      const card = column.items.find((item) => item.id === cardId);
      if (card) {
        setActiveCard({
          id: card.id,
          title: card.title,
          // Ensure comments is always an array (defensive programming)
          commentCount: Array.isArray(card.comments) ? card.comments.length : 0,
        });
        break;
      }
    }
  }, [columns]);

  // Drag over handler - tracks position for visual feedback only (no Zustand updates)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      setDragPosition(null);
      return;
    }

    const activeData = active.data.current;

    // Skip if dragging a column (column dragging doesn't need handleDragOver logic)
    if (activeData?.type === 'column') {
      return;
    }

    const activeId = active.id as number;
    const overId = over.id as number;

    // Find source and destination columns
    const activeColumn = columns.find((col) =>
      col.items.some((item) => item.id === activeId)
    );
    const overColumn = columns.find((col) => {
      const hasCardWithId = col.items.some((item) => item.id === overId);
      const isColumnId = col.id === overId;
      return hasCardWithId || isColumnId;
    });

    if (!activeColumn || !overColumn) {
      setDragPosition(null);
      return;
    }

    // Calculate the target index
    let toIndex: number;

    if (activeColumn.id === overColumn.id) {
      // Same column reordering
      const overIndex = overColumn.items.findIndex(
        (item) => item.id === overId
      );
      toIndex = overIndex !== -1 ? overIndex : overColumn.items.length;
    } else {
      // Cross-column move
      const overIndex = overColumn.items.findIndex(
        (item) => item.id === overId
      );
      toIndex = overIndex !== -1 ? overIndex : overColumn.items.length;
    }

    // Only update local state for visual feedback - NO ZUSTAND UPDATES
    setDragPosition({
      activeId,
      fromColumnId: activeColumn.id,
      toColumnId: overColumn.id,
      toIndex,
    });
  }, [columns]);

  // Drag end handler - applies final position to Zustand store
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      setDragPosition(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle COLUMN dragging
    if (activeData?.type === 'column' && overData?.type === 'column') {
      const activeIndex = columns.findIndex((col) => col.id === active.id);
      const overIndex = columns.findIndex((col) => col.id === over.id);

      if (activeIndex !== overIndex) {
        const newColumnIds = arrayMove(
          columns.map((col) => col.id),
          activeIndex,
          overIndex
        );
        reorderColumns(newColumnIds);
      }

      setActiveCard(null);
      setDragPosition(null);
      return;
    }

    // Handle CARD dragging (existing logic)
    if (dragPosition) {
      const { activeId, fromColumnId, toColumnId, toIndex } = dragPosition;

      if (fromColumnId === toColumnId) {
        // Same column reordering
        const column = columns.find((col) => col.id === fromColumnId);
        if (column) {
          const oldIndex = column.items.findIndex(
            (item) => item.id === activeId
          );
          if (oldIndex !== -1 && oldIndex !== toIndex) {
            const newItems = arrayMove(column.items, oldIndex, toIndex);
            reorderCardsInColumn(
              fromColumnId,
              newItems.map((item) => item.id)
            );
          }
        }
      } else {
        // Cross-column move
        moveCard(activeId, fromColumnId, toColumnId, toIndex);
      }
    }

    // Clear drag states
    setActiveCard(null);
    setDragPosition(null);
  }, [dragPosition, columns, moveCard, reorderCardsInColumn, reorderColumns]);

  // Card click handler - opens modal with card details
  const handleCardClick = useCallback((cardId: number) => {
    setSelectedCardId(cardId);
  }, []);

  // Close modal handler
  const handleCloseCardModal = useCallback(() => {
    setSelectedCardId(null);
  }, []);

  // Add comment handler
  const handleAddComment = useCallback((text: string) => {
    if (selectedCardId) {
      addComment(selectedCardId, text);
    }
  }, [selectedCardId, addComment]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {/* Wrap columns in SortableContext for horizontal dragging */}
        <SortableContext
          items={columns.map((col) => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <SortableColumn
              key={column.id}
              id={column.id}
              title={column.title}
              cardIds={column.items.map((item) => item.id)}
              onAddCard={() => onAddCard(column.id)}
              onDeleteColumn={() => deleteColumn(column.id)}
              onEditTitle={(newTitle) => updateColumnTitle(column.id, newTitle)}
              isDropTarget={dragPosition?.toColumnId === column.id}
              dropIndex={dragPosition?.toColumnId === column.id ? dragPosition.toIndex : undefined}
            >
              {column.items.map((item) => (
                <Card
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  commentCount={Array.isArray(item.comments) ? item.comments.length : 0}
                  onCardClick={handleCardClick}
                />
              ))}
            </SortableColumn>
          ))}
        </SortableContext>

        <AddColumnButton onClick={onAddColumn} />
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="dnd-drag-overlay">
            <Card
              id={activeCard.id}
              title={activeCard.title}
              commentCount={activeCard.commentCount}
              onCardClick={handleCardClick}
            />
          </div>
        ) : null}
      </DragOverlay>

      {selectedCard && (
        <CardModal
          isOpen={true}
          cardId={selectedCard.id}
          cardTitle={selectedCard.title}
          cardDescription={selectedCard.description}
          comments={selectedCard.comments}
          onClose={handleCloseCardModal}
          onAddComment={handleAddComment}
          onEditTitle={(newTitle) => updateCardTitle(selectedCard.id, newTitle)}
          onEditDescription={(description) => updateCardDescription(selectedCard.id, description)}
        />
      )}
    </DndContext>
  );
}
