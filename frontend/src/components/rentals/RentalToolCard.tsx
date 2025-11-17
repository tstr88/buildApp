import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
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

export const RentalToolCard: React.FC<RentalToolCardProps> = ({
  tool,
  onRequestQuote,
  onBookNow,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCardClick = () => {
    // Navigate to tool detail page
    navigate(`/rentals/tools/${tool.id}`);
  };

  const handleRequestQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRequestQuote) {
      onRequestQuote(tool.id);
    } else {
      // Default: navigate to rental RFQ with this tool pre-selected
      navigate('/rentals/rfq', { state: { preselectedTools: [tool.id] } });
    }
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookNow) {
      onBookNow(tool.id);
    } else {
      // Navigate to direct booking flow
      navigate(`/rentals/book/${tool.id}`);
    }
  };

  const formatRate = () => {
    const rates = [];
    if (tool.daily_rate) {
      rates.push(`${tool.daily_rate.toLocaleString()} ₾ ${t('rentalsPage.pricing.perDay')}`);
    }
    if (tool.weekly_rate) {
      rates.push(`${tool.weekly_rate.toLocaleString()} ₾ ${t('rentalsPage.pricing.perWeek')}`);
    }
    return rates.join(` ${t('rentalsPage.pricing.or')} `);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        backgroundColor: colors.neutral[0],
        border: `1px solid ${colors.neutral[200]}`,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        ':hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Tool Photo */}
      <div
        style={{
          width: '100%',
          height: '200px',
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
          <Icons.Wrench size={48} color={colors.neutral[400]} />
        )}

        {/* Direct Booking Badge */}
        {tool.direct_booking_available && (
          <div
            style={{
              position: 'absolute',
              top: spacing[2],
              right: spacing[2],
              backgroundColor: colors.primary[600],
              color: colors.neutral[0],
              padding: `${spacing[1]}px ${spacing[2]}px`,
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

      {/* Tool Info */}
      <div style={{ padding: spacing[4] }}>
        {/* Tool Name & Spec */}
        <h3
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            marginBottom: spacing[1],
          }}
        >
          {tool.tool_name}
        </h3>
        {tool.spec_string && (
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              marginBottom: spacing[3],
            }}
          >
            {tool.spec_string}
          </p>
        )}

        {/* Supplier Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            marginBottom: spacing[3],
          }}
        >
          <Icons.Building2 size={14} color={colors.neutral[500]} />
          <span
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
            }}
          >
            {tool.supplier_name}
          </span>
        </div>

        {/* Rates */}
        <div style={{ marginBottom: spacing[3] }}>
          <p
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.primary[600],
              marginBottom: spacing[1],
            }}
          >
            {formatRate()}
          </p>
          {tool.deposit_amount && (
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
              }}
            >
              {tool.deposit_amount.toLocaleString()} ₾ {t('rentalsPage.pricing.deposit')}
            </p>
          )}
        </div>

        {/* Delivery Options */}
        <div
          style={{
            display: 'flex',
            gap: spacing[2],
            marginBottom: spacing[4],
          }}
        >
          {tool.delivery_available && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
                padding: `${spacing[1]}px ${spacing[2]}px`,
                backgroundColor: colors.success[50],
                color: colors.success[700],
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.xs,
              }}
            >
              <Icons.Truck size={12} />
              {t('rentalsPage.badges.delivery')}
            </div>
          )}
          {tool.pickup_available && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
                padding: `${spacing[1]}px ${spacing[2]}px`,
                backgroundColor: colors.info[50],
                color: colors.info[700],
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.xs,
              }}
            >
              <Icons.MapPin size={12} />
              {t('rentalsPage.badges.pickup')}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: tool.direct_booking_available ? '1fr 1fr' : '1fr',
            gap: spacing[2],
          }}
        >
          <button
            onClick={handleRequestQuote}
            style={{
              padding: `${spacing[2]}px ${spacing[3]}px`,
              backgroundColor: colors.neutral[0],
              color: colors.primary[600],
              border: `1px solid ${colors.primary[600]}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t('rentalsPage.requestQuote')}
          </button>

          {tool.direct_booking_available && (
            <button
              onClick={handleBookNow}
              style={{
                padding: `${spacing[2]}px ${spacing[3]}px`,
                backgroundColor: colors.primary[600],
                color: colors.neutral[0],
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[1],
              }}
            >
              <Icons.Calendar size={16} />
              {t('rentalsPage.buttons.book')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
