'use client';

import dynamic from 'next/dynamic';
import Modal from '@/components/modals/modal/Modal';
import EditableTitle from '@/components/EditableTitle/EditableTitle';
import { useBoardStore } from '@/store/useBoardStore';
import { useModalState } from '@/hooks/useModalState';
import { ModalType, getModalTitle, getModalPlaceholder } from '@/types/modal';
import styles from '@/app/page.module.scss';

// Import DndBoard with SSR disabled to prevent hydration errors
const DndBoard = dynamic(() => import('@/components/DndBoard'), {
  ssr: false,
  loading: () => (
    <div className={styles.board}>
      <div className={styles.loading}>Loading board...</div>
    </div>
  ),
});

export default function Home() {
  const { addCard, addColumn, boardTitle, updateBoardTitle, hasHydrated} = useBoardStore();

  // Modal state management with useModalState hook
  const { modalState, openModal, closeModal, handleConfirm } = useModalState<ModalType>(
    (type, input, columnId) => {
      if (type === 'addCard' && columnId !== undefined) {
        addCard(columnId, input);
      } else if (type === 'addColumn') {
        addColumn(input);
      }
    }
  );

  return (
    <div className={styles.container}>
       {hasHydrated && (
          <EditableTitle
            value={boardTitle}
            onChange={updateBoardTitle}
            maxLength={50}
          />
        )}

      <DndBoard
        onAddCard={(columnId) => openModal('addCard', columnId)}
        onAddColumn={() => openModal('addColumn')}
      />

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title={getModalTitle(modalState.type)}
        placeholder={getModalPlaceholder(modalState.type)}
        confirmText="Add"
      />
    </div>
  );
}
