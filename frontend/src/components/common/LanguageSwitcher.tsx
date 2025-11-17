/**
 * Language Switcher Component
 * Allows users to switch between available languages
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  const changeLanguage = async (lng: string) => {
    try {
      await i18n.changeLanguage(lng);

      // Optionally update user preference in backend if logged in
      const token = localStorage.getItem('buildapp_auth_token');
      if (token) {
        try {
          await fetch('http://localhost:3001/api/buyers/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              language: lng,
            }),
          });
        } catch (error) {
          console.error('Failed to update language preference:', error);
        }
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: spacing[2],
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.full,
      }}
    >
      <button
        onClick={() => changeLanguage('ka')}
        style={{
          padding: `${spacing[1]} ${spacing[3]}`,
          backgroundColor: currentLanguage === 'ka' ? colors.primary[600] : 'transparent',
          border: 'none',
          borderRadius: borderRadius.full,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: currentLanguage === 'ka' ? colors.neutral[0] : colors.text.secondary,
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1],
        }}
      >
        <Icons.Globe size={14} />
        ქარ
      </button>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          padding: `${spacing[1]} ${spacing[3]}`,
          backgroundColor: currentLanguage === 'en' ? colors.primary[600] : 'transparent',
          border: 'none',
          borderRadius: borderRadius.full,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: currentLanguage === 'en' ? colors.neutral[0] : colors.text.secondary,
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1],
        }}
      >
        <Icons.Globe size={14} />
        ENG
      </button>
    </div>
  );
};
