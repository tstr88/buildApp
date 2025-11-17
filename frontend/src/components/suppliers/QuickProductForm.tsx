/**
 * Quick Product Form Component
 * Fast product entry form for supplier onboarding
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

export type ProductUnit = 'm3' | 'm2' | 'm' | 'kg' | 'ton' | 'pcs';
export type DeliveryOption = 'pickup' | 'delivery' | 'both';
export type LeadTime = 'same_day' | 'next_day' | 'custom' | 'negotiable';

export interface QuickProduct {
  id: string;
  name: string;
  unit: ProductUnit;
  base_price: string;
  delivery_option: DeliveryOption;
  direct_order_enabled: boolean;
  lead_time: LeadTime;
  custom_days?: number;
}

interface QuickProductFormProps {
  product: QuickProduct;
  onChange: (product: QuickProduct) => void;
  onRemove: () => void;
  showRemove: boolean;
}

export const QuickProductForm: React.FC<QuickProductFormProps> = ({
  product,
  onChange,
  onRemove,
  showRemove,
}) => {
  const { t } = useTranslation();

  const units: ProductUnit[] = ['m3', 'm2', 'm', 'kg', 'ton', 'pcs'];
  const deliveryOptions: DeliveryOption[] = ['pickup', 'delivery', 'both'];
  const leadTimes: LeadTime[] = ['same_day', 'next_day', 'custom', 'negotiable'];

  const getUnitLabel = (unit: ProductUnit) => {
    return t(`supplierOnboarding.products.productForm.units.${unit}`);
  };

  const getDeliveryLabel = (option: DeliveryOption) => {
    return t(`supplierOnboarding.products.productForm.deliveryOptions.${option}`);
  };

  const getLeadTimeLabel = (leadTime: LeadTime) => {
    const leadTimeMap: Record<LeadTime, string> = {
      same_day: 'sameDay',
      next_day: 'nextDay',
      custom: 'custom',
      negotiable: 'negotiable',
    };
    return t(`supplierOnboarding.products.productForm.leadTimes.${leadTimeMap[leadTime]}`);
  };

  return (
    <div
      style={{
        padding: spacing[4],
        backgroundColor: colors.neutral[0],
        border: `1px solid ${colors.border.light}`,
        borderRadius: borderRadius.md,
        position: 'relative',
      }}
    >
      {/* Remove Button */}
      {showRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: spacing[3],
            right: spacing[3],
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: colors.error,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            fontSize: typography.fontSize.sm,
            padding: spacing[1],
          }}
        >
          <Icons.Trash2 size={16} />
        </button>
      )}

      {/* Product Name */}
      <div style={{ marginBottom: spacing[3] }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          {t('supplierOnboarding.products.productForm.productName')}
        </label>
        <input
          type="text"
          value={product.name}
          onChange={(e) => onChange({ ...product, name: e.target.value })}
          placeholder={t('supplierOnboarding.products.productForm.productNamePlaceholder')}
          required
          autoFocus
          style={{
            width: '100%',
            padding: spacing[2],
            fontSize: typography.fontSize.base,
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.md,
            outline: 'none',
          }}
        />
      </div>

      {/* Unit and Price Row */}
      <div style={{ display: 'flex', gap: spacing[3], marginBottom: spacing[3] }}>
        {/* Unit */}
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            {t('supplierOnboarding.products.productForm.unit')}
          </label>
          <select
            value={product.unit}
            onChange={(e) => onChange({ ...product, unit: e.target.value as ProductUnit })}
            style={{
              width: '100%',
              padding: spacing[2],
              fontSize: typography.fontSize.base,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              outline: 'none',
              backgroundColor: colors.neutral[0],
            }}
          >
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {getUnitLabel(unit)}
              </option>
            ))}
          </select>
        </div>

        {/* Base Price */}
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            {t('supplierOnboarding.products.productForm.basePrice')}
          </label>
          <input
            type="number"
            value={product.base_price}
            onChange={(e) => onChange({ ...product, base_price: e.target.value })}
            placeholder={t('supplierOnboarding.products.productForm.basePricePlaceholder')}
            required
            min="0"
            step="0.01"
            style={{
              width: '100%',
              padding: spacing[2],
              fontSize: typography.fontSize.base,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Delivery Option Pills */}
      <div style={{ marginBottom: spacing[3] }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          {t('supplierOnboarding.products.productForm.deliveryOption')}
        </label>
        <div style={{ display: 'flex', gap: spacing[2] }}>
          {deliveryOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange({ ...product, delivery_option: option })}
              style={{
                flex: 1,
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor:
                  product.delivery_option === option ? colors.primary[600] : colors.neutral[0],
                border: `2px solid ${
                  product.delivery_option === option ? colors.primary[600] : colors.border.light
                }`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: product.delivery_option === option ? colors.neutral[0] : colors.text.primary,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {getDeliveryLabel(option)}
            </button>
          ))}
        </div>
      </div>

      {/* Direct Order Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing[3],
          backgroundColor: colors.neutral[50],
          borderRadius: borderRadius.md,
          marginBottom: spacing[3],
        }}
      >
        <div>
          <div
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing[0.5],
            }}
          >
            {t('supplierOnboarding.products.productForm.directOrder')}
          </div>
          <div
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
            }}
          >
            {t('supplierOnboarding.products.productForm.directOrderDescription')}
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange({ ...product, direct_order_enabled: !product.direct_order_enabled })
          }
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            backgroundColor: product.direct_order_enabled ? colors.primary[600] : colors.neutral[300],
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background-color 0.2s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: product.direct_order_enabled ? '22px' : '2px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: colors.neutral[0],
              transition: 'left 0.2s',
            }}
          />
        </button>
      </div>

      {/* Lead Time Pills */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          {t('supplierOnboarding.products.productForm.leadTime')}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[2] }}>
          {leadTimes.map((leadTime) => (
            <button
              key={leadTime}
              type="button"
              onClick={() => onChange({ ...product, lead_time: leadTime })}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor:
                  product.lead_time === leadTime ? colors.primary[600] : colors.neutral[0],
                border: `2px solid ${
                  product.lead_time === leadTime ? colors.primary[600] : colors.border.light
                }`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: product.lead_time === leadTime ? colors.neutral[0] : colors.text.primary,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {getLeadTimeLabel(leadTime)}
            </button>
          ))}
        </div>

        {/* Custom Days Input (shown when custom is selected) */}
        {product.lead_time === 'custom' && (
          <div style={{ marginTop: spacing[3] }}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[2],
              }}
            >
              {t('supplierOnboarding.products.productForm.customDays')}
            </label>
            <input
              type="number"
              value={product.custom_days || ''}
              onChange={(e) => onChange({ ...product, custom_days: parseInt(e.target.value) || undefined })}
              placeholder={t('supplierOnboarding.products.productForm.customDaysPlaceholder')}
              min="1"
              max="365"
              style={{
                width: '100%',
                padding: spacing[2],
                fontSize: typography.fontSize.base,
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
