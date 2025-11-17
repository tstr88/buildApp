/**
 * Admin Note Modal Component
 * Modal for adding internal admin notes (not visible to users)
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Icons } from '../icons/Icons';

interface AdminNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  title: string;
  placeholder?: string;
}

export function AdminNoteModal({ isOpen, onClose, onSubmit, title, placeholder }: AdminNoteModalProps) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(note.trim());
      setNote('');
      onClose();
    } catch (error) {
      console.error('Failed to submit note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: spacing[4],
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          boxShadow: shadows.xl,
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: spacing[5],
            borderBottom: `1px solid ${colors.border.light}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={handleClose}
            style={{
              padding: spacing[1],
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: borderRadius.md,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[100];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icons.X size={20} color={colors.text.secondary} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: spacing[5] }}>
            <div style={{ marginBottom: spacing[2] }}>
              <label
                style={{
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary,
                  marginBottom: spacing[2],
                }}
              >
                {t('admin.notes.label', 'Internal Note')}
                <span
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    fontWeight: typography.fontWeight.normal,
                    marginLeft: spacing[2],
                  }}
                >
                  {t('admin.notes.notVisibleToUsers', '(Not visible to users)')}
                </span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={placeholder || t('admin.notes.placeholder', 'Add internal note...')}
                rows={5}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  fontSize: typography.fontSize.sm,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: spacing[5],
              borderTop: `1px solid ${colors.border.light}`,
              display: 'flex',
              gap: spacing[3],
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                backgroundColor: colors.neutral[100],
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={!note.trim() || isSubmitting}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.neutral[0],
                backgroundColor: colors.primary[600],
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: !note.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                opacity: !note.trim() || isSubmitting ? 0.5 : 1,
              }}
            >
              {isSubmitting ? t('common.saving', 'Saving...') : t('admin.notes.submit', 'Add Note')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
