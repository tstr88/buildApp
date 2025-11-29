/**
 * SKU Detail Page
 * View complete details of a single SKU/product from the catalog
 * Mobile-first responsive design
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, heights } from '../theme/tokens';

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
  const { t, i18n } = useTranslation();
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
        navigate('/catalog');
      }
    } catch (error) {
      console.error('Failed to fetch SKU:', error);
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
    return <IconComponent size={20} color={colors.primary[600]} />;
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

  const productName = isGeorgian ? sku.name_ka : sku.name_en;
  const specString = isGeorgian ? sku.spec_string_ka : sku.spec_string_en;
  const category = isGeorgian ? sku.category_ka : sku.category_en;
  const description = isGeorgian ? sku.description_ka : sku.description_en;
  const supplierName = isGeorgian ? sku.supplier_name_ka : sku.supplier_name_en;
  const unit = isGeorgian ? sku.unit_ka : sku.unit_en;

  return (
    <>
      <style>{`
        .sku-detail-page {
          min-height: 100vh;
          background-color: ${colors.neutral[50]};
          padding-bottom: calc(${heights.bottomNav} + env(safe-area-inset-bottom, 0px) + 100px);
        }

        .sku-header {
          background-color: ${colors.neutral[0]};
          border-bottom: 1px solid ${colors.border.light};
          padding: ${spacing[4]};
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .sku-header-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: ${spacing[2]};
          padding: ${spacing[2]} ${spacing[3]};
          background-color: ${colors.neutral[50]};
          border: none;
          border-radius: ${borderRadius.lg};
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.medium};
          color: ${colors.text.secondary};
          cursor: pointer;
          margin-bottom: ${spacing[3]};
          transition: all 150ms ease;
        }

        .back-button:active {
          background-color: ${colors.neutral[100]};
        }

        .sku-title-row {
          display: flex;
          align-items: flex-start;
          gap: ${spacing[3]};
        }

        .sku-icon-wrapper {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${colors.primary[50]};
          border-radius: ${borderRadius.lg};
          flex-shrink: 0;
        }

        .sku-title {
          font-size: ${typography.fontSize.lg};
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.text.primary};
          margin: 0;
          margin-bottom: ${spacing[1]};
          line-height: 1.3;
        }

        @media (min-width: 640px) {
          .sku-title {
            font-size: ${typography.fontSize.xl};
          }
        }

        .sku-category {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.secondary};
          margin: 0;
          text-transform: capitalize;
        }

        .sku-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: ${spacing[4]};
        }

        @media (min-width: 1024px) {
          .sku-content {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: ${spacing[6]};
            padding: ${spacing[6]};
          }
        }

        .sku-main {
          display: flex;
          flex-direction: column;
          gap: ${spacing[4]};
        }

        .sku-image-container {
          background-color: ${colors.neutral[0]};
          border-radius: ${borderRadius.xl};
          border: 1px solid ${colors.border.light};
          overflow: hidden;
        }

        .sku-image {
          width: 100%;
          aspect-ratio: 4 / 3;
          background-color: ${colors.neutral[100]};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 1024px) {
          .sku-image {
            aspect-ratio: 16 / 10;
          }
        }

        .sku-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sku-card {
          background-color: ${colors.neutral[0]};
          border-radius: ${borderRadius.xl};
          border: 1px solid ${colors.border.light};
          padding: ${spacing[4]};
        }

        .sku-card-title {
          font-size: ${typography.fontSize.base};
          font-weight: ${typography.fontWeight.semibold};
          color: ${colors.text.primary};
          margin: 0;
          margin-bottom: ${spacing[3]};
        }

        .sku-card-text {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.secondary};
          margin: 0;
          line-height: 1.6;
        }

        .supplier-info-item {
          display: flex;
          align-items: flex-start;
          gap: ${spacing[3]};
          padding: ${spacing[2]} 0;
        }

        .supplier-info-item:not(:last-child) {
          border-bottom: 1px solid ${colors.border.light};
        }

        .supplier-info-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${colors.neutral[50]};
          border-radius: ${borderRadius.lg};
          flex-shrink: 0;
        }

        .supplier-info-text {
          flex: 1;
          min-width: 0;
        }

        .supplier-info-label {
          font-size: ${typography.fontSize.xs};
          color: ${colors.text.tertiary};
          margin: 0;
          margin-bottom: 2px;
        }

        .supplier-info-value {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.primary};
          margin: 0;
          word-break: break-word;
        }

        .sku-sidebar {
          margin-top: ${spacing[4]};
        }

        @media (min-width: 1024px) {
          .sku-sidebar {
            margin-top: 0;
          }
        }

        .sku-purchase-card {
          background-color: ${colors.neutral[0]};
          border-radius: ${borderRadius.xl};
          border: 1px solid ${colors.border.light};
          padding: ${spacing[4]};
          position: sticky;
          top: 80px;
        }

        .sku-price {
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.primary[600]};
          margin: 0;
          margin-bottom: ${spacing[4]};
        }

        .sku-price-unit {
          font-size: ${typography.fontSize.base};
          font-weight: ${typography.fontWeight.normal};
          color: ${colors.text.secondary};
        }

        .sku-features {
          display: flex;
          flex-direction: column;
          gap: ${spacing[2]};
          padding-bottom: ${spacing[4]};
          margin-bottom: ${spacing[4]};
          border-bottom: 1px solid ${colors.border.light};
        }

        .sku-feature {
          display: flex;
          align-items: center;
          gap: ${spacing[3]};
          padding: ${spacing[2]} ${spacing[3]};
          background-color: ${colors.neutral[50]};
          border-radius: ${borderRadius.lg};
        }

        .sku-feature-text {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.primary};
          margin: 0;
        }

        .sku-actions {
          display: flex;
          flex-direction: column;
          gap: ${spacing[3]};
        }

        .sku-action-btn {
          width: 100%;
          padding: ${spacing[3]} ${spacing[4]};
          border-radius: ${borderRadius.lg};
          font-size: ${typography.fontSize.base};
          font-weight: ${typography.fontWeight.semibold};
          cursor: pointer;
          transition: all 150ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${spacing[2]};
        }

        .sku-action-btn-primary {
          background-color: ${colors.primary[600]};
          border: none;
          color: ${colors.neutral[0]};
        }

        .sku-action-btn-primary:active {
          background-color: ${colors.primary[700]};
        }

        .sku-action-btn-secondary {
          background-color: ${colors.neutral[0]};
          border: 1px solid ${colors.border.light};
          color: ${colors.text.primary};
        }

        .sku-action-btn-secondary:active {
          background-color: ${colors.neutral[50]};
        }

        /* Mobile fixed bottom CTA */
        .sku-mobile-cta {
          display: block;
          position: fixed;
          bottom: calc(${heights.bottomNav} + env(safe-area-inset-bottom, 0px));
          left: 0;
          right: 0;
          background-color: ${colors.neutral[0]};
          border-top: 1px solid ${colors.border.light};
          padding: ${spacing[3]} ${spacing[4]};
          z-index: 100;
          box-shadow: ${shadows.lg};
        }

        @media (min-width: 1024px) {
          .sku-mobile-cta {
            display: none;
          }
        }

        .sku-mobile-cta-content {
          display: flex;
          align-items: center;
          gap: ${spacing[3]};
        }

        .sku-mobile-cta-price {
          flex: 1;
        }

        .sku-mobile-cta-price-value {
          font-size: ${typography.fontSize.lg};
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.primary[600]};
          margin: 0;
        }

        .sku-mobile-cta-price-unit {
          font-size: ${typography.fontSize.xs};
          color: ${colors.text.secondary};
          margin: 0;
        }

        .sku-mobile-cta-buttons {
          display: flex;
          gap: ${spacing[2]};
        }

        .sku-mobile-cta-btn {
          padding: ${spacing[3]} ${spacing[4]};
          border-radius: ${borderRadius.lg};
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.semibold};
          cursor: pointer;
          white-space: nowrap;
        }

        .sku-mobile-cta-btn-primary {
          background-color: ${colors.primary[600]};
          border: none;
          color: ${colors.neutral[0]};
        }

        .sku-mobile-cta-btn-secondary {
          background-color: ${colors.neutral[100]};
          border: none;
          color: ${colors.text.primary};
        }

        /* Hide sidebar purchase card on mobile */
        @media (max-width: 1023px) {
          .sku-purchase-card {
            display: none;
          }
        }
      `}</style>

      <div className="sku-detail-page">
        {/* Header */}
        <div className="sku-header">
          <div className="sku-header-content">
            <button className="back-button" onClick={() => navigate('/catalog')}>
              <Icons.ArrowLeft size={18} />
              {t('common.back', 'Back')}
            </button>

            <div className="sku-title-row">
              <div className="sku-icon-wrapper">{getCategoryIcon()}</div>
              <div>
                <h1 className="sku-title">
                  {specString ? (
                    <>
                      <strong>{specString}</strong> {productName}
                    </>
                  ) : (
                    productName
                  )}
                </h1>
                <p className="sku-category">{category}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="sku-content">
          {/* Left Column - Product Details */}
          <div className="sku-main">
            {/* Product Image */}
            <div className="sku-image-container">
              <div className="sku-image">
                {sku.thumbnail_url ? (
                  <img src={sku.thumbnail_url} alt={productName} />
                ) : (
                  <Icons.Package size={64} color={colors.neutral[300]} />
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="sku-card">
                <h3 className="sku-card-title">{t('skuDetail.description', 'Description')}</h3>
                <p className="sku-card-text">{description}</p>
              </div>
            )}

            {/* Supplier Info */}
            <div className="sku-card">
              <h3 className="sku-card-title">{t('skuDetail.supplierInfo', 'Supplier Information')}</h3>
              <div>
                <div className="supplier-info-item">
                  <div className="supplier-info-icon">
                    <Icons.Building2 size={18} color={colors.primary[600]} />
                  </div>
                  <div className="supplier-info-text">
                    <p className="supplier-info-label">{t('skuDetail.supplier', 'Supplier')}</p>
                    <p className="supplier-info-value">{supplierName}</p>
                  </div>
                </div>

                {sku.supplier_address && (
                  <div className="supplier-info-item">
                    <div className="supplier-info-icon">
                      <Icons.MapPin size={18} color={colors.text.tertiary} />
                    </div>
                    <div className="supplier-info-text">
                      <p className="supplier-info-label">{t('skuDetail.address', 'Address')}</p>
                      <p className="supplier-info-value">{sku.supplier_address}</p>
                    </div>
                  </div>
                )}

                {sku.supplier_phone && (
                  <div className="supplier-info-item">
                    <div className="supplier-info-icon">
                      <Icons.Phone size={18} color={colors.text.tertiary} />
                    </div>
                    <div className="supplier-info-text">
                      <p className="supplier-info-label">{t('skuDetail.phone', 'Phone')}</p>
                      <p className="supplier-info-value">{sku.supplier_phone}</p>
                    </div>
                  </div>
                )}

                {sku.supplier_email && (
                  <div className="supplier-info-item">
                    <div className="supplier-info-icon">
                      <Icons.Mail size={18} color={colors.text.tertiary} />
                    </div>
                    <div className="supplier-info-text">
                      <p className="supplier-info-label">{t('skuDetail.email', 'Email')}</p>
                      <p className="supplier-info-value">{sku.supplier_email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Info (Desktop only) */}
          <div className="sku-sidebar">
            <div className="sku-purchase-card">
              {/* Price */}
              {sku.base_price && (
                <p className="sku-price">
                  {Number(sku.base_price).toLocaleString()} ₾
                  <span className="sku-price-unit"> / {unit}</span>
                </p>
              )}

              {/* Features */}
              <div className="sku-features">
                {sku.direct_order_available && (
                  <div className="sku-feature">
                    <Icons.Zap size={18} color={colors.warning[600]} />
                    <p className="sku-feature-text">{t('skuDetail.directOrder', 'Direct Order Available')}</p>
                  </div>
                )}

                {sku.lead_time_category && (
                  <div className="sku-feature">
                    <Icons.Clock size={18} color={colors.info[600]} />
                    <p className="sku-feature-text">
                      {sku.lead_time_category === 'same_day'
                        ? t('skuDetail.sameDay', 'Same-day delivery')
                        : sku.lead_time_category === 'next_day'
                        ? t('skuDetail.nextDay', 'Next-day delivery')
                        : t('skuDetail.negotiable', 'Negotiable lead time')}
                    </p>
                  </div>
                )}

                {sku.pickup_available && (
                  <div className="sku-feature">
                    <Icons.MapPin size={18} color={colors.success[600]} />
                    <p className="sku-feature-text">{t('skuDetail.pickup', 'Pickup available')}</p>
                  </div>
                )}

                {sku.delivery_available && (
                  <div className="sku-feature">
                    <Icons.Truck size={18} color={colors.success[600]} />
                    <p className="sku-feature-text">{t('skuDetail.delivery', 'Delivery available')}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="sku-actions">
                <button className="sku-action-btn sku-action-btn-secondary" onClick={handleAddToRFQ}>
                  {t('skuDetail.addToRFQ', 'Add to RFQ')}
                </button>

                {sku.direct_order_available && (
                  <button className="sku-action-btn sku-action-btn-primary" onClick={handleDirectOrder}>
                    <Icons.Zap size={18} />
                    {t('skuDetail.directOrderBtn', 'Direct Order')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom CTA */}
        <div className="sku-mobile-cta">
          <div className="sku-mobile-cta-content">
            <div className="sku-mobile-cta-price">
              {sku.base_price ? (
                <>
                  <p className="sku-mobile-cta-price-value">{Number(sku.base_price).toLocaleString()} ₾</p>
                  <p className="sku-mobile-cta-price-unit">/ {unit}</p>
                </>
              ) : (
                <p className="sku-mobile-cta-price-value">{t('skuDetail.requestQuote', 'Request Quote')}</p>
              )}
            </div>
            <div className="sku-mobile-cta-buttons">
              <button className="sku-mobile-cta-btn sku-mobile-cta-btn-secondary" onClick={handleAddToRFQ}>
                {t('skuDetail.rfq', 'RFQ')}
              </button>
              {sku.direct_order_available && (
                <button className="sku-mobile-cta-btn sku-mobile-cta-btn-primary" onClick={handleDirectOrder}>
                  {t('skuDetail.order', 'Order')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
