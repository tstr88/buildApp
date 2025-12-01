/**
 * PageHeader Component
 * Modern page header with support for primary-colored sticky headers
 * Matches the design pattern from RFQs, Orders, MyRentals pages
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { colors, spacing, typography, shadows } from '../../theme/tokens';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'primary';
  showBackButton?: boolean;
  onBack?: () => void;
  sticky?: boolean;
  tabs?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  variant = 'default',
  showBackButton = false,
  onBack,
  sticky = false,
  tabs,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Primary header style (colored background)
  if (variant === 'primary') {
    return (
      <header
        style={{
          position: sticky ? 'sticky' : 'relative',
          top: sticky ? 0 : undefined,
          zIndex: sticky ? 1020 : undefined,
          backgroundColor: colors.primary[600],
          color: colors.neutral[0],
          boxShadow: shadows.md,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: `${spacing[4]} ${spacing[4]}`,
          }}
        >
          {/* Top row: Back button + Title + Action */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: tabs ? spacing[3] : 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
              {showBackButton && (
                <button
                  onClick={handleBack}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: colors.neutral[0],
                    transition: 'background-color 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div>
                <h1
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.neutral[0],
                    margin: 0,
                  }}
                >
                  {title}
                </h1>
                {subtitle && (
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: 'rgba(255, 255, 255, 0.8)',
                      margin: 0,
                      marginTop: spacing[1],
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {action && <div>{action}</div>}
          </div>

          {/* Tabs row */}
          {tabs}
        </div>
      </header>
    );
  }

  // Default header style (simple text header)
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing[6],
        gap: spacing[4],
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
        {showBackButton && (
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              backgroundColor: colors.neutral[100],
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: colors.text.secondary,
              transition: 'all 200ms ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[200];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[100];
            }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: subtitle ? spacing[1] : 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader;
