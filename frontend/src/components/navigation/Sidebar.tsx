/**
 * Sidebar Component
 * Desktop navigation with full menu
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../icons/Icons';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, shadows, transitions, typography } from '../../theme/tokens';

interface MenuItem {
  id: string;
  icon: keyof typeof Icons;
  labelKey: string;
  path: string;
  badge?: number;
  divider?: boolean;
}

const BUYER_MENU: MenuItem[] = [
  { id: 'home', icon: 'Home', labelKey: 'nav.home', path: '/home' },
  { id: 'projects', icon: 'Projects', labelKey: 'nav.projects', path: '/projects' },
  { id: 'cart', icon: 'ShoppingCart', labelKey: 'nav.cart', path: '/cart' },
  { id: 'requests', icon: 'RFQs', labelKey: 'nav.requests', path: '/rfqs' },
  { id: 'catalog', icon: 'Catalog', labelKey: 'nav.catalog', path: '/catalog' },
  { id: 'rentals', icon: 'Rentals', labelKey: 'nav.rentals', path: '/rentals' },
  { id: 'my-rentals', icon: 'Wrench', labelKey: 'nav.myRentals', path: '/my-rentals' },
  { id: 'factories', icon: 'Factory', labelKey: 'nav.factories', path: '/factories' },
  { id: 'orders', icon: 'FileText', labelKey: 'nav.orders', path: '/orders', divider: true },
  { id: 'settings', icon: 'Settings', labelKey: 'nav.settings', path: '/settings' },
];

const SUPPLIER_MENU: MenuItem[] = [
  { id: 'dashboard', icon: 'Home', labelKey: 'nav.dashboard', path: '/supplier/dashboard' },
  { id: 'rfqs', icon: 'RFQs', labelKey: 'nav.rfqs', path: '/supplier/rfqs' },
  { id: 'catalog', icon: 'Catalog', labelKey: 'nav.catalog', path: '/supplier/catalog' },
  { id: 'orders', icon: 'FileText', labelKey: 'nav.orders', path: '/supplier/orders' },
  { id: 'performance', icon: 'TrendingUp', labelKey: 'nav.performance', path: '/supplier/performance' },
  { id: 'billing', icon: 'DollarSign', labelKey: 'nav.billing', path: '/supplier/billing', divider: true },
  { id: 'settings', icon: 'Settings', labelKey: 'nav.settings', path: '/settings' },
];

const ADMIN_MENU: MenuItem[] = [
  { id: 'dashboard', icon: 'Home', labelKey: 'nav.dashboard', path: '/admin' },
  { id: 'rfq-queue', icon: 'RFQs', labelKey: 'admin.nav.rfqQueue', path: '/admin/rfqs' },
  { id: 'delivery-queue', icon: 'Truck', labelKey: 'admin.nav.deliveryQueue', path: '/admin/deliveries' },
  { id: 'supplier-queue', icon: 'Factory', labelKey: 'admin.nav.supplierQueue', path: '/admin/suppliers' },
  { id: 'dispute-queue', icon: 'AlertTriangle', labelKey: 'admin.nav.disputeQueue', path: '/admin/disputes' },
  { id: 'confirmation-queue', icon: 'CheckCircle', labelKey: 'admin.nav.confirmationQueue', path: '/admin/confirmations' },
  { id: 'rental-queue', icon: 'Wrench', labelKey: 'admin.nav.rentalQueue', path: '/admin/rentals' },
  { id: 'templates', icon: 'FileText', labelKey: 'admin.nav.templates', path: '/admin/templates' },
  { id: 'exports', icon: 'Download', labelKey: 'admin.nav.exports', path: '/admin/exports' },
  { id: 'audit', icon: 'Shield', labelKey: 'admin.nav.audit', path: '/admin/audit', divider: true },
  { id: 'settings', icon: 'Settings', labelKey: 'nav.settings', path: '/settings' },
];

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Determine which menu to show based on user type
  const menuItems =
    user?.user_type === 'admin' ? ADMIN_MENU :
    user?.user_type === 'supplier' ? SUPPLIER_MENU :
    BUYER_MENU;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: collapsed ? '64px' : '240px',
        backgroundColor: colors.neutral[0],
        borderRight: `1px solid ${colors.border.light}`,
        boxShadow: shadows.sm,
        transition: `width ${transitions.base} ease`,
        zIndex: 1020,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? spacing[4] : spacing[6],
          borderBottom: `1px solid ${colors.border.light}`,
        }}
      >
        <div
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.primary[600],
            whiteSpace: 'nowrap',
          }}
        >
          {collapsed ? 'bA' : 'buildApp'}
        </div>
      </div>

      {/* Menu Items */}
      <nav
        style={{
          flex: 1,
          padding: spacing[2],
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {menuItems.map((item) => {
          const Icon = Icons[item.icon];
          const active = isActive(item.path);

          return (
            <React.Fragment key={item.id}>
              <button
                onClick={() => handleMenuClick(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: spacing[3],
                  marginBottom: spacing[1],
                  border: 'none',
                  backgroundColor: active ? colors.primary[50] : 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: `all ${transitions.fast} ease`,
                  textAlign: 'left',
                }}
                aria-label={t(item.labelKey)}
                aria-current={active ? 'page' : undefined}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = colors.neutral[100];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    position: 'relative',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 2}
                    color={active ? colors.primary[600] : colors.text.secondary}
                  />
                  {item.badge && item.badge > 0 && (
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
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                {!collapsed && (
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.normal,
                      color: active ? colors.primary[600] : colors.text.primary,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t(item.labelKey)}
                  </span>
                )}

                {/* Active indicator */}
                {active && (
                  <div
                    style={{
                      marginLeft: 'auto',
                      width: '3px',
                      height: '20px',
                      backgroundColor: colors.primary[600],
                      borderRadius: '3px',
                    }}
                  />
                )}
              </button>

              {item.divider && (
                <div
                  style={{
                    height: '1px',
                    backgroundColor: colors.border.light,
                    margin: `${spacing[3]} 0`,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div
        style={{
          borderTop: `1px solid ${colors.border.light}`,
          padding: spacing[3],
        }}
      >
        {/* Language Switcher */}
        {!collapsed && (
          <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'center' }}>
            <LanguageSwitcher />
          </div>
        )}

        {/* Profile Button */}
        <button
          onClick={() => navigate('/profile')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            padding: spacing[3],
            border: 'none',
            backgroundColor: 'transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: `all ${transitions.fast} ease`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.neutral[100];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Icons.Profile
            size={20}
            color={colors.text.secondary}
          />
          {!collapsed && (
            <span
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.primary,
                whiteSpace: 'nowrap',
              }}
            >
              {t('nav.profile')}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
