/**
 * Delete Account Modal Component
 * Confirms account deletion with phone verification
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface DeleteAccountModalProps {
  phone: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ phone, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [phoneConfirmation, setPhoneConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (phoneConfirmation !== phone) {
      setError(t('deleteAccountModal.errors.phoneNoMatch'));
      return;
    }

    setDeleting(true);

    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/profile`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone_confirmation: phoneConfirmation,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.message || t('deleteAccountModal.errors.failedToDelete'));
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      setError(t('deleteAccountModal.errors.pleaseTryAgain'));
    } finally {
      setDeleting(false);
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
        zIndex: 2000,
        padding: spacing[4],
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          boxShadow: shadows.xl,
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: spacing[6],
            borderBottom: `1px solid ${colors.border.light}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: colors.red[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.AlertTriangle size={24} color={colors.error} />
            </div>
            <h2
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.error,
                margin: 0,
              }}
            >
              {t('deleteAccountModal.title')}
            </h2>
          </div>
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
              color: colors.text.tertiary,
            }}
          >
            <Icons.X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: spacing[6] }}>
          {step === 'warning' && (
            <>
              <div
                style={{
                  backgroundColor: colors.red[50],
                  border: `1px solid ${colors.error}`,
                  borderRadius: borderRadius.md,
                  padding: spacing[4],
                  marginBottom: spacing[4],
                }}
              >
                <h3
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.error,
                    margin: 0,
                    marginBottom: spacing[2],
                  }}
                >
                  {t('deleteAccountModal.warning.title')}
                </h3>
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    margin: 0,
                    lineHeight: typography.lineHeight.relaxed,
                  }}
                >
                  {t('deleteAccountModal.warning.description')}
                </p>
              </div>

              <ul
                style={{
                  margin: 0,
                  marginBottom: spacing[6],
                  paddingLeft: spacing[5],
                  listStyleType: 'disc',
                }}
              >
                <li style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[2] }}>
                  {t('deleteAccountModal.warning.bullets.deactivate')}
                </li>
                <li style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[2] }}>
                  {t('deleteAccountModal.warning.bullets.anonymize')}
                </li>
                <li style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[2] }}>
                  {t('deleteAccountModal.warning.bullets.invalidateSessions')}
                </li>
                <li style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[2] }}>
                  {t('deleteAccountModal.warning.bullets.preventLogin')}
                </li>
                <li style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[2] }}>
                  {t('deleteAccountModal.warning.bullets.keepRecords')}
                </li>
                <li style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[2] }}>
                  {t('deleteAccountModal.warning.bullets.flagOrders')}
                </li>
              </ul>

              <div
                style={{
                  padding: spacing[4],
                  backgroundColor: colors.warning + '20',
                  border: `1px solid ${colors.warning}`,
                  borderRadius: borderRadius.md,
                  marginBottom: spacing[4],
                }}
              >
                <div style={{ display: 'flex', gap: spacing[2], alignItems: 'flex-start' }}>
                  <Icons.Info size={20} color={colors.warning} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      margin: 0,
                      lineHeight: typography.lineHeight.relaxed,
                    }}
                  >
                    {t('deleteAccountModal.warning.activeOrdersWarning')}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: spacing[3], justifyContent: 'flex-end' }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    backgroundColor: colors.neutral[0],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                    cursor: 'pointer',
                  }}
                >
                  {t('deleteAccountModal.buttons.cancel')}
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    backgroundColor: colors.error,
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.neutral[0],
                    cursor: 'pointer',
                  }}
                >
                  {t('deleteAccountModal.buttons.understand')}
                </button>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <form onSubmit={handleDelete}>
              {error && (
                <div
                  style={{
                    padding: spacing[3],
                    backgroundColor: colors.red[50],
                    border: `1px solid ${colors.error}`,
                    borderRadius: borderRadius.md,
                    marginBottom: spacing[4],
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}
                >
                  <Icons.AlertCircle size={20} color={colors.error} />
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.error }}>{error}</span>
                </div>
              )}

              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[4],
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                {t('deleteAccountModal.confirm.instructions')}
              </p>

              <div
                style={{
                  padding: spacing[3],
                  backgroundColor: colors.neutral[100],
                  borderRadius: borderRadius.md,
                  marginBottom: spacing[4],
                }}
              >
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                  {t('deleteAccountModal.confirm.yourPhoneNumber')}
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    fontFamily: 'monospace',
                  }}
                >
                  {phone}
                </div>
              </div>

              <div style={{ marginBottom: spacing[6] }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                    marginBottom: spacing[2],
                  }}
                >
                  {t('deleteAccountModal.confirm.placeholder')}
                </label>
                <input
                  type="text"
                  value={phoneConfirmation}
                  onChange={(e) => setPhoneConfirmation(e.target.value)}
                  placeholder={phone}
                  required
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    fontSize: typography.fontSize.base,
                    border: `2px solid ${error ? colors.error : colors.border.light}`,
                    borderRadius: borderRadius.md,
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: spacing[3], justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setStep('warning')}
                  disabled={deleting}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    backgroundColor: colors.neutral[0],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    opacity: deleting ? 0.5 : 1,
                  }}
                >
                  {t('deleteAccountModal.buttons.back')}
                </button>
                <button
                  type="submit"
                  disabled={deleting || phoneConfirmation !== phone}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    backgroundColor: deleting || phoneConfirmation !== phone ? colors.red[300] : colors.error,
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.neutral[0],
                    cursor: deleting || phoneConfirmation !== phone ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}
                >
                  {deleting ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: `2px solid ${colors.neutral[0]}`,
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                      {t('deleteAccountModal.buttons.deleting')}
                    </>
                  ) : (
                    <>
                      <Icons.Trash2 size={20} />
                      {t('deleteAccountModal.buttons.deleteAccount')}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
