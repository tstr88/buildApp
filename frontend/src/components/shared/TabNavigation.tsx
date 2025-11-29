/**
 * TabNavigation Component
 * Unified tab navigation for consistent tab display across all list pages
 */

import React from 'react';
import { colors, spacing, typography, transitions } from '../../theme/tokens';

export interface Tab {
  id: string;
  label: string;
  count?: number;
  hasAlert?: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: spacing[1],
        borderBottom: `1px solid ${colors.border.light}`,
        marginBottom: spacing[4],
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[3]} ${spacing[4]}`,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: typography.fontSize.sm,
              fontWeight: isActive
                ? typography.fontWeight.semibold
                : typography.fontWeight.medium,
              color: isActive ? colors.primary[600] : colors.text.secondary,
              whiteSpace: 'nowrap',
              transition: `all ${transitions.fast} ease`,
              borderBottom: isActive
                ? `2px solid ${colors.primary[600]}`
                : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}

            {/* Count badge */}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '20px',
                  height: '20px',
                  padding: `0 ${spacing[1.5]}`,
                  backgroundColor: tab.hasAlert
                    ? colors.error[500]
                    : isActive
                      ? colors.primary[100]
                      : colors.neutral[100],
                  color: tab.hasAlert
                    ? colors.neutral[0]
                    : isActive
                      ? colors.primary[700]
                      : colors.text.secondary,
                  borderRadius: '10px',
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  lineHeight: 1,
                }}
              >
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}

            {/* Alert dot (for disputed etc.) */}
            {tab.hasAlert && !tab.count && (
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: colors.error[500],
                  borderRadius: '50%',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
