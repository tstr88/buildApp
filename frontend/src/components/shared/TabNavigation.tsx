/**
 * TabNavigation Component
 * Modern pill-style tab navigation matching RFQs, Orders, MyRentals pages
 * Mobile-optimized with horizontal scrolling
 */

import React from 'react';
import { colors, spacing, typography, borderRadius, transitions } from '../../theme/tokens';

export interface Tab {
  id: string;
  label: string;
  count?: number;
  hasAlert?: boolean;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'pills',
}) => {
  if (variant === 'default') {
    // Classic underline tabs for backwards compatibility
    return (
      <>
        <style>{`
          .tab-navigation-container {
            display: flex;
            gap: ${spacing[1]};
            border-bottom: 1px solid ${colors.border.light};
            margin-bottom: ${spacing[4]};
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .tab-navigation-container::-webkit-scrollbar {
            display: none;
          }
          .tab-button {
            position: relative;
            display: flex;
            align-items: center;
            gap: ${spacing[1]};
            padding: ${spacing[2]} ${spacing[3]};
            border: none;
            background-color: transparent;
            cursor: pointer;
            font-size: ${typography.fontSize.sm};
            white-space: nowrap;
            transition: all ${transitions.fast} ease;
            margin-bottom: -1px;
            flex-shrink: 0;
          }
        `}</style>
        <div className="tab-navigation-container">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="tab-button"
                onClick={() => onTabChange(tab.id)}
                style={{
                  fontWeight: isActive
                    ? typography.fontWeight.semibold
                    : typography.fontWeight.medium,
                  color: isActive ? colors.primary[600] : colors.text.secondary,
                  borderBottom: isActive
                    ? `2px solid ${colors.primary[600]}`
                    : '2px solid transparent',
                }}
              >
                {tab.icon}
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
      </>
    );
  }

  // Modern pill-style tabs (default)
  return (
    <>
      <style>{`
        .tab-pills-container {
          display: flex;
          gap: ${spacing[2]};
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          -ms-overflow-style: none;
          scrollbar-width: none;
          padding-bottom: ${spacing[1]};
          margin-bottom: ${spacing[4]};
        }
        .tab-pills-container::-webkit-scrollbar {
          display: none;
        }
        .tab-pill {
          display: flex;
          align-items: center;
          gap: ${spacing[2]};
          padding: ${spacing[2]} ${spacing[4]};
          border: none;
          border-radius: ${borderRadius.full};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.medium};
          white-space: nowrap;
          transition: all ${transitions.fast} ease;
          flex-shrink: 0;
        }
        .tab-pill:hover:not(.active) {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
      <div className="tab-pills-container">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`tab-pill ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              style={{
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: colors.neutral[0],
                fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
              }}
            >
              {tab.icon}
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
                    padding: `0 6px`,
                    backgroundColor: tab.hasAlert
                      ? colors.error[500]
                      : 'rgba(255, 255, 255, 0.25)',
                    color: colors.neutral[0],
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                    lineHeight: 1,
                  }}
                >
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}

              {/* Alert dot */}
              {tab.hasAlert && !tab.count && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: colors.error[400],
                    borderRadius: '50%',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default TabNavigation;
