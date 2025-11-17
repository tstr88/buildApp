import React, { useState } from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import * as Icons from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';

interface ConditionCheckFormProps {
  type: 'handover' | 'return';
  onSubmit: (data: { photos: File[]; notes: string }) => Promise<void>;
  onCancel: () => void;
  timeWindow?: {
    scheduledTime: Date;
    windowHours: number; // 2 for handover, 24 for return
  };
}

export const ConditionCheckForm: React.FC<ConditionCheckFormProps> = ({
  type,
  onSubmit,
  onCancel,
  timeWindow,
}) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  React.useEffect(() => {
    if (!timeWindow) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const scheduled = new Date(timeWindow.scheduledTime);
      const windowEnd = new Date(scheduled.getTime() + timeWindow.windowHours * 60 * 60 * 1000);
      const diff = windowEnd.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Window expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [timeWindow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length === 0) {
      alert('Please upload at least one photo of the tool condition');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ photos, notes });
    } catch (error) {
      console.error('Error submitting condition check:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isHandover = type === 'handover';
  const title = isHandover ? 'Handover Confirmation' : 'Return Confirmation';
  const description = isHandover
    ? 'Document the condition of the tool at handover. Take clear photos of all sides and any existing damage.'
    : 'Document the condition of the tool at return. Take photos showing the tool has been returned in good condition.';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{title}</h2>
          <p style={styles.description}>{description}</p>
        </div>
        {timeWindow && (
          <div style={styles.timerCard}>
            <Icons.Clock size={20} color={colors.primary} />
            <div>
              <p style={styles.timerLabel}>Time Remaining</p>
              <p style={styles.timerValue}>{timeRemaining}</p>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Photo Upload */}
        <PhotoUpload
          photos={photos}
          onPhotosChange={setPhotos}
          maxPhotos={5}
          label="Tool Condition Photos *"
        />

        {/* Condition Notes */}
        <div style={styles.field}>
          <label style={styles.label} htmlFor="notes">
            Condition Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isHandover
                ? 'Note any existing damage, wear, or issues with the tool...'
                : 'Note the condition of the tool upon return, any issues, or maintenance needed...'
            }
            style={styles.textarea}
            rows={4}
          />
        </div>

        {/* Important Notice */}
        <div style={styles.notice}>
          <Icons.AlertCircle size={20} color={colors.primary} />
          <div>
            <p style={styles.noticeTitle}>Important</p>
            <p style={styles.noticeText}>
              {isHandover
                ? 'These photos and notes will be used to verify the tool condition. Any damage not documented here may be charged to you at return.'
                : 'These photos prove the tool has been returned. Make sure all photos are clear and show the complete tool.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button type="button" style={styles.cancelButton} onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" style={styles.submitButton} disabled={submitting}>
            {submitting ? (
              <>
                <Icons.Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Icons.Check size={20} />
                <span>Confirm {isHandover ? 'Handover' : 'Return'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.border}`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    margin: 0,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    margin: 0,
  },
  timerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    minWidth: '180px',
  },
  timerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    margin: 0,
  },
  timerValue: {
    ...typography.h3,
    color: colors.primary,
    margin: 0,
    fontWeight: 700,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    display: 'block',
    ...typography.body,
    fontWeight: 600,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textarea: {
    width: '100%',
    padding: spacing.md,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.background,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  notice: {
    display: 'flex',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: '#E3F2FD',
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  noticeTitle: {
    ...typography.body,
    fontWeight: 600,
    color: colors.text,
    margin: 0,
    marginBottom: spacing.xs,
  },
  noticeText: {
    ...typography.body,
    color: colors.textSecondary,
    margin: 0,
    fontSize: '0.9rem',
  },
  actions: {
    display: 'flex',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: `${spacing.sm} ${spacing.lg}`,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    ...typography.body,
    color: colors.text,
    cursor: 'pointer',
    fontWeight: 600,
  },
  submitButton: {
    padding: `${spacing.sm} ${spacing.lg}`,
    backgroundColor: colors.primary,
    color: colors.background,
    border: 'none',
    borderRadius: borderRadius.md,
    ...typography.body,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
};
