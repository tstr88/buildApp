/**
 * Edit Profile Modal Component
 * Allows users to edit their profile information
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface EditProfileModalProps {
  profile: {
    name: string;
    buyer_role: string;
    language: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState(profile.name);
  const [buyerRole, setBuyerRole] = useState<'homeowner' | 'contractor'>(
    profile.buyer_role as 'homeowner' | 'contractor'
  );
  const [language, setLanguage] = useState<'ka' | 'en'>(profile.language as 'ka' | 'en');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch('http://localhost:3001/api/buyers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          buyer_role: buyerRole,
          language,
        }),
      });

      if (response.ok) {
        // Change the app language if it was updated
        if (language !== profile.language) {
          await i18n.changeLanguage(language);
        }
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.message || t('editProfileModal.errors.failedToUpdate'));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(t('editProfileModal.errors.pleaseTryAgain'));
    } finally {
      setSaving(false);
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
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            {t('editProfileModal.title')}
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
              color: colors.text.tertiary,
            }}
          >
            <Icons.X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: spacing[6] }}>
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

            {/* Name Field */}
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
                {t('editProfileModal.fullName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: spacing[3],
                  fontSize: typography.fontSize.base,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  outline: 'none',
                }}
              />
            </div>

            {/* Buyer Role Field */}
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
                {t('editProfileModal.buyerRole')}
              </label>
              <div style={{ display: 'flex', gap: spacing[2] }}>
                <button
                  type="button"
                  onClick={() => setBuyerRole('homeowner')}
                  style={{
                    flex: 1,
                    padding: spacing[3],
                    backgroundColor: buyerRole === 'homeowner' ? colors.primary[600] : colors.neutral[0],
                    border: `2px solid ${buyerRole === 'homeowner' ? colors.primary[600] : colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: buyerRole === 'homeowner' ? colors.neutral[0] : colors.text.primary,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t('editProfileModal.homeowner')}
                </button>
                <button
                  type="button"
                  onClick={() => setBuyerRole('contractor')}
                  style={{
                    flex: 1,
                    padding: spacing[3],
                    backgroundColor: buyerRole === 'contractor' ? colors.primary[600] : colors.neutral[0],
                    border: `2px solid ${buyerRole === 'contractor' ? colors.primary[600] : colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: buyerRole === 'contractor' ? colors.neutral[0] : colors.text.primary,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t('editProfileModal.contractor')}
                </button>
              </div>
            </div>

            {/* Language Field */}
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
                {t('editProfileModal.languagePreference')}
              </label>
              <div style={{ display: 'flex', gap: spacing[2] }}>
                <button
                  type="button"
                  onClick={() => setLanguage('ka')}
                  style={{
                    flex: 1,
                    padding: spacing[3],
                    backgroundColor: language === 'ka' ? colors.primary[600] : colors.neutral[0],
                    border: `2px solid ${language === 'ka' ? colors.primary[600] : colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: language === 'ka' ? colors.neutral[0] : colors.text.primary,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t('editProfileModal.georgian')}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  style={{
                    flex: 1,
                    padding: spacing[3],
                    backgroundColor: language === 'en' ? colors.primary[600] : colors.neutral[0],
                    border: `2px solid ${language === 'en' ? colors.primary[600] : colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: language === 'en' ? colors.neutral[0] : colors.text.primary,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t('editProfileModal.english')}
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: spacing[6],
              borderTop: `1px solid ${colors.border.light}`,
              display: 'flex',
              gap: spacing[3],
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: `${spacing[3]} ${spacing[4]}`,
                backgroundColor: colors.neutral[0],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1,
              }}
            >
              {t('editProfileModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: `${spacing[3]} ${spacing[4]}`,
                backgroundColor: saving ? colors.primary[400] : colors.primary[600],
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                color: colors.neutral[0],
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              {saving ? (
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
                  {t('editProfileModal.saving')}
                </>
              ) : (
                <>
                  <Icons.Save size={20} />
                  {t('editProfileModal.saveChanges')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
