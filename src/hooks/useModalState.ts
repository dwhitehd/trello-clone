import { useState, useCallback } from 'react';

/**
 * Represents the state of a modal dialog
 * @template T - The type of modal (e.g., 'addCard' | 'addColumn')
 */
export interface ModalState<T extends string = string> {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** The type of modal being displayed */
  type: T | null;
  /** Optional column ID for column-specific modals */
  columnId?: number;
}

/**
 * Return type for the useModalState hook
 * @template T - The type of modal (e.g., 'addCard' | 'addColumn')
 */
export interface UseModalStateReturn<T extends string = string> {
  /** Current modal state */
  modalState: ModalState<T>;
  /** Opens a modal with the specified type and optional column ID */
  openModal: (type: T, columnId?: number) => void;
  /** Closes the modal and resets state */
  closeModal: () => void;
  /** Handles modal confirmation with user input */
  handleConfirm: (input: string) => void;
}

/**
 * Custom hook for managing modal state and interactions
 *
 * This hook provides a reusable way to manage modal dialogs throughout the application.
 * It handles opening/closing modals, tracking modal type and associated data (like columnId),
 * and executing confirmation callbacks.
 *
 * @template T - The union type of possible modal types (e.g., 'addCard' | 'addColumn')
 *
 * @param onConfirm - Callback function executed when user confirms the modal action.
 *                    Receives the modal type, user input, and optional columnId.
 *
 * @returns Object containing modal state and handler functions
 *
 * @example
 * ```typescript
 * type MyModalType = 'addCard' | 'addColumn';
 *
 * const { modalState, openModal, closeModal, handleConfirm } = useModalState<MyModalType>(
 *   (type, input, columnId) => {
 *     if (type === 'addCard' && columnId) {
 *       addCard(columnId, input);
 *     } else if (type === 'addColumn') {
 *       addColumn(input);
 *     }
 *   }
 * );
 *
 * // Open a modal
 * openModal('addCard', 123);
 *
 * // Handle confirmation
 * handleConfirm('New card title');
 * ```
 */
export function useModalState<T extends string = string>(
  onConfirm: (type: T, input: string, columnId?: number) => void
): UseModalStateReturn<T> {
  const [modalState, setModalState] = useState<ModalState<T>>({
    isOpen: false,
    type: null,
  });

  /**
   * Opens a modal with the specified type and optional column ID
   */
  const openModal = useCallback((type: T, columnId?: number) => {
    setModalState({ isOpen: true, type, columnId });
  }, []);

  /**
   * Closes the modal and resets all state
   */
  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, type: null });
  }, []);

  /**
   * Handles modal confirmation by calling the onConfirm callback
   * with the current modal state and user input, then closes the modal
   */
  const handleConfirm = useCallback(
    (input: string) => {
      if (modalState.type) {
        onConfirm(modalState.type, input, modalState.columnId);
      }
      closeModal();
    },
    [modalState.type, modalState.columnId, onConfirm, closeModal]
  );

  return {
    modalState,
    openModal,
    closeModal,
    handleConfirm,
  };
}
