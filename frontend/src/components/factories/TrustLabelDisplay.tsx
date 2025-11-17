/**
 * Trust Label Display Component
 * Shows supplier trust metrics with colored indicators
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface TrustMetrics {
  spec_reliability: number; // percentage
  on_time_delivery: number; // percentage
  issue_rate: number; // percentage
  total_deliveries: number;
}

interface TrustLabelDisplayProps {
  metrics: TrustMetrics;
  variant?: 'compact' | 'detailed';
}

const getSpecReliabilityLevel = (percentage: number, t: any) => {
  if (percentage >= 95) return { label: t('factoriesPage.trustMetrics.specReliability.high'), color: colors.success[600], bg: colors.success[100] };
  if (percentage >= 80) return { label: t('factoriesPage.trustMetrics.specReliability.medium'), color: colors.warning[700], bg: colors.warning[100] };
  return { label: t('factoriesPage.trustMetrics.specReliability.low'), color: colors.error[600], bg: colors.error[100] };
};

const getOnTimeLevel = (percentage: number, t: any) => {
  if (percentage >= 90) return { label: t('factoriesPage.trustMetrics.onTimeDelivery.usuallyOnTime'), color: colors.success[600], bg: colors.success[100] };
  if (percentage >= 70) return { label: t('factoriesPage.trustMetrics.onTimeDelivery.sometimesLate'), color: colors.warning[700], bg: colors.warning[100] };
  return { label: t('factoriesPage.trustMetrics.onTimeDelivery.oftenLate'), color: colors.error[600], bg: colors.error[100] };
};

const getIssueRateLevel = (percentage: number, t: any) => {
  if (percentage < 5) return { label: t('factoriesPage.trustMetrics.issueRate.low'), color: colors.success[600], bg: colors.success[100] };
  return { label: t('factoriesPage.trustMetrics.issueRate.higherThanAverage'), color: colors.warning[700], bg: colors.warning[100] };
};

const getSampleSizeLabel = (count: number, t: any) => {
  if (count < 10) return t('factoriesPage.trustMetrics.sampleSize.earlyTrackRecord');
  return t('factoriesPage.trustMetrics.sampleSize.basedOnDeliveries', { count });
};

export const TrustLabelDisplay: React.FC<TrustLabelDisplayProps> = ({
  metrics,
  variant = 'compact',
}) => {
  const { t } = useTranslation();

  const specReliability = getSpecReliabilityLevel(metrics.spec_reliability, t);
  const onTime = getOnTimeLevel(metrics.on_time_delivery, t);
  const issueRate = getIssueRateLevel(metrics.issue_rate, t);
  const sampleSize = getSampleSizeLabel(metrics.total_deliveries, t);

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
        {/* Spec Reliability */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: specReliability.bg,
            borderRadius: borderRadius.sm,
          }}
          title={t('factoriesPage.trustMetrics.specReliability.tooltip', { percentage: metrics.spec_reliability.toFixed(0) })}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: specReliability.color,
            }}
          />
          <span
            style={{
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: specReliability.color,
            }}
          >
            {t('factoriesPage.trustMetrics.specReliability.short')}: {specReliability.label}
          </span>
        </div>

        {/* On-time Delivery */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: onTime.bg,
            borderRadius: borderRadius.sm,
          }}
          title={t('factoriesPage.trustMetrics.onTimeDelivery.tooltip', { percentage: metrics.on_time_delivery.toFixed(0) })}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: onTime.color,
            }}
          />
          <span
            style={{
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: onTime.color,
            }}
          >
            {onTime.label}
          </span>
        </div>

        {/* Issue Rate */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: issueRate.bg,
            borderRadius: borderRadius.sm,
          }}
          title={t('factoriesPage.trustMetrics.issueRate.tooltip', { percentage: metrics.issue_rate.toFixed(1) })}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: issueRate.color,
            }}
          />
          <span
            style={{
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: issueRate.color,
            }}
          >
            {t('factoriesPage.trustMetrics.issueRate.short')}: {issueRate.label}
          </span>
        </div>
      </div>
    );
  }

  // Detailed view
  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[4],
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          marginBottom: spacing[4],
        }}
      >
        <Icons.Award size={20} color={colors.primary[600]} />
        <h3
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
          }}
        >
          {t('factoriesPage.trustMetrics.title')}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {/* Spec Reliability */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing[2],
            }}
          >
            <span
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
              }}
            >
              {t('factoriesPage.trustMetrics.specReliability.label')}
            </span>
            <div
              style={{
                padding: `${spacing[0.5]} ${spacing[2]}`,
                backgroundColor: specReliability.bg,
                borderRadius: borderRadius.sm,
              }}
            >
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: specReliability.color,
                }}
              >
                {specReliability.label} ({metrics.spec_reliability.toFixed(0)}%)
              </span>
            </div>
          </div>
          <p
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              margin: 0,
            }}
          >
            {t('factoriesPage.trustMetrics.specReliability.description')}
          </p>
        </div>

        {/* On-time Delivery */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing[2],
            }}
          >
            <span
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
              }}
            >
              {t('factoriesPage.trustMetrics.onTimeDelivery.label')}
            </span>
            <div
              style={{
                padding: `${spacing[0.5]} ${spacing[2]}`,
                backgroundColor: onTime.bg,
                borderRadius: borderRadius.sm,
              }}
            >
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: onTime.color,
                }}
              >
                {onTime.label} ({metrics.on_time_delivery.toFixed(0)}%)
              </span>
            </div>
          </div>
          <p
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              margin: 0,
            }}
          >
            {t('factoriesPage.trustMetrics.onTimeDelivery.description')}
          </p>
        </div>

        {/* Issue Rate */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing[2],
            }}
          >
            <span
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
              }}
            >
              {t('factoriesPage.trustMetrics.issueRate.label')}
            </span>
            <div
              style={{
                padding: `${spacing[0.5]} ${spacing[2]}`,
                backgroundColor: issueRate.bg,
                borderRadius: borderRadius.sm,
              }}
            >
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: issueRate.color,
                }}
              >
                {issueRate.label} ({metrics.issue_rate.toFixed(1)}%)
              </span>
            </div>
          </div>
          <p
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              margin: 0,
            }}
          >
            {t('factoriesPage.trustMetrics.issueRate.description')}
          </p>
        </div>
      </div>

      {/* Sample Size */}
      <div
        style={{
          marginTop: spacing[4],
          paddingTop: spacing[3],
          borderTop: `1px solid ${colors.border.light}`,
        }}
      >
        <p
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            margin: 0,
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          {sampleSize}
        </p>
      </div>
    </div>
  );
};
