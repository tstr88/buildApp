/**
 * MoreMenuSheet Component
 * Bottom sheet menu for additional navigation items on mobile
 * Modern, sleek design with smooth animations
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../icons/Icons';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../../theme/tokens';

interface MenuItem {
  id: string;
  icon: keyof typeof Icons;
  labelKey: string;
  path: string;
  description?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'orders', icon: 'FileText', labelKey: 'nav.orders', path: '/orders', description: 'nav.ordersDescription' },
  { id: 'catalog', icon: 'Catalog', labelKey: 'nav.catalog', path: '/catalog', description: 'nav.catalogDescription' },
  { id: 'rentals', icon: 'Rentals', labelKey: 'nav.rentals', path: '/rentals', description: 'nav.rentalsDescription' },
  { id: 'my-rentals', icon: 'Wrench', labelKey: 'nav.myRentals', path: '/rentals/my', description: 'nav.myRentalsDescription' },
  { id: 'factories', icon: 'Factory', labelKey: 'nav.factories', path: '/factories', description: 'nav.factoriesDescription' },
  { id: 'profile', icon: 'Profile', labelKey: 'nav.profile', path: '/profile', description: 'nav.profileDescription' },
];

interface MoreMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MoreMenuSheet: React.FC<MoreMenuSheetProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleItemClick = (path: string) => {
    onClose();
    // Small delay to allow animation to complete
    setTimeout(() => navigate(path), 150);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 300ms ease',
          zIndex: 1040,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.neutral[0],
          borderTopLeftRadius: borderRadius.xl,
          borderTopRightRadius: borderRadius.xl,
          boxShadow: shadows.xl,
          zIndex: 1050,
          transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
          paddingBottom: 'env(safe-area-inset-bottom, 20px)',
          maxHeight: '70vh',
          overflow: 'hidden',
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: spacing[3],
          }}
        >
          <div
            style={{
              width: '36px',
              height: '4px',
              backgroundColor: colors.neutral[300],
              borderRadius: borderRadius.full,
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            padding: `0 ${spacing[4]} ${spacing[3]}`,
            borderBottom: `1px solid ${colors.border.light}`,
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            {t('nav.moreOptions', 'More Options')}
          </h2>
        </div>

        {/* Menu Items */}
        <div
          style={{
            padding: spacing[2],
            overflowY: 'auto',
          }}
        >
          {MENU_ITEMS.map((item) => {
            const Icon = Icons[item.icon];
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: spacing[3],
                  marginBottom: spacing[1],
                  border: 'none',
                  backgroundColor: active ? colors.primary[50] : 'transparent',
                  borderRadius: borderRadius.lg,
                  cursor: 'pointer',
                  transition: `all ${transitions.fast} ease`,
                  textAlign: 'left',
                }}
              >
                {/* Icon Container */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: active ? colors.primary[100] : colors.neutral[100],
                    borderRadius: borderRadius.lg,
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 2}
                    color={active ? colors.primary[600] : colors.text.secondary}
                  />
                </div>

                {/* Text Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.medium,
                      color: active ? colors.primary[600] : colors.text.primary,
                      marginBottom: '2px',
                    }}
                  >
                    {t(item.labelKey)}
                  </div>
                  {item.description && (
                    <div
                      style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary,
                      }}
                    >
                      {t(item.description, '')}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <Icons.ChevronRight
                  size={20}
                  color={colors.text.tertiary}
                  style={{ flexShrink: 0 }}
                />
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <div
          style={{
            padding: `${spacing[2]} ${spacing[4]} ${spacing[4]}`,
            borderTop: `1px solid ${colors.border.light}`,
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: spacing[3],
              backgroundColor: colors.neutral[100],
              border: 'none',
              borderRadius: borderRadius.lg,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              cursor: 'pointer',
              transition: `all ${transitions.fast} ease`,
            }}
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </>
  );
};

export default MoreMenuSheet;
