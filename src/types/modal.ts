/**
 * Modal Types and Configuration
 *
 * This module provides type-safe modal system configuration including:
 * - ModalType union type for strict type checking
 * - ModalState interface for modal state management
 * - MODAL_CONFIG constant for modal configuration
 * - Helper functions for accessing modal properties
 */

/**
 * Union type representing all possible modal types in the application
 */
export type ModalType = 'addCard' | 'addColumn';

/**
 * Interface representing the state of a modal
 */
export interface ModalState {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** The type of modal being displayed */
  type: ModalType | null;
  /** The ID of the column (required when type is 'addCard') */
  columnId?: number;
}

/**
 * Configuration object defining properties for each modal type
 */
export const MODAL_CONFIG: Record<ModalType, { title: string; placeholder: string }> = {
  addCard: {
    title: 'Add Card',
    placeholder: 'Enter card title...'
  },
  addColumn: {
    title: 'Add Column',
    placeholder: 'Enter column title...'
  }
};

/**
 * Gets the modal title for a given modal type
 *
 * @param type - The modal type to get the title for
 * @returns The modal title, or an empty string if type is null
 *
 * @example
 * ```typescript
 * getModalTitle('addCard') // Returns: 'Add Card'
 * getModalTitle(null)      // Returns: ''
 * ```
 */
export function getModalTitle(type: ModalType | null): string {
  if (type === null) {
    return '';
  }
  return MODAL_CONFIG[type].title;
}

/**
 * Gets the modal placeholder text for a given modal type
 *
 * @param type - The modal type to get the placeholder for
 * @returns The modal placeholder text, or an empty string if type is null
 *
 * @example
 * ```typescript
 * getModalPlaceholder('addCard')   // Returns: 'Enter card title...'
 * getModalPlaceholder(null)        // Returns: ''
 * ```
 */
export function getModalPlaceholder(type: ModalType | null): string {
  if (type === null) {
    return '';
  }
  return MODAL_CONFIG[type].placeholder;
}

/**
 * Type guard to check if a value is a valid ModalType
 *
 * @param type - The value to check
 * @returns True if the value is a valid ModalType, false otherwise
 *
 * @example
 * ```typescript
 * isValidModalType('addCard')    // Returns: true
 * isValidModalType('invalid')    // Returns: false
 * isValidModalType(null)         // Returns: false
 * ```
 */
export function isValidModalType(type: string | null): type is ModalType {
  if (type === null) {
    return false;
  }
  return type === 'addCard' || type === 'addColumn';
}
