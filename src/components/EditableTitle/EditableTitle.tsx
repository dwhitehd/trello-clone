'use client';

import { useEditableInput } from '@/hooks/useEditableInput';
import styles from './EditableTitle.module.scss';

/**
 * Props for the EditableTitle component
 */
export interface EditableTitleProps {
  /** Current value of the title */
  value: string;
  /** Callback function called when the title value changes */
  onChange: (newValue: string) => void;
  /** Maximum allowed length for the title (default: 50) */
  maxLength?: number;
  /** Placeholder text shown in the input field */
  placeholder?: string;
  /** Optional additional CSS class name */
  className?: string;
}

/**
 * EditableTitle Component
 *
 * A reusable component for inline editing of titles with a clean UX.
 * Displays as a clickable title that transforms into an input field when clicked.
 *
 * Features:
 * - Click to edit or use keyboard (Enter/Space)
 * - Auto-focus and text selection when editing starts
 * - Save on Enter or blur, cancel on Escape
 * - Visual feedback with hover effects and emoji pencil icon
 * - Full keyboard accessibility
 * - Responsive design for mobile devices
 *
 * @example
 * ```tsx
 * <EditableTitle
 *   value={boardTitle}
 *   onChange={(newTitle) => updateBoardTitle(newTitle)}
 *   maxLength={50}
 *   placeholder="Enter board title..."
 * />
 * ```
 */
export default function EditableTitle({
  value,
  onChange,
  maxLength = 50,
  placeholder = 'Enter title...',
  className = '',
}: EditableTitleProps) {
  const {
    isEditing,
    value: inputValue,
    inputRef,
    startEdit,
    save,
    handleKeyDown,
    handleChange,
  } = useEditableInput(value, onChange, maxLength);

  return (
    <div className={`${styles.titleWrapper} ${className}`}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className={styles.titleInput}
          value={inputValue}
          onChange={handleChange}
          onBlur={save}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label="Edit board title"
        />
      ) : (
        <h1
          className={styles.title}
          onClick={startEdit}
          title="Click to edit board title"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              startEdit();
            }
          }}
          aria-label={`Board title: ${value}. Click to edit.`}
        >
          {value}
        </h1>
      )}
    </div>
  );
}
