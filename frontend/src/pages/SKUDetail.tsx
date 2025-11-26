/**
 * SKU Detail Page
 * View complete details of a single SKU/product from the catalog
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SKUDetail {
  id: string;
  supplier_id: string;
  supplier_name_ka: string;
  supplier_name_en: string;
  supplier_phone?: string;
  supplier_email?: string;
  supplier_address?: string;
  name_ka: string;
  name_en: string;
  spec_string_ka?: string;
  spec_string_en?: string;
  category_ka: string;
  category_en: string;
  description_ka?: string;
  description_en?: string;
  base_price?: number;
  unit_ka: string;
  unit_en: string;
  direct_order_available: boolean;
  lead_time_category?: string;
  pickup_available: boolean;
  delivery_available: boolean;
  updated_at: string;
  thumbnail_url?: string;
}

export const SKUDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { i18n } = useTranslation();
  const [sku, setSKU] = useState<SKUDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const isGeorgian = i18n.language === 'ka';

  useEffect(() => {
    if (id) {
      fetchSKU(id);
    }
  }, [id]);

  const fetchSKU = async (skuId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/catalog/skus/${skuId}`);

      if (response.ok) {
        const data = await response.json();
        setSKU(data.data);
      } else {
        alert('Product not found');
        navigate('/catalog');
      }
    } catch (error) {
      console.error('Failed to fetch SKU:', error);
      alert('Failed to load product');
      navigate('/catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToRFQ = () => {
    navigate(`/rfqs/create?sku_id=${id}`);
  };

  const handleDirectOrder = () => {
    navigate(`/orders/direct?supplier_id=${sku?.supplier_id}&sku_id=${id}`);
  };

  const getCategoryIcon = () => {
    if (!sku) return null;
    const category = isGeorgian ? sku.category_ka : sku.category_en;
    const iconMap: Record<string, any> = {
      concrete: Icons.Box,
      ბეტონი: Icons.Box,
      blocks: Icons.Grid3x3,
      აგური: Icons.Grid3x3,
      rebar: Icons.GitBranch,
      steel: Icons.Ruler,
      ფოლადი: Icons.Ruler,
      aggregates: Icons.Mountain,
      metal: Icons.Ruler,
    };
    const IconComponent = iconMap[category.toLowerCase()] || Icons.Package;
    return <IconComponent size={24} color={colors.primary[600]} />;
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.neutral[50],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icons.Loader
          size={48}
          color={colors.text.tertiary}
          style={{ animation: 'spin 1s linear infinite' }}
        />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!sku) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.neutral[50] }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderBottom: `1px solid ${colors.border.light}`,
          padding: `${spacing[4]} ${spacing[6]}`,
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/catalog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[3]}`,
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              cursor: 'pointer',
              marginBottom: spacing[4],
            }}
          >
            <Icons.ArrowLeft size={16} />
            Back to Catalog
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
            {getCategoryIcon()}
            <div>
              <h1
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[1],
                }}
              >
                {(isGeorgian ? sku.spec_string_ka : sku.spec_string_en) ? (
                  <>
                    <strong>{isGeorgian ? sku.spec_string_ka : sku.spec_string_en}</strong>{' '}
                    {isGeorgian ? sku.name_ka : sku.name_en}
                  </>
                ) : (
                  isGeorgian ? sku.name_ka : sku.name_en
                )}
              </h1>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  margin: 0,
                  textTransform: 'capitalize',
                }}
              >
                {isGeorgian ? sku.category_ka : sku.category_en}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: spacing[6],
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: spacing[6],
        }}
      >
        {/* Left Column - Product Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
          {/* Product Image */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '400px',
                backgroundColor: colors.neutral[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {sku.thumbnail_url ? (
                <img
                  src={sku.thumbnail_url}
                  alt={isGeorgian ? sku.name_ka : sku.name_en}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Icons.Package size={96} color={colors.neutral[400]} />
              )}
            </div>
          </div>

          {/* Description */}
          {(isGeorgian ? sku.description_ka : sku.description_en) && (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.border.light}`,
                padding: spacing[4],
              }}
            >
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[3],
                }}
              >
                Description
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {isGeorgian ? sku.description_ka : sku.description_en}
              </p>
            </div>
          )}

          {/* Supplier Info */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              padding: spacing[4],
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[3],
              }}
            >
              Supplier Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <Icons.Building2 size={20} color={colors.primary[600]} />
                <span
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  {isGeorgian ? sku.supplier_name_ka : sku.supplier_name_en}
                </span>
              </div>
              {sku.supplier_address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[2] }}>
                  <Icons.MapPin size={20} color={colors.text.tertiary} style={{ marginTop: '2px' }} />
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    {sku.supplier_address}
                  </span>
                </div>
              )}
              {sku.supplier_phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Icons.Phone size={20} color={colors.text.tertiary} />
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    {sku.supplier_phone}
                  </span>
                </div>
              )}
              {sku.supplier_email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Icons.Mail size={20} color={colors.text.tertiary} />
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    {sku.supplier_email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Purchase Info */}
        <div>
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              padding: spacing[4],
              position: 'sticky',
              top: spacing[6],
            }}
          >
            {/* Price */}
            {sku.base_price && (
              <div style={{ marginBottom: spacing[4] }}>
                <p
                  style={{
                    fontSize: typography.fontSize['3xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.primary[600],
                    margin: 0,
                  }}
                >
                  {Number(sku.base_price).toLocaleString()} ₾
                  <span
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.normal,
                      color: colors.text.secondary,
                    }}
                  >
                    {' '}
                    / {isGeorgian ? sku.unit_ka : sku.unit_en}
                  </span>
                </p>
              </div>
            )}

            {/* Features */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing[3],
                marginBottom: spacing[4],
                paddingBottom: spacing[4],
                borderBottom: `1px solid ${colors.border.light}`,
              }}
            >
              {sku.direct_order_available && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Icons.Zap size={20} color={colors.warning[600]} />
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    Direct Order Available
                  </span>
                </div>
              )}

              {sku.lead_time_category && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Icons.Clock size={20} color={colors.info[600]} />
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    {sku.lead_time_category === 'same_day'
                      ? 'Same-day delivery'
                      : sku.lead_time_category === 'next_day'
                      ? 'Next-day delivery'
                      : 'Negotiable lead time'}
                  </span>
                </div>
              )}

              {sku.pickup_available && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Icons.MapPin size={20} color={colors.success[600]} />
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    Pickup available
                  </span>
                </div>
              )}

              {sku.delivery_available && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Icons.Truck size={20} color={colors.success[600]} />
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    Delivery available
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              <button
                onClick={handleAddToRFQ}
                style={{
                  width: '100%',
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: colors.neutral[0],
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[0];
                }}
              >
                Add to RFQ
              </button>

              {sku.direct_order_available && (
                <button
                  onClick={handleDirectOrder}
                  style={{
                    width: '100%',
                    padding: `${spacing[3]} ${spacing[4]}`,
                    backgroundColor: colors.primary[600],
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.neutral[0],
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing[2],
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary[700];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary[600];
                  }}
                >
                  <Icons.Zap size={20} />
                  Direct Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
