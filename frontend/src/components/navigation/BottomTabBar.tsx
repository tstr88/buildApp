/**
 * BottomTabBar Component
 * Mobile navigation with thumb-reach optimization
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../icons/Icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, heights, shadows, transitions } from '../../theme/tokens';

interface TabItem {
  id: string;
  icon: keyof typeof Icons;
  labelKey: string;
  path: string;
  badge?: number;
}

const BUYER_TABS: TabItem[] = [
  { id: 'home', icon: 'Home', labelKey: 'nav.home', path: '/home' },
  { id: 'projects', icon: 'Projects', labelKey: 'nav.projects', path: '/projects' },
  { id: 'rfqs', icon: 'RFQs', labelKey: 'nav.rfqs', path: '/rfqs' },
  { id: 'profile', icon: 'Profile', labelKey: 'nav.profile', path: '/profile' },
];

const SUPPLIER_TABS: TabItem[] = [
  { id: 'dashboard', icon: 'Home', labelKey: 'nav.dashboard', path: '/supplier/dashboard' },
  { id: 'rfqs', icon: 'RFQs', labelKey: 'nav.rfqs', path: '/supplier/rfqs' },
  { id: 'catalog', icon: 'Catalog', labelKey: 'nav.catalog', path: '/supplier/catalog' },
  { id: 'profile', icon: 'Profile', labelKey: 'nav.profile', path: '/profile' },
];

export const BottomTabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Determine which tabs to show based on user type
  const tabs = user?.user_type === 'supplier' ? SUPPLIER_TABS : BUYER_TABS;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: heights.bottomNav,
        backgroundColor: colors.neutral[0],
        borderTop: `1px solid ${colors.border.light}`,
        boxShadow: shadows.lg,
        zIndex: 1030,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom, 0)', // iOS safe area
      }}
    >
      {tabs.map((tab) => {
        const Icon = Icons[tab.icon];
        const active = isActive(tab.path);

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[1],
              padding: spacing[2],
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: `all ${transitions.fast} ease`,
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
            }}
            aria-label={t(tab.labelKey)}
            aria-current={active ? 'page' : undefined}
          >
            {/* Icon */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                color={active ? colors.primary[600] : colors.text.secondary}
                style={{
                  transition: `all ${transitions.fast} ease`,
                }}
              />
              {tab.badge && tab.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    backgroundColor: colors.error[500],
                    color: colors.text.inverse,
                    fontSize: '10px',
                    fontWeight: 700,
                    lineHeight: 1,
                    padding: '2px 4px',
                    borderRadius: '10px',
                    minWidth: '16px',
                    textAlign: 'center',
                  }}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: active ? 600 : 400,
                color: active ? colors.primary[600] : colors.text.secondary,
                transition: `all ${transitions.fast} ease`,
                whiteSpace: 'nowrap',
              }}
            >
              {t(tab.labelKey)}
            </span>

            {/* Active indicator */}
            {active && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '32px',
                  height: '3px',
                  backgroundColor: colors.primary[600],
                  borderRadius: '0 0 3px 3px',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
