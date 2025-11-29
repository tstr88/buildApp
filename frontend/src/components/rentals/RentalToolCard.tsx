/**
 * Rental Tool Card Component
 * Displays rental tool in grid view format - matches SKUCard styling
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import * as Icons from 'lucide-react';

interface RentalTool {
  id: string;
  tool_name: string;
  spec_string?: string;
  photo_url?: string;
  supplier_id: string;
  supplier_name: string;
  daily_rate?: number;
  weekly_rate?: number;
  deposit_amount?: number;
  delivery_available: boolean;
  pickup_available: boolean;
  direct_booking_available: boolean;
  category?: string;
}

interface RentalToolCardProps {
  tool: RentalTool;
  onRequestQuote?: (toolId: string) => void;
  onBookNow?: (toolId: string) => void;
}

const getCategoryIcon = (category?: string) => {
  const iconMap: Record<string, any> = {
    concrete: Icons.Box,
    excavation: Icons.Shovel,
    lifting: Icons.ArrowUpFromLine,
    safety: Icons.HardHat,
    measuring: Icons.Ruler,
  };
  const IconComponent = category ? iconMap[category] || Icons.Wrench : Icons.Wrench;
  return <IconComponent size={18} color={colors.primary[600]} />;
};

export const RentalToolCard: React.FC<RentalToolCardProps> = ({
  tool,
  onRequestQuote,
  onBookNow,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCardClick = () => {
    navigate(`/rentals/tools/${tool.id}`);
  };

  const handleRequestQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRequestQuote) {
      onRequestQuote(tool.id);
    } else {
      navigate('/rentals/rfq', { state: { preselectedTools: [tool.id] } });
    }
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookNow) {
      onBookNow(tool.id);
    } else {
      navigate(`/rentals/book/${tool.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        overflow: 'hidden',
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
          width: '100%',
          height: '160px',
          backgroundColor: colors.neutral[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {tool.photo_url ? (
          <img
            src={tool.photo_url}
            alt={tool.tool_name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          getCategoryIcon(tool.category)
        )}

        {/* Badges Overlay */}
        <div
          style={{
            position: 'absolute',
            top: spacing[2],
            left: spacing[2],
            right: spacing[2],
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
            {tool.direct_booking_available && (
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
                {t('rentalsPage.badges.direct')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: spacing[3] }}>
        {/* Category */}
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
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              textTransform: 'capitalize',
            }}
          >
            {tool.category || t('rentalsPage.category.tool')}
          </span>
        </div>

        {/* Name & Spec */}
        <h4
          style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[1],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {tool.spec_string ? (
            <>
              <strong>{tool.spec_string}</strong> {tool.tool_name}
            </>
          ) : (
            tool.tool_name
          )}
        </h4>

        {/* Supplier */}
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
            marginBottom: spacing[3],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {tool.supplier_name}
        </p>

        {/* Rates */}
        {(tool.daily_rate || tool.weekly_rate) && (
          <div
            style={{
              padding: `${spacing[2]} 0`,
              borderTop: `1px solid ${colors.border.light}`,
              borderBottom: `1px solid ${colors.border.light}`,
              marginBottom: spacing[3],
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.primary[600],
                margin: 0,
              }}
            >
              {tool.daily_rate && (
                <>
                  {tool.daily_rate.toLocaleString()} ₾
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.normal,
                      color: colors.text.secondary,
                    }}
                  >
                    {' '}/ {t('rentalsPage.pricing.day')}
                  </span>
                </>
              )}
            </p>
            {tool.weekly_rate && (
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  margin: 0,
                  marginTop: spacing[1],
                }}
              >
                {tool.weekly_rate.toLocaleString()} ₾ / {t('rentalsPage.pricing.week')}
              </p>
            )}
          </div>
        )}

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[1], marginBottom: spacing[3] }}>
          {tool.deposit_amount && (
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
              {tool.deposit_amount.toLocaleString()} ₾ {t('rentalsPage.pricing.deposit')}
            </div>
          )}
          {tool.pickup_available && (
            <div
              style={{
                padding: `${spacing[0.5]} ${spacing[1.5]}`,
                backgroundColor: colors.neutral[100],
                borderRadius: borderRadius.sm,
                display: 'flex',
                alignItems: 'center',
              }}
              title={t('rentalsPage.badges.pickup')}
            >
              <Icons.MapPin size={12} color={colors.text.tertiary} />
            </div>
          )}
          {tool.delivery_available && (
            <div
              style={{
                padding: `${spacing[0.5]} ${spacing[1.5]}`,
                backgroundColor: colors.neutral[100],
                borderRadius: borderRadius.sm,
                display: 'flex',
                alignItems: 'center',
              }}
              title={t('rentalsPage.badges.delivery')}
            >
              <Icons.Truck size={12} color={colors.text.tertiary} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: spacing[2] }}>
          <button
            onClick={handleRequestQuote}
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
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[50];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[0];
            }}
          >
            {t('rentalsPage.requestQuote')}
          </button>

          {tool.direct_booking_available && (
            <button
              onClick={handleBookNow}
              style={{
                flex: 1,
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[600];
              }}
            >
              <Icons.Zap size={14} />
              {t('rentalsPage.buttons.book')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
