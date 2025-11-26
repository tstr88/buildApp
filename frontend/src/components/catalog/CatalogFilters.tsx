/**
 * Catalog Filters Component
 * Sidebar with all filter options for catalog browsing
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface CatalogFiltersProps {
  filters: {
    search: string;
    categories: string[];
    suppliers: string[];
    directOrderOnly: boolean;
    deliveryOption: 'any' | 'pickup' | 'delivery' | 'both';
    leadTime: 'any' | 'same_day' | 'next_day' | 'negotiable';
    priceMin?: number;
    priceMax?: number;
    updatedSince?: string;
  };
  onChange: (filters: any) => void;
  onReset: () => void;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const { t } = useTranslation();

  const CATEGORIES = [
    { value: 'concrete', label: t('catalogPage.filters.categories.concrete') },
    { value: 'blocks', label: t('catalogPage.filters.categories.blocks') },
    { value: 'rebar', label: t('catalogPage.filters.categories.rebar') },
    { value: 'aggregates', label: t('catalogPage.filters.categories.aggregates') },
    { value: 'metal', label: t('catalogPage.filters.categories.metal') },
  ];

  const UPDATED_OPTIONS = [
    { value: '7d', label: t('catalogPage.filters.updatedOptions.last7Days') },
    { value: '14d', label: t('catalogPage.filters.updatedOptions.last14Days') },
    { value: '30d', label: t('catalogPage.filters.updatedOptions.last30Days') },
    { value: 'stale', label: t('catalogPage.filters.updatedOptions.stale') },
  ];
  const [suppliers, setSuppliers] = useState<Array<{ id: string; business_name: string }>>([]);
  const [supplierSearch, setSupplierSearch] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/factories?sort=reliability`);
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
        position: 'sticky',
        top: spacing[6],
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[4],
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
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
          {t('catalogPage.filters.title')}
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
          {t('catalogPage.filters.reset')}
        </button>
      </div>

      {/* Categories */}
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
          {t('catalogPage.filters.category')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {CATEGORIES.map((cat) => (
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
          {t('catalogPage.filters.supplier')}
        </h4>
        <input
          type="text"
          placeholder={t('catalogPage.filters.searchSuppliers')}
          value={supplierSearch}
          onChange={(e) => setSupplierSearch(e.target.value)}
          style={{
            width: '100%',
            padding: `${spacing[2]} ${spacing[3]}`,
            fontSize: typography.fontSize.sm,
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.md,
            marginBottom: spacing[2],
          }}
        />
        <div
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2],
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

      {/* Direct Order Toggle */}
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
            checked={filters.directOrderOnly}
            onChange={(e) => onChange({ directOrderOnly: e.target.checked })}
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
              {t('catalogPage.filters.directOrder')}
            </div>
          </div>
        </label>
      </div>

      {/* Delivery Option */}
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
          {t('catalogPage.filters.deliveryOption')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {[
            { value: 'any', label: t('catalogPage.filters.deliveryOptions.any') },
            { value: 'pickup', label: t('catalogPage.filters.deliveryOptions.pickup') },
            { value: 'delivery', label: t('catalogPage.filters.deliveryOptions.delivery') },
            { value: 'both', label: t('catalogPage.filters.deliveryOptions.both') },
          ].map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="deliveryOption"
                checked={filters.deliveryOption === option.value}
                onChange={() => onChange({ deliveryOption: option.value })}
                style={{ cursor: 'pointer' }}
              />
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.primary,
                }}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Lead Time */}
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
          {t('catalogPage.filters.leadTime')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {[
            { value: 'any', label: t('catalogPage.filters.leadTimeOptions.any') },
            { value: 'same_day', label: t('catalogPage.filters.leadTimeOptions.sameDay') },
            { value: 'next_day', label: t('catalogPage.filters.leadTimeOptions.nextDay') },
            { value: 'negotiable', label: t('catalogPage.filters.leadTimeOptions.negotiable') },
          ].map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="leadTime"
                checked={filters.leadTime === option.value}
                onChange={() => onChange({ leadTime: option.value })}
                style={{ cursor: 'pointer' }}
              />
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.primary,
                }}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
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
          {t('catalogPage.filters.priceRange')}
        </h4>
        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
          <input
            type="number"
            placeholder={t('catalogPage.filters.priceMin')}
            value={filters.priceMin || ''}
            onChange={(e) =>
              onChange({ priceMin: e.target.value ? Number(e.target.value) : undefined })
            }
            style={{
              flex: 1,
              padding: `${spacing[2]} ${spacing[2]}`,
              fontSize: typography.fontSize.sm,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
            }}
          />
          <span style={{ color: colors.text.tertiary }}>-</span>
          <input
            type="number"
            placeholder={t('catalogPage.filters.priceMax')}
            value={filters.priceMax || ''}
            onChange={(e) =>
              onChange({ priceMax: e.target.value ? Number(e.target.value) : undefined })
            }
            style={{
              flex: 1,
              padding: `${spacing[2]} ${spacing[2]}`,
              fontSize: typography.fontSize.sm,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
            }}
          />
        </div>
      </div>

      {/* Updated */}
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
          {t('catalogPage.filters.updated')}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
          {UPDATED_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                onChange({
                  updatedSince: filters.updatedSince === option.value ? undefined : option.value,
                })
              }
              style={{
                padding: `${spacing[1]} ${spacing[3]}`,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                backgroundColor:
                  filters.updatedSince === option.value ? colors.primary[100] : colors.neutral[100],
                color:
                  filters.updatedSince === option.value ? colors.primary[700] : colors.text.secondary,
                border: `1px solid ${
                  filters.updatedSince === option.value ? colors.primary[300] : colors.border.light
                }`,
                borderRadius: borderRadius.full,
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
