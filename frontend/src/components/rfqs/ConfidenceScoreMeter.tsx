/**
 * Confidence Score Meter Component
 * Shows RFQ completion score with tips for new buyers
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface ConfidenceScoreProps {
  hasProject: boolean;
  hasLines: boolean;
  hasDetailedSpecs: boolean;
  hasDeliveryWindow: boolean;
  hasAccessNotes: boolean;
  isProfileComplete: boolean;
}

export const ConfidenceScoreMeter: React.FC<ConfidenceScoreProps> = ({
  hasProject,
  hasLines,
  hasDetailedSpecs,
  hasDeliveryWindow,
  hasAccessNotes,
  isProfileComplete,
}) => {
  const checks = [
    {
      id: 'project',
      label: 'Complete project info',
      completed: hasProject,
      points: 20,
      tip: 'Select or create a project with location',
    },
    {
      id: 'specs',
      label: 'Detailed line specifications',
      completed: hasDetailedSpecs,
      points: 20,
      tip: 'Add specific descriptions and quantities',
    },
    {
      id: 'window',
      label: 'Preferred delivery window',
      completed: hasDeliveryWindow,
      points: 20,
      tip: 'Specify when you need the materials',
    },
    {
      id: 'access',
      label: 'Clear access notes',
      completed: hasAccessNotes,
      points: 20,
      tip: 'Help suppliers plan delivery logistics',
    },
    {
      id: 'profile',
      label: 'Profile completion',
      completed: isProfileComplete,
      points: 20,
      tip: 'Complete your buyer profile',
    },
  ];

  const totalScore = checks.reduce((sum, check) => sum + (check.completed ? check.points : 0), 0);
  const scoreColor =
    totalScore >= 80
      ? colors.success[600]
      : totalScore >= 60
      ? colors.primary[600]
      : totalScore >= 40
      ? colors.warning[600]
      : colors.error[600];

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        border: `1px solid ${colors.border.light}`,
        borderRadius: borderRadius.lg,
        padding: spacing[6],
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: spacing[4] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
          <Icons.TrendingUp size={20} color={colors.primary[600]} />
          <h3
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            RFQ Confidence Score
          </h3>
        </div>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
          }}
        >
          Complete these items to increase your chances of receiving quality offers
        </p>
      </div>

      {/* Score Progress Bar */}
      <div style={{ marginBottom: spacing[6] }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing[2],
          }}
        >
          <span
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            Completion
          </span>
          <span
            style={{
              fontSize: typography.fontSize.xl,
              color: scoreColor,
              fontWeight: typography.fontWeight.bold,
            }}
          >
            {totalScore}%
          </span>
        </div>
        <div
          style={{
            height: '12px',
            backgroundColor: colors.neutral[100],
            borderRadius: borderRadius.full,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${totalScore}%`,
              backgroundColor: scoreColor,
              transition: 'width 0.3s ease',
              borderRadius: borderRadius.full,
            }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
        {checks.map((check) => (
          <div
            key={check.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: spacing[3],
              padding: spacing[3],
              backgroundColor: check.completed ? colors.success[50] : colors.neutral[50],
              borderRadius: borderRadius.md,
              border: `1px solid ${check.completed ? colors.success[200] : colors.border.light}`,
            }}
          >
            {/* Checkbox */}
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: borderRadius.sm,
                backgroundColor: check.completed ? colors.success[600] : colors.neutral[0],
                border: `2px solid ${check.completed ? colors.success[600] : colors.border.light}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {check.completed && <Icons.Check size={14} color={colors.neutral[0]} />}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: spacing[1],
                }}
              >
                <span
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: check.completed ? colors.success[700] : colors.text.primary,
                  }}
                >
                  {check.label}
                </span>
                <span
                  style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: check.completed ? colors.success[600] : colors.text.tertiary,
                  }}
                >
                  +{check.points}%
                </span>
              </div>
              {!check.completed && (
                <p
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    margin: 0,
                  }}
                >
                  {check.tip}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Score Interpretation */}
      <div
        style={{
          marginTop: spacing[6],
          padding: spacing[4],
          backgroundColor:
            totalScore >= 80
              ? colors.success[50]
              : totalScore >= 60
              ? colors.primary[50]
              : colors.warning[50],
          borderRadius: borderRadius.md,
          border: `1px solid ${
            totalScore >= 80
              ? colors.success[200]
              : totalScore >= 60
              ? colors.primary[200]
              : colors.warning[200]
          }`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'start', gap: spacing[3] }}>
          <div style={{ flexShrink: 0, marginTop: '2px' }}>
            {totalScore >= 80 ? (
              <Icons.CheckCircle size={20} color={colors.success[600]} />
            ) : totalScore >= 60 ? (
              <Icons.Info size={20} color={colors.primary[600]} />
            ) : (
              <Icons.AlertTriangle size={20} color={colors.warning[600]} />
            )}
          </div>
          <div>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color:
                  totalScore >= 80
                    ? colors.success[700]
                    : totalScore >= 60
                    ? colors.primary[700]
                    : colors.warning[700],
                margin: 0,
                marginBottom: spacing[1],
              }}
            >
              {totalScore >= 80
                ? 'Excellent! Your RFQ is highly detailed'
                : totalScore >= 60
                ? 'Good! Add more details for better offers'
                : 'Complete more items to improve your RFQ'}
            </p>
            <p
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              {totalScore >= 80
                ? 'Suppliers will have all the information they need to provide accurate quotes'
                : totalScore >= 60
                ? 'A few more details will help suppliers give you more competitive offers'
                : 'More detailed RFQs typically receive more and better offers from suppliers'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
