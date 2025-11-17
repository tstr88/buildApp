/**
 * SafetyNoticeCard Component
 * Displays sticky safety warnings and important notices
 */

import React from 'react';
import { Icons } from '../icons/Icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export interface SafetyNotice {
  id: string;
  message: string;
  severity?: 'warning' | 'error' | 'info';
}

interface SafetyNoticeCardProps {
  title: string;
  notices: SafetyNotice[];
  sticky?: boolean;
}

export const SafetyNoticeCard: React.FC<SafetyNoticeCardProps> = ({
  title,
  notices,
  sticky = false,
}) => {
  const AlertIcon = Icons.AlertCircle;

  return (
    <div
      style={{
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? spacing[4] : 'auto',
        backgroundColor: colors.warning + '10', // 10% opacity
        border: `2px solid ${colors.warning}`,
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        boxShadow: shadows.md,
        zIndex: sticky ? 10 : 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          marginBottom: spacing[3],
        }}
      >
        <AlertIcon size={24} color={colors.warning} strokeWidth={2} />
        <h3
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>

      {/* Notices List */}
      <ul
        style={{
          margin: 0,
          paddingLeft: spacing[6],
          listStyleType: 'disc',
        }}
      >
        {notices.map((notice) => {
          const severityColor =
            notice.severity === 'error'
              ? colors.error
              : notice.severity === 'info'
              ? colors.primary[600]
              : colors.warning;

          return (
            <li
              key={notice.id}
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.primary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing[2],
              }}
            >
              <span
                style={{
                  fontWeight: typography.fontWeight.medium,
                  color: severityColor,
                }}
              >
                {notice.message}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Non-dismissible indicator */}
      {sticky && (
        <div
          style={{
            marginTop: spacing[3],
            paddingTop: spacing[3],
            borderTop: `1px solid ${colors.warning}40`,
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            fontStyle: 'italic',
          }}
        >
          * This notice will remain visible as you scroll
        </div>
      )}
    </div>
  );
};
