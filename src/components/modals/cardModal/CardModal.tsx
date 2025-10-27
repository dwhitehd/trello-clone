'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Comment } from '@/types/store';
import styles from './CardModal.module.scss';

interface CardModalProps {
  isOpen: boolean;
  cardId: number;
  cardTitle: string;
  cardDescription?: string;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (text: string) => void;
  onEditTitle: (newTitle: string) => void;
  onEditDescription: (description: string) => void;
}

export default function CardModal({
  isOpen,
  cardTitle,
  cardDescription,
  comments,
  onClose,
  onAddComment,
  onEditTitle,
  onEditDescription,
}: CardModalProps) {
  const [commentText, setCommentText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus input when modal opens
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Auto-focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Auto-focus description textarea when editing starts
  useEffect(() => {
    if (isEditingDescription && descriptionTextareaRef.current) {
      descriptionTextareaRef.current.focus();
    }
  }, [isEditingDescription]);

  // Close handler - resets all states before closing
  const handleClose = useCallback(() => {
    setCommentText('');
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setTitleValue('');
    setDescriptionValue('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // If editing, cancel edit instead of closing modal
        if (isEditingTitle) {
          setIsEditingTitle(false);
          setTitleValue('');
          e.stopPropagation();
        } else if (isEditingDescription) {
          setIsEditingDescription(false);
          setDescriptionValue('');
          e.stopPropagation();
        } else {
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isEditingTitle, isEditingDescription, handleClose]);

  // Start editing title - initialize value from props
  const startEditingTitle = () => {
    setTitleValue(cardTitle);
    setIsEditingTitle(true);
  };

  // Title editing handlers
  const handleTitleSave = () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== cardTitle) {
      onEditTitle(trimmed);
    }
    setIsEditingTitle(false);
    setTitleValue('');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTitleValue('');
    }
  };

  // Start editing description - initialize value from props
  const startEditingDescription = () => {
    setDescriptionValue(cardDescription || '');
    setIsEditingDescription(true);
  };

  // Description editing handlers
  const handleDescriptionSave = () => {
    const trimmed = descriptionValue.trim();
    if (trimmed !== (cardDescription || '')) {
      onEditDescription(trimmed);
    }
    setIsEditingDescription(false);
    setDescriptionValue('');
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter or Cmd+Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setIsEditingDescription(false);
      setDescriptionValue('');
    }
  };

  const handleDescriptionCancel = () => {
    setIsEditingDescription(false);
    setDescriptionValue('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim().length > 0) {
      onAddComment(commentText.trim());
      setCommentText('');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* TITLE SECTION - Editable */}
        <div className={styles.header}>
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              className={styles.titleInput}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              maxLength={100}
              aria-label="Card title"
            />
          ) : (
            <h2
              id="modal-title"
              className={styles.title}
              onClick={startEditingTitle}
              title="Click to edit title"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  startEditingTitle();
                }
              }}
            >
              {cardTitle}
            </h2>
          )}
          <button
            onClick={handleClose}
            className={styles.closeButton}
            type="button"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {/* DESCRIPTION SECTION - Editable */}
          <div className={styles.descriptionSection}>
            <h3 className={styles.sectionTitle}>Description</h3>
            {isEditingDescription ? (
              <div className={styles.descriptionEdit}>
                <textarea
                  ref={descriptionTextareaRef}
                  className={styles.descriptionTextarea}
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                  onKeyDown={handleDescriptionKeyDown}
                  placeholder="Add a more detailed description..."
                  rows={5}
                  aria-label="Card description"
                />
                <div className={styles.descriptionActions}>
                  <button
                    className={styles.saveButton}
                    onClick={handleDescriptionSave}
                    type="button"
                  >
                    Save
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={handleDescriptionCancel}
                    type="button"
                  >
                    Cancel
                  </button>
                  <span className={styles.hint}>Ctrl+Enter to save</span>
                </div>
              </div>
            ) : (
              <div
                className={`${styles.descriptionDisplay} ${!cardDescription ? styles.descriptionEmpty : ''}`}
                onClick={startEditingDescription}
                title="Click to edit description"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    startEditingDescription();
                  }
                }}
              >
                {cardDescription || 'Add a more detailed description...'}
              </div>
            )}
          </div>

          {/* COMMENTS SECTION */}
          <h3 className={styles.sectionTitle}>Comments</h3>

          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <p className={styles.emptyState}>No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{comment.author}</span>
                    <span className={styles.commentTime}>
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className={styles.commentText}>{comment.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.addCommentForm}>
            <textarea
              ref={inputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className={styles.textarea}
              rows={3}
              aria-label="Comment text"
            />
            <button
              type="submit"
              disabled={commentText.trim().length === 0}
              className={styles.addButton}
              aria-label="Add comment"
            >
              Add Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
