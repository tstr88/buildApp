/**
 * Mark Delivered Modal
 * Allows supplier to mark order as delivered/handed over with photo proof
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface OrderItem {
  id: string;
  spec_string: string;
  quantity: number;
  unit: string;
}

interface MarkDeliveredModalProps {
  orderId: string;
  deliveryType: 'pickup' | 'delivery';
  items: OrderItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export function MarkDeliveredModal({
  orderId,
  deliveryType,
  items,
  onClose,
  onSuccess,
}: MarkDeliveredModalProps) {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [quantitiesDelivered, setQuantitiesDelivered] = useState<Record<string, number>>(
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {})
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (photos.length + files.length > 3) {
      setError(t('supplierOrders.validation.maxPhotos', 'Maximum 3 photos allowed'));
      return;
    }

    const newPhotos = [...photos, ...files].slice(0, 3);
    setPhotos(newPhotos);

    // Create previews
    const newPreviews: string[] = [];
    newPhotos.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newPhotos.length) {
          setPhotoPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setQuantitiesDelivered({ ...quantitiesDelivered, [itemId]: quantity });
  };

  const hasQuantityDifference = () => {
    return items.some((item) => quantitiesDelivered[item.id] !== item.quantity);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (photos.length === 0) {
      setError(t('supplierOrders.validation.photoRequired', 'At least 1 photo is required'));
      return;
    }

    if (hasQuantityDifference() && !notes.trim()) {
      setError(t('supplierOrders.validation.noteRequiredForQtyDiff', 'Please provide a note explaining the quantity difference'));
      return;
    }

    setSubmitting(true);

    try {
      // Upload photos first
      const formData = new FormData();
      photos.forEach((photo, index) => {
        formData.append('photos', photo);
      });

      const uploadResponse = await fetch(`http://localhost:3001/api/suppliers/orders/${orderId}/upload-photos`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photos');
      }

      const uploadData = await uploadResponse.json();
      const photoUrls = uploadData.photoUrls;

      // Mark as delivered
      const response = await fetch(`http://localhost:3001/api/suppliers/orders/${orderId}/mark-delivered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          photos: photoUrls,
          quantities_delivered: quantitiesDelivered,
          timestamp: new Date().toISOString(),
          notes: notes.trim() || undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || t('common.error', 'An error occurred'));
      }
    } catch (err) {
      console.error('Failed to mark delivered:', err);
      setError(t('common.error', 'An error occurred'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: spacing[4],
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          boxShadow: shadows.xl,
          maxWidth: '600px',
          width: '100%',
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
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            {deliveryType === 'pickup'
              ? t('supplierOrders.markHandedOver', 'Mark as Handed Over')
              : t('supplierOrders.markDelivered', 'Mark as Delivered')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: spacing[1],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.X size={24} color={colors.text.secondary} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: spacing[5] }}>
          {/* Photo Upload */}
          <div style={{ marginBottom: spacing[5] }}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[2],
              }}
            >
              {t('supplierOrders.uploadPhotos', 'Upload Photos')}
              <span style={{ color: colors.error[600], marginLeft: spacing[1] }}>*</span>
            </label>
            <div
              style={{
                padding: spacing[3],
                backgroundColor: colors.info[50],
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.info[200]}`,
                marginBottom: spacing[3],
                display: 'flex',
                alignItems: 'start',
                gap: spacing[2],
              }}
            >
              <Icons.Info size={16} color={colors.info[600]} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: typography.fontSize.xs, color: colors.info[700] }}>
                {t('supplierOrders.photoTip', 'Tip: Photo of materials on-site with visible quantity/placement')}
              </span>
            </div>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div style={{ display: 'flex', gap: spacing[2], marginBottom: spacing[3], flexWrap: 'wrap' }}>
                {photoPreviews.map((preview, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      width: '120px',
                      height: '120px',
                      borderRadius: borderRadius.md,
                      overflow: 'hidden',
                      border: `1px solid ${colors.border.light}`,
                    }}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{
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
                        background: colors.neutral[0],
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: shadows.sm,
                      }}
                    >
                      <Icons.X size={14} color={colors.text.secondary} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {photos.length < 3 && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2],
                  padding: spacing[4],
                  border: `2px dashed ${colors.border.default}`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: colors.neutral[50],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary[400];
                  e.currentTarget.style.backgroundColor = colors.primary[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.default;
                  e.currentTarget.style.backgroundColor = colors.neutral[50];
                }}
              >
                <Icons.Upload size={20} color={colors.text.secondary} />
                <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                  {t('supplierOrders.uploadPhotosCTA', 'Click to upload photos')} ({photos.length}/3)
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

          {/* Quantities Delivered */}
          <div style={{ marginBottom: spacing[5] }}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[3],
              }}
            >
              {t('supplierOrders.quantitiesDelivered', 'Quantities Delivered')}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: spacing[3],
                    backgroundColor: colors.neutral[50],
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.border.light}`,
                  }}
                >
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary, marginBottom: spacing[2] }}>
                    {item.spec_string}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                    <label style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, minWidth: '80px' }}>
                      {t('supplierOrders.ordered', 'Ordered')}: {item.quantity} {item.unit}
                    </label>
                    <input
                      type="number"
                      value={quantitiesDelivered[item.id] || 0}
                      onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value) || 0)}
                      min="0"
                      max={item.quantity}
                      step="0.01"
                      style={{
                        flex: 1,
                        padding: spacing[2],
                        fontSize: typography.fontSize.sm,
                        border: `1px solid ${quantitiesDelivered[item.id] !== item.quantity ? colors.warning[400] : colors.border.default}`,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.neutral[0],
                      }}
                    />
                    <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, minWidth: '40px' }}>{item.unit}</span>
                  </div>
                  {quantitiesDelivered[item.id] < item.quantity && (
                    <div
                      style={{
                        marginTop: spacing[2],
                        padding: spacing[2],
                        backgroundColor: colors.warning[50],
                        borderRadius: borderRadius.sm,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[1],
                      }}
                    >
                      <Icons.AlertTriangle size={14} color={colors.warning[600]} />
                      <span style={{ fontSize: typography.fontSize.xs, color: colors.warning[700] }}>
                        {t('supplierOrders.quantityLessThanOrdered', 'Quantity less than ordered - note required')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: spacing[5] }}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[2],
              }}
            >
              {t('supplierOrders.deliveryNotes', 'Delivery Notes')}
              {hasQuantityDifference() && <span style={{ color: colors.error[600], marginLeft: spacing[1] }}>*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('supplierOrders.notesPlaceholder', 'Add any notes about the delivery...')}
              maxLength={500}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: spacing[3],
                fontSize: typography.fontSize.sm,
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginTop: spacing[1], textAlign: 'right' }}>
              {notes.length}/500 {t('common.characters', 'characters')}
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: spacing[3],
                backgroundColor: colors.error[50],
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.error[200]}`,
                marginBottom: spacing[4],
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <Icons.AlertCircle size={16} color={colors.error[600]} />
              <span style={{ fontSize: typography.fontSize.sm, color: colors.error[700] }}>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: spacing[3], justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                backgroundColor: 'transparent',
                color: colors.text.primary,
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                backgroundColor: submitting ? colors.primary[400] : colors.primary[600],
                color: colors.text.inverse,
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {submitting
                ? t('common.saving', 'Saving...')
                : deliveryType === 'pickup'
                ? t('supplierOrders.confirmHandover', 'Confirm Handover')
                : t('supplierOrders.confirmDelivery', 'Confirm Delivery')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
