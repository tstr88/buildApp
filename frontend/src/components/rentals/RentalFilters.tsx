/**
 * Rental Filters Component
 * Sidebar with all filter options for rental tool browsing
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import { API_BASE_URL } from '../../services/api/client';

interface RentalFiltersProps {
  filters: {
    search?: string;
    categories: string[];
    suppliers: string[];
    directBookingOnly: boolean;
    deliveryAvailable: boolean;
    minDailyRate?: number;
    maxDailyRate?: number;
    minWeeklyRate?: number;
    maxWeeklyRate?: number;
  };
  onChange: (filters: any) => void;
  onReset: () => void;
  isMobile?: boolean;
}

export const RentalFilters: React.FC<RentalFiltersProps> = ({
  filters,
  onChange,
  onReset,
  isMobile = false,
}) => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Array<{ id: string; business_name: string }>>([]);
  const [supplierSearch, setSupplierSearch] = useState('');

  const TOOL_CATEGORIES = [
    { value: 'concrete', label: t('rentalsPage.filters.toolCategories.concrete') },
    { value: 'excavation', label: t('rentalsPage.filters.toolCategories.excavation') },
    { value: 'lifting', label: t('rentalsPage.filters.toolCategories.lifting') },
    { value: 'safety', label: t('rentalsPage.filters.toolCategories.safety') },
    { value: 'measuring', label: t('rentalsPage.filters.toolCategories.measuring') },
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/factories?sort=reliability`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ categories: newCategories });
  };

  const handleSupplierToggle = (supplierId: string) => {
    const newSuppliers = filters.suppliers.includes(supplierId)
      ? filters.suppliers.filter((s) => s !== supplierId)
      : [...filters.suppliers, supplierId];
    onChange({ suppliers: newSuppliers });
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.business_name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  return (
    <div
      style={{
        ...(isMobile
          ? {
              // Mobile: no sticky, no border, no maxHeight - parent handles scrolling
              backgroundColor: colors.neutral[0],
              overflowX: 'hidden',
              width: '100%',
              boxSizing: 'border-box',
            }
          : {
              // Desktop: sticky sidebar with scrolling
              position: 'sticky',
              top: spacing[6],
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              padding: spacing[4],
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
            }),
      }}
    >
      {/* Header - only show on desktop, mobile sheet has its own header */}
      {!isMobile && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing[4],
            paddingBottom: spacing[3],
            borderBottom: `1px solid ${colors.border.light}`,
          }}
        >
          <h3
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            {t('rentalsPage.filters.title')}
          </h3>
          <button
            onClick={onReset}
            style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor: 'transparent',
              border: 'none',
              color: colors.primary[600],
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            {t('rentalsPage.filters.reset')}
          </button>
        </div>
      )}

      {/* Mobile Reset Button - show at top of filters on mobile */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: spacing[3],
          }}
        >
          <button
            onClick={onReset}
            style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor: 'transparent',
              border: 'none',
              color: colors.primary[600],
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            {t('rentalsPage.filters.reset')}
          </button>
        </div>
      )}

      {/* Tool Categories */}
      <div style={{ marginBottom: spacing[5] }}>
        <h4
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}
        >
          {t('rentalsPage.filters.category')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {TOOL_CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.value)}
                onChange={() => handleCategoryToggle(cat.value)}
                style={{ cursor: 'pointer' }}
              />
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.primary,
                }}
              >
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Suppliers */}
      <div style={{ marginBottom: spacing[5] }}>
        <h4
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}
        >
          {t('rentalsPage.filters.supplier')}
        </h4>
        <input
          type="text"
          placeholder={t('rentalsPage.filters.searchSuppliers')}
          value={supplierSearch}
          onChange={(e) => setSupplierSearch(e.target.value)}
          style={{
            width: '100%',
            padding: `${spacing[2]} ${spacing[3]}`,
            fontSize: typography.fontSize.sm,
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.md,
            marginBottom: spacing[2],
            boxSizing: 'border-box',
          }}
        />
        <div
          style={{
            maxHeight: isMobile ? '150px' : '200px',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2],
            ...(isMobile && {
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
            }),
          }}
        >
          {filteredSuppliers.map((supplier) => (
            <label
              key={supplier.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={filters.suppliers.includes(supplier.id)}
                onChange={() => handleSupplierToggle(supplier.id)}
                style={{ cursor: 'pointer' }}
              />
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.primary,
                }}
              >
                {supplier.business_name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Direct Booking Toggle */}
      <div style={{ marginBottom: spacing[5] }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={filters.directBookingOnly}
            onChange={(e) => onChange({ directBookingOnly: e.target.checked })}
            style={{ cursor: 'pointer' }}
          />
          <div>
            <div
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
              }}
            >
              <Icons.Zap size={14} color={colors.warning[600]} />
              {t('rentalsPage.filters.directBooking')}
            </div>
          </div>
        </label>
      </div>

      {/* Delivery Available Toggle */}
      <div style={{ marginBottom: spacing[5] }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={filters.deliveryAvailable}
            onChange={(e) => onChange({ deliveryAvailable: e.target.checked })}
            style={{ cursor: 'pointer' }}
          />
          <div>
            <div
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
              }}
            >
              <Icons.Truck size={14} color={colors.primary[600]} />
              {t('rentalsPage.filters.deliveryAvailable')}
            </div>
          </div>
        </label>
      </div>

      {/* Daily Rate Range */}
      <div style={{ marginBottom: spacing[5] }}>
        <h4
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}
        >
          {t('rentalsPage.filters.dailyRate')} (₾)
        </h4>
        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center', width: '100%' }}>
          <input
            type="number"
            placeholder={t('rentalsPage.filters.min')}
            value={filters.minDailyRate || ''}
            onChange={(e) =>
              onChange({ minDailyRate: e.target.value ? Number(e.target.value) : undefined })
            }
            style={{
              flex: 1,
              minWidth: 0,
              padding: `${spacing[2]} ${spacing[2]}`,
              fontSize: typography.fontSize.sm,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              boxSizing: 'border-box',
            }}
          />
          <span style={{ color: colors.text.tertiary, flexShrink: 0 }}>-</span>
          <input
            type="number"
            placeholder={t('rentalsPage.filters.max')}
            value={filters.maxDailyRate || ''}
            onChange={(e) =>
              onChange({ maxDailyRate: e.target.value ? Number(e.target.value) : undefined })
            }
            style={{
              flex: 1,
              minWidth: 0,
              padding: `${spacing[2]} ${spacing[2]}`,
              fontSize: typography.fontSize.sm,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Weekly Rate Range */}
      <div>
        <h4
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}
        >
          {t('rentalsPage.filters.weeklyRate')} (₾)
        </h4>
        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center', width: '100%' }}>
          <input
            type="number"
            placeholder={t('rentalsPage.filters.min')}
            value={filters.minWeeklyRate || ''}
            onChange={(e) =>
              onChange({ minWeeklyRate: e.target.value ? Number(e.target.value) : undefined })
            }
            style={{
              flex: 1,
              minWidth: 0,
              padding: `${spacing[2]} ${spacing[2]}`,
              fontSize: typography.fontSize.sm,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              boxSizing: 'border-box',
            }}
          />
          <span style={{ color: colors.text.tertiary, flexShrink: 0 }}>-</span>
          <input
            type="number"
            placeholder={t('rentalsPage.filters.max')}
            value={filters.maxWeeklyRate || ''}
            onChange={(e) =>
              onChange({ maxWeeklyRate: e.target.value ? Number(e.target.value) : undefined })
            }
            style={{
              flex: 1,
              minWidth: 0,
              padding: `${spacing[2]} ${spacing[2]}`,
              fontSize: typography.fontSize.sm,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </div>
  );
};
