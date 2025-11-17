/**
 * Onboarding Progress Indicator Component
 * Shows current step in the supplier onboarding flow
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme/tokens';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        width: '100%',
        padding: spacing[4],
        backgroundColor: colors.neutral[0],
        borderBottom: `1px solid ${colors.border.light}`,
      }}
    >
      {/* Step Text */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: spacing[3],
          fontSize: typography.fontSize.sm,
          color: colors.text.secondary,
        }}
      >
        {t('supplierOnboarding.progress', { current: currentStep, total: totalSteps })}
      </div>

      {/* Progress Dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: spacing[2],
        }}
      >
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <div
              style={{
                width: step === currentStep ? '32px' : '12px',
                height: '12px',
                borderRadius: step === currentStep ? '6px' : '50%',
                backgroundColor:
                  step < currentStep
                    ? colors.success[500]
                    : step === currentStep
                    ? colors.primary[600]
                    : colors.neutral[300],
                transition: 'all 0.3s ease',
              }}
            />
            {step < totalSteps && (
              <div
                style={{
                  width: '24px',
                  height: '2px',
                  backgroundColor:
                    step < currentStep ? colors.success[500] : colors.neutral[300],
                  transition: 'background-color 0.3s ease',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
