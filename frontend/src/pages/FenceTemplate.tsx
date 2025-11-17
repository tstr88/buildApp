/**
 * Fence Template Page
 * Template calculator page for fence projects
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FenceCalculator } from '../components/calculators/FenceCalculator';
import { Icons } from '../components/icons/Icons';
import { colors, spacing, typography, borderRadius } from '../theme/tokens';
import type { FenceCalculationResult } from '../types/fence';

export const FenceTemplate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const BackIcon = Icons.ChevronRight;

  const handleCalculationComplete = (result: FenceCalculationResult) => {
    console.log('Calculation complete:', result);
    // Store result for later use (e.g., in context or local storage)
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background.secondary,
        paddingBottom: '80px', // Space for bottom nav on mobile
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: colors.neutral[0],
          borderBottom: `1px solid ${colors.border.light}`,
          padding: `${spacing[4]} 0`,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: `0 ${spacing[4]}`,
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[3]}`,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.primary[600],
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              marginBottom: spacing[4],
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[50];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <BackIcon
              size={20}
              style={{ transform: 'rotate(180deg)' }}
            />
            {t('common.back')}
          </button>

          {/* Page Title */}
          <h1
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[2],
            }}
          >
            {t('fence.page.title')}
          </h1>
          <p
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            {t('fence.page.subtitle')}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: spacing[6],
        }}
      >
        <FenceCalculator onCalculate={handleCalculationComplete} />
      </main>
    </div>
  );
};
