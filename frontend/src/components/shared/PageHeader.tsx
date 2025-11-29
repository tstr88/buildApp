/**
 * PageHeader Component
 * Unified page header with title, subtitle, and action button
 */

import React from 'react';
import { colors, spacing, typography } from '../../theme/tokens';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
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
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader;
