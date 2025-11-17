/**
 * SKU Row Component
 * Displays SKU in list view format
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface SKU {
  id: string;
  supplier_id: string;
  supplier_name_ka: string;
  supplier_name_en: string;
  name_ka: string;
  name_en: string;
  spec_string_ka?: string;
  spec_string_en?: string;
  category_ka: string;
  category_en: string;
  base_price?: number;
  unit_ka: string;
  unit_en: string;
  direct_order_available: boolean;
  lead_time_category?: 'same_day' | 'next_day' | 'negotiable';
  pickup_available: boolean;
  delivery_available: boolean;
  updated_at: string;
  thumbnail_url?: string;
}

interface SKURowProps {
  sku: SKU;
  onAddToRFQ: () => void;
  onDirectOrder: () => void;
}

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    concrete: Icons.Box,
    blocks: Icons.Grid3x3,
    rebar: Icons.GitBranch,
    aggregates: Icons.Mountain,
    metal: Icons.Ruler,
    tools: Icons.Wrench,
  };
  const IconComponent = iconMap[category] || Icons.Package;
  return <IconComponent size={20} color={colors.primary[600]} />;
};

const getTimeAgo = (dateString: string, t: any) => {
  const now = new Date();
  const updated = new Date(dateString);
  const diffMs = now.getTime() - updated.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('catalogPage.time.today');
  if (diffDays === 1) return t('catalogPage.time.yesterday');
  if (diffDays < 7) return t('catalogPage.time.daysAgo', { days: diffDays });
  if (diffDays < 30) return t('catalogPage.time.weeksAgo', { weeks: Math.floor(diffDays / 7) });
  return t('catalogPage.time.monthsAgo', { months: Math.floor(diffDays / 30) });
};

const isStale = (dateString: string) => {
  const now = new Date();
  const updated = new Date(dateString);
  const diffMs = now.getTime() - updated.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 14;
};

export const SKURow: React.FC<SKURowProps> = ({ sku, onAddToRFQ, onDirectOrder }) => {
  const { i18n, t } = useTranslation();
  const stale = isStale(sku.updated_at);

  const isGeorgian = i18n.language === 'ka';
  const name = isGeorgian ? sku.name_ka : sku.name_en;
  const specString = isGeorgian ? sku.spec_string_ka : sku.spec_string_en;
  const category = isGeorgian ? sku.category_ka : sku.category_en;
  const supplierName = isGeorgian ? sku.supplier_name_ka : sku.supplier_name_en;
  const unit = isGeorgian ? sku.unit_ka : sku.unit_en;

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[4],
        display: 'flex',
        gap: spacing[4],
        alignItems: 'center',
        transition: 'all 200ms ease',
        cursor: 'pointer',
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
      {/* Thumbnail */}
      <div
        style={{
          width: '100px',
          height: '100px',
          flexShrink: 0,
          backgroundColor: colors.neutral[100],
          borderRadius: borderRadius.md,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {sku.thumbnail_url ? (
          <img
            src={sku.thumbnail_url}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          getCategoryIcon(category)
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Category & Updated */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            marginBottom: spacing[1],
          }}
        >
          <span
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              textTransform: 'capitalize',
            }}
          >
            {category}
          </span>
          <span
            style={{
              fontSize: typography.fontSize.xs,
              color: stale ? colors.warning[700] : colors.text.tertiary,
            }}
          >
            • {getTimeAgo(sku.updated_at, t)}
          </span>
        </div>

        {/* Name & Spec */}
        <h4
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[1],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {specString ? (
            <>
              <strong>{specString}</strong> {name}
            </>
          ) : (
            name
          )}
        </h4>

        {/* Supplier */}
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
            marginBottom: spacing[2],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {supplierName}
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[1.5], alignItems: 'center' }}>
          {sku.direct_order_available && (
            <div
              style={{
                padding: `${spacing[0.5]} ${spacing[2]}`,
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
              {t('catalogPage.badges.direct')}
            </div>
          )}
          {sku.lead_time_category && (
            <div
              style={{
                padding: `${spacing[0.5]} ${spacing[2]}`,
                backgroundColor: colors.info[50],
                color: colors.info[700],
                borderRadius: borderRadius.sm,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              {sku.lead_time_category === 'same_day'
                ? t('catalogPage.badges.sameDay')
                : sku.lead_time_category === 'next_day'
                ? t('catalogPage.badges.nextDay')
                : t('catalogPage.badges.negotiable')}
            </div>
          )}
          {sku.pickup_available && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[0.5],
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
              }}
              title={t('catalogPage.badges.pickup')}
            >
              <Icons.MapPin size={14} />
              {t('catalogPage.badges.pickup')}
            </div>
          )}
          {sku.delivery_available && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[0.5],
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
              }}
              title={t('catalogPage.badges.delivery')}
            >
              <Icons.Truck size={14} />
              {t('catalogPage.badges.delivery')}
            </div>
          )}
          {stale && (
            <div
              style={{
                padding: `${spacing[0.5]} ${spacing[2]}`,
                backgroundColor: colors.warning[100],
                color: colors.warning[800],
                borderRadius: borderRadius.full,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              {t('catalogPage.badges.stale')}
            </div>
          )}
        </div>
      </div>

      {/* Price & Actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: spacing[2],
          minWidth: '180px',
        }}
      >
        {/* Price */}
        {sku.base_price && (
          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.primary[600],
                margin: 0,
                lineHeight: 1,
              }}
            >
              {Number(sku.base_price || 0).toLocaleString()} ₾
            </p>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              per {unit}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: spacing[2], width: '100%' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToRFQ();
            }}
            style={{
              flex: 1,
              padding: `${spacing[2]} ${spacing[3]}`,
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              cursor: 'pointer',
              transition: 'all 200ms ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[50];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[0];
            }}
          >
            {t('catalogPage.buttons.addToRfq')}
          </button>

          {sku.direct_order_available && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDirectOrder();
              }}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: colors.primary[600],
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.neutral[0],
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[1],
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[600];
              }}
            >
              <Icons.Zap size={14} />
              {t('catalogPage.buttons.order')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
