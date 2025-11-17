/**
 * Dispute Form Component
 * Form for reporting issues with photo upload
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface DisputeFormProps {
  orderId: string;
  onSubmit: (issue: string, description: string, photos: File[]) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ISSUE_TYPES = [
  { value: 'wrong_items', label: 'Wrong items delivered' },
  { value: 'damaged', label: 'Items damaged' },
  { value: 'incomplete', label: 'Incomplete order' },
  { value: 'quality', label: 'Quality issues' },
  { value: 'late', label: 'Late delivery' },
  { value: 'other', label: 'Other issue' },
];

export const DisputeForm: React.FC<DisputeFormProps> = ({
  orderId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [selectedIssue, setSelectedIssue] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }

    setPhotos([...photos, ...files]);

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !description.trim()) {
      alert('Please select an issue type and provide a description');
      return;
    }
    onSubmit(selectedIssue, description, photos);
  };

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `2px solid ${colors.error[300]}`,
        padding: spacing[4],
        boxShadow: shadows.lg,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          marginBottom: spacing[4],
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: borderRadius.full,
            backgroundColor: colors.error[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icons.AlertTriangle size={24} color={colors.error[700]} />
        </div>
        <div>
          <h3
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            Report Issue
          </h3>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            Order #{orderId}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Issue Type */}
        <div style={{ marginBottom: spacing[4] }}>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            What's the issue? <span style={{ color: colors.error[600] }}>*</span>
          </label>
          <div style={{ display: 'grid', gap: spacing[2] }}>
            {ISSUE_TYPES.map((issue) => (
              <label
                key={issue.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: spacing[3],
                  border: `2px solid ${
                    selectedIssue === issue.value ? colors.primary[600] : colors.border.light
                  }`,
                  borderRadius: borderRadius.md,
                  backgroundColor:
                    selectedIssue === issue.value ? colors.primary[50] : colors.neutral[0],
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  if (selectedIssue !== issue.value) {
                    e.currentTarget.style.borderColor = colors.primary[300];
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedIssue !== issue.value) {
                    e.currentTarget.style.borderColor = colors.border.light;
                  }
                }}
              >
                <input
                  type="radio"
                  name="issue"
                  value={issue.value}
                  checked={selectedIssue === issue.value}
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  style={{ marginRight: spacing[2] }}
                />
                <span
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.primary,
                  }}
                >
                  {issue.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: spacing[4] }}>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            Describe the issue <span style={{ color: colors.error[600] }}>*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide details about the issue..."
            rows={4}
            style={{
              width: '100%',
              padding: spacing[3],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary[600];
              e.target.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border.light;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Photo Upload */}
        <div style={{ marginBottom: spacing[4] }}>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            Upload Photos (Optional, max 5)
          </label>

          {photoPreviews.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: spacing[2],
                marginBottom: spacing[3],
              }}
            >
              {photoPreviews.map((preview, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    paddingBottom: '100%',
                    borderRadius: borderRadius.md,
                    overflow: 'hidden',
                    border: `1px solid ${colors.border.light}`,
                  }}
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    style={{
                      position: 'absolute',
                      top: spacing[1],
                      right: spacing[1],
                      width: '24px',
                      height: '24px',
                      borderRadius: borderRadius.full,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: 'none',
                      color: colors.neutral[0],
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < 5 && (
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: spacing[6],
                border: `2px dashed ${colors.border.light}`,
                borderRadius: borderRadius.md,
                backgroundColor: colors.neutral[50],
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary[400];
                e.currentTarget.style.backgroundColor = colors.primary[50];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border.light;
                e.currentTarget.style.backgroundColor = colors.neutral[50];
              }}
            >
              <Icons.Upload size={32} color={colors.text.tertiary} />
              <span
                style={{
                  marginTop: spacing[2],
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                Click to upload photos
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {/* Actions */}
        <div
          className="dispute-actions"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: spacing[3],
          }}
        >
          <style>{`
            @media (min-width: 640px) {
              .dispute-actions {
                grid-template-columns: 1fr 1fr !important;
              }
            }
          `}</style>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: colors.neutral[0],
              color: colors.text.secondary,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = colors.neutral[50];
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = colors.neutral[0];
              }
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !selectedIssue || !description.trim()}
            style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor:
                isSubmitting || !selectedIssue || !description.trim()
                  ? colors.neutral[300]
                  : colors.error[600],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              cursor:
                isSubmitting || !selectedIssue || !description.trim()
                  ? 'not-allowed'
                  : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && selectedIssue && description.trim()) {
                e.currentTarget.style.backgroundColor = colors.error[700];
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && selectedIssue && description.trim()) {
                e.currentTarget.style.backgroundColor = colors.error[600];
              }
            }}
          >
            {isSubmitting ? (
              <>
                <Icons.Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Submitting...
              </>
            ) : (
              <>
                <Icons.Send size={20} />
                Submit Dispute
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
