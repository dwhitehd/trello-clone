import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Return type for the useEditableInput hook
 */
export interface UseEditableInputReturn {
  /** Whether the input is currently in editing mode */
  isEditing: boolean;
  /** Current value of the input */
  value: string;
  /** Ref to attach to the input element for auto-focus */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Start editing mode */
  startEdit: () => void;
  /** Save the current value and exit editing mode */
  save: () => void;
  /** Cancel editing and reset to initial value */
  cancel: () => void;
  /** Handle keyboard events (Enter to save, Escape to cancel) */
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Handle input change events with optional maxLength validation */
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * A custom hook for managing inline editable input fields.
 *
 * This hook provides a complete editing experience with:
 * - Auto-focus and text selection when editing starts
 * - Save on Enter, cancel on Escape
 * - Validation (no empty values, optional max length)
 * - Automatic trimming of whitespace
 *
 * @param initialValue - The initial value to display and reset to on cancel
 * @param onSave - Callback function called with the new value when saving
 * @param maxLength - Optional maximum length for the input value
 *
 * @returns An object containing state, refs, and handler functions for the editable input
 *
 * @example
 * ```tsx
 * const {
 *   isEditing,
 *   value,
 *   inputRef,
 *   startEdit,
 *   save,
 *   cancel,
 *   handleKeyDown,
 *   handleChange
 * } = useEditableInput(
 *   boardTitle,
 *   (newTitle) => updateBoardTitle(newTitle),
 *   50
 * );
 *
 * return isEditing ? (
 *   <input
 *     ref={inputRef}
 *     value={value}
 *     onChange={handleChange}
 *     onBlur={save}
 *     onKeyDown={handleKeyDown}
 *     maxLength={50}
 *   />
 * ) : (
 *   <h1 onClick={startEdit}>{boardTitle}</h1>
 * );
 * ```
 */
export function useEditableInput(
  initialValue: string,
  onSave: (newValue: string) => void,
  maxLength?: number
): UseEditableInputReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus and select text when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /**
   * Start editing mode and initialize the input value
   */
  const startEdit = useCallback(() => {
    setValue(initialValue);
    setIsEditing(true);
  }, [initialValue]);

  /**
   * Save the current value if it's valid (not empty/whitespace-only)
   * If the value is empty or only whitespace, cancel instead
   */
  const save = useCallback(() => {
    const trimmedValue = value.trim();

    // If empty or whitespace-only, just cancel
    if (!trimmedValue) {
      setValue('');
      setIsEditing(false);
      return;
    }

    // Only call onSave if the value has actually changed
    if (trimmedValue !== initialValue) {
      onSave(trimmedValue);
    }

    setIsEditing(false);
  }, [value, initialValue, onSave]);

  /**
   * Cancel editing and reset to the initial value
   */
  const cancel = useCallback(() => {
    setValue('');
    setIsEditing(false);
  }, []);

  /**
   * Handle keyboard events:
   * - Enter: Save the value
   * - Escape: Cancel editing
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        save();
      } else if (e.key === 'Escape') {
        cancel();
      }
    },
    [save, cancel]
  );

  /**
   * Handle input change events with optional max length validation
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // If maxLength is specified, enforce it
      if (maxLength !== undefined && newValue.length > maxLength) {
        return;
      }

      setValue(newValue);
    },
    [maxLength]
  );

  return {
    isEditing,
    value,
    inputRef,
    startEdit,
    save,
    cancel,
    handleKeyDown,
    handleChange,
  };
}
