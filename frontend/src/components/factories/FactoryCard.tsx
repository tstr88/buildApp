/**
 * Factory Card Component
 * Displays supplier information in list view
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { TrustLabelDisplay } from './TrustLabelDisplay';

interface Supplier {
  id: string;
  business_name: string;
  depot_address: string;
  depot_lat: number;
  depot_lng: number;
  categories: string[];
  trust_metrics: {
    spec_reliability: number;
    on_time_delivery: number;
    issue_rate: number;
    total_deliveries: number;
  };
  sku_count: number;
  has_direct_order: boolean;
  distance_km?: number;
}

interface FactoryCardProps {
  supplier: Supplier;
  onClick: () => void;
}

export const FactoryCard: React.FC<FactoryCardProps> = ({ supplier, onClick }) => {
  const { t } = useTranslation();

  const CATEGORY_LABELS: Record<string, string> = {
    concrete: t('factoriesPage.filters.categories.concrete'),
    blocks: t('factoriesPage.filters.categories.blocks'),
    rebar: t('factoriesPage.filters.categories.rebar'),
    aggregates: t('factoriesPage.filters.categories.aggregates'),
    metal: t('factoriesPage.filters.categories.metal'),
    tools: t('factoriesPage.filters.categories.tools'),
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[4],
        cursor: 'pointer',
        transition: 'all 200ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.primary[300];
        e.currentTarget.style.boxShadow = shadows.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border.light;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: spacing[4] }}>
        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: spacing[3],
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[1],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {supplier.business_name}
              </h3>

              {/* Location */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1],
                  marginBottom: spacing[2],
                }}
              >
                <Icons.MapPin size={14} color={colors.text.tertiary} />
                <span
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {supplier.depot_address}
                </span>
                {supplier.distance_km !== undefined && (
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.primary[600],
                      fontWeight: typography.fontWeight.medium,
                    }}
                  >
                    • {supplier.distance_km.toFixed(1)} {t('factoriesPage.card.kmAway')}
                  </span>
                )}
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: spacing[2], flexShrink: 0 }}>
              {supplier.has_direct_order && (
                <div
                  style={{
                    padding: `${spacing[1]} ${spacing[2]}`,
                    backgroundColor: colors.warning[500],
                    color: colors.neutral[0],
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                  }}
                >
                  <Icons.Zap size={12} />
                  {t('factoriesPage.card.directOrder')}
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing[1.5],
              marginBottom: spacing[3],
            }}
          >
            {supplier.categories.map((cat) => (
              <div
                key={cat}
                style={{
                  padding: `${spacing[0.5]} ${spacing[2]}`,
                  backgroundColor: colors.primary[50],
                  color: colors.primary[700],
                  borderRadius: borderRadius.sm,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                {CATEGORY_LABELS[cat] || cat}
              </div>
            ))}
          </div>

          {/* Trust Labels */}
          <div style={{ marginBottom: spacing[3] }}>
            <TrustLabelDisplay metrics={supplier.trust_metrics} variant="compact" />
          </div>

          {/* SKU Count */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[1],
            }}
          >
            <Icons.Package size={16} color={colors.text.tertiary} />
            <span
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
              }}
            >
              {supplier.sku_count} {t('factoriesPage.card.skusAvailable')}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icons.ChevronRight size={24} color={colors.text.tertiary} />
        </div>
      </div>
    </div>
  );
};
