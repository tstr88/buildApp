/**
 * Rental Tool Detail Page
 * View complete details of a single rental tool
 * Mobile-first responsive design
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, heights } from '../theme/tokens';
import { API_BASE_URL } from '../services/api/client';

interface RentalToolDetail {
  id: string;
  tool_name: string;
  spec_string?: string;
  photo_url?: string;
  supplier_id: string;
  supplier_name: string;
  daily_rate?: number;
  weekly_rate?: number;
  deposit_amount?: number;
  delivery_available: boolean;
  pickup_available: boolean;
  direct_booking_available: boolean;
  category?: string;
  description?: string;
  condition?: string;
  year?: number;
  brand?: string;
}

export const RentalToolDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [tool, setTool] = useState<RentalToolDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTool(id);
    }
  }, [id]);

  const fetchTool = async (toolId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rentals/tools/${toolId}`);

      if (response.ok) {
        const data = await response.json();
        setTool(data.data);
      } else {
        navigate('/rentals');
      }
    } catch (error) {
      console.error('Failed to fetch tool:', error);
      navigate('/rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = () => {
    navigate('/rentals/rfq', { state: { preselectedTools: [id] } });
  };

  const handleBookNow = () => {
    navigate(`/rentals/book/${id}`);
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

  if (!tool) {
    return null;
  }

  return (
    <>
      <style>{`
        .rental-detail-page {
          min-height: 100vh;
          background-color: ${colors.neutral[50]};
          padding-bottom: calc(${heights.bottomNav} + env(safe-area-inset-bottom, 0px) + 100px);
        }

        .rental-header {
          background-color: ${colors.neutral[0]};
          border-bottom: 1px solid ${colors.border.light};
          padding: ${spacing[4]};
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .rental-header-content {
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

        .rental-title-row {
          display: flex;
          align-items: flex-start;
          gap: ${spacing[3]};
        }

        .rental-icon-wrapper {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${colors.primary[50]};
          border-radius: ${borderRadius.lg};
          flex-shrink: 0;
        }

        .rental-title {
          font-size: ${typography.fontSize.lg};
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.text.primary};
          margin: 0;
          margin-bottom: ${spacing[1]};
          line-height: 1.3;
        }

        @media (min-width: 640px) {
          .rental-title {
            font-size: ${typography.fontSize.xl};
          }
        }

        .rental-spec {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.secondary};
          margin: 0;
        }

        .rental-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: ${spacing[4]};
        }

        @media (min-width: 1024px) {
          .rental-content {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: ${spacing[6]};
            padding: ${spacing[6]};
          }
        }

        .rental-main {
          display: flex;
          flex-direction: column;
          gap: ${spacing[4]};
        }

        .rental-image-container {
          background-color: ${colors.neutral[0]};
          border-radius: ${borderRadius.xl};
          border: 1px solid ${colors.border.light};
          overflow: hidden;
          position: relative;
        }

        .rental-image {
          width: 100%;
          aspect-ratio: 4 / 3;
          background-color: ${colors.neutral[100]};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 1024px) {
          .rental-image {
            aspect-ratio: 16 / 10;
          }
        }

        .rental-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .direct-badge {
          position: absolute;
          top: ${spacing[3]};
          right: ${spacing[3]};
          background-color: ${colors.primary[600]};
          color: ${colors.neutral[0]};
          padding: ${spacing[1.5]} ${spacing[3]};
          border-radius: ${borderRadius.full};
          font-size: ${typography.fontSize.xs};
          font-weight: ${typography.fontWeight.semibold};
          display: flex;
          align-items: center;
          gap: ${spacing[1]};
        }

        .rental-card {
          background-color: ${colors.neutral[0]};
          border-radius: ${borderRadius.xl};
          border: 1px solid ${colors.border.light};
          padding: ${spacing[4]};
        }

        .rental-card-title {
          font-size: ${typography.fontSize.base};
          font-weight: ${typography.fontWeight.semibold};
          color: ${colors.text.primary};
          margin: 0;
          margin-bottom: ${spacing[3]};
        }

        .rental-card-text {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.secondary};
          margin: 0;
          line-height: 1.6;
        }

        .spec-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${spacing[2]} 0;
        }

        .spec-row:not(:last-child) {
          border-bottom: 1px solid ${colors.border.light};
        }

        .spec-label {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.secondary};
        }

        .spec-value {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.primary};
          font-weight: ${typography.fontWeight.medium};
        }

        .supplier-info-item {
          display: flex;
          align-items: center;
          gap: ${spacing[3]};
          padding: ${spacing[2]} 0;
        }

        .supplier-info-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${colors.primary[50]};
          border-radius: ${borderRadius.lg};
          flex-shrink: 0;
        }

        .supplier-info-text {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.primary};
          font-weight: ${typography.fontWeight.medium};
        }

        .rental-sidebar {
          margin-top: ${spacing[4]};
        }

        @media (min-width: 1024px) {
          .rental-sidebar {
            margin-top: 0;
          }
        }

        .rental-purchase-card {
          background-color: ${colors.neutral[0]};
          border-radius: ${borderRadius.xl};
          border: 1px solid ${colors.border.light};
          padding: ${spacing[4]};
          position: sticky;
          top: 80px;
        }

        .rental-price-primary {
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.primary[600]};
          margin: 0;
          margin-bottom: ${spacing[2]};
        }

        .rental-price-unit {
          font-size: ${typography.fontSize.base};
          font-weight: ${typography.fontWeight.normal};
          color: ${colors.text.secondary};
        }

        .rental-price-secondary {
          font-size: ${typography.fontSize.lg};
          font-weight: ${typography.fontWeight.semibold};
          color: ${colors.text.primary};
          margin: 0;
        }

        .rental-deposit {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.secondary};
          margin: 0;
          margin-top: ${spacing[2]};
        }

        .rental-features {
          display: flex;
          flex-direction: column;
          gap: ${spacing[2]};
          padding: ${spacing[4]} 0;
          margin-bottom: ${spacing[4]};
          border-bottom: 1px solid ${colors.border.light};
        }

        .rental-feature {
          display: flex;
          align-items: center;
          gap: ${spacing[3]};
          padding: ${spacing[2]} ${spacing[3]};
          background-color: ${colors.neutral[50]};
          border-radius: ${borderRadius.lg};
        }

        .rental-feature-text {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.primary};
          margin: 0;
        }

        .rental-actions {
          display: flex;
          flex-direction: column;
          gap: ${spacing[3]};
        }

        .rental-action-btn {
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

        .rental-action-btn-primary {
          background-color: ${colors.primary[600]};
          border: none;
          color: ${colors.neutral[0]};
        }

        .rental-action-btn-primary:active {
          background-color: ${colors.primary[700]};
        }

        .rental-action-btn-secondary {
          background-color: ${colors.neutral[0]};
          border: 1px solid ${colors.primary[600]};
          color: ${colors.primary[600]};
        }

        .rental-action-btn-secondary:active {
          background-color: ${colors.primary[50]};
        }

        /* Mobile fixed bottom CTA */
        .rental-mobile-cta {
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
          .rental-mobile-cta {
            display: none;
          }
        }

        .rental-mobile-cta-content {
          display: flex;
          align-items: center;
          gap: ${spacing[3]};
        }

        .rental-mobile-cta-price {
          flex: 1;
        }

        .rental-mobile-cta-price-value {
          font-size: ${typography.fontSize.lg};
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.primary[600]};
          margin: 0;
        }

        .rental-mobile-cta-price-unit {
          font-size: ${typography.fontSize.xs};
          color: ${colors.text.secondary};
          margin: 0;
        }

        .rental-mobile-cta-buttons {
          display: flex;
          gap: ${spacing[2]};
        }

        .rental-mobile-cta-btn {
          padding: ${spacing[3]} ${spacing[4]};
          border-radius: ${borderRadius.lg};
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.semibold};
          cursor: pointer;
          white-space: nowrap;
        }

        .rental-mobile-cta-btn-primary {
          background-color: ${colors.primary[600]};
          border: none;
          color: ${colors.neutral[0]};
        }

        .rental-mobile-cta-btn-secondary {
          background-color: ${colors.neutral[100]};
          border: none;
          color: ${colors.text.primary};
        }

        /* Hide sidebar purchase card on mobile */
        @media (max-width: 1023px) {
          .rental-purchase-card {
            display: none;
          }
        }
      `}</style>

      <div className="rental-detail-page">
        {/* Header */}
        <div className="rental-header">
          <div className="rental-header-content">
            <button className="back-button" onClick={() => navigate('/rentals')}>
              <Icons.ArrowLeft size={18} />
              {t('common.back', 'Back')}
            </button>

            <div className="rental-title-row">
              <div className="rental-icon-wrapper">
                <Icons.Wrench size={20} color={colors.primary[600]} />
              </div>
              <div>
                <h1 className="rental-title">{tool.tool_name}</h1>
                {tool.spec_string && <p className="rental-spec">{tool.spec_string}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="rental-content">
          {/* Left Column - Tool Details */}
          <div className="rental-main">
            {/* Tool Image */}
            <div className="rental-image-container">
              <div className="rental-image">
                {tool.photo_url ? (
                  <img src={tool.photo_url} alt={tool.tool_name} />
                ) : (
                  <Icons.Wrench size={64} color={colors.neutral[300]} />
                )}
              </div>
              {tool.direct_booking_available && (
                <div className="direct-badge">
                  <Icons.Zap size={12} />
                  {t('rentalDetail.directBooking', 'Direct Booking')}
                </div>
              )}
            </div>

            {/* Description */}
            {tool.description && (
              <div className="rental-card">
                <h3 className="rental-card-title">{t('rentalDetail.description', 'Description')}</h3>
                <p className="rental-card-text">{tool.description}</p>
              </div>
            )}

            {/* Tool Specifications */}
            <div className="rental-card">
              <h3 className="rental-card-title">{t('rentalDetail.specifications', 'Specifications')}</h3>
              <div>
                {tool.category && (
                  <div className="spec-row">
                    <span className="spec-label">{t('rentalDetail.category', 'Category')}</span>
                    <span className="spec-value" style={{ textTransform: 'capitalize' }}>
                      {tool.category}
                    </span>
                  </div>
                )}
                {tool.brand && (
                  <div className="spec-row">
                    <span className="spec-label">{t('rentalDetail.brand', 'Brand')}</span>
                    <span className="spec-value">{tool.brand}</span>
                  </div>
                )}
                {tool.condition && (
                  <div className="spec-row">
                    <span className="spec-label">{t('rentalDetail.condition', 'Condition')}</span>
                    <span className="spec-value">{tool.condition}</span>
                  </div>
                )}
                {tool.year && (
                  <div className="spec-row">
                    <span className="spec-label">{t('rentalDetail.year', 'Year')}</span>
                    <span className="spec-value">{tool.year}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Supplier Info */}
            <div className="rental-card">
              <h3 className="rental-card-title">{t('rentalDetail.supplierInfo', 'Supplier Information')}</h3>
              <div className="supplier-info-item">
                <div className="supplier-info-icon">
                  <Icons.Building2 size={18} color={colors.primary[600]} />
                </div>
                <span className="supplier-info-text">{tool.supplier_name}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Rental Info (Desktop only) */}
          <div className="rental-sidebar">
            <div className="rental-purchase-card">
              {/* Rental Rates */}
              <div style={{ marginBottom: spacing[4] }}>
                {tool.daily_rate && (
                  <p className="rental-price-primary">
                    {tool.daily_rate.toLocaleString()} ₾
                    <span className="rental-price-unit"> / {t('rentalDetail.day', 'day')}</span>
                  </p>
                )}
                {tool.weekly_rate && (
                  <p className="rental-price-secondary">
                    {tool.weekly_rate.toLocaleString()} ₾
                    <span className="rental-price-unit"> / {t('rentalDetail.week', 'week')}</span>
                  </p>
                )}
                {tool.deposit_amount && (
                  <p className="rental-deposit">
                    {tool.deposit_amount.toLocaleString()} ₾ {t('rentalDetail.depositRequired', 'deposit required')}
                  </p>
                )}
              </div>

              {/* Availability Features */}
              <div className="rental-features">
                {tool.pickup_available && (
                  <div className="rental-feature">
                    <Icons.MapPin size={18} color={colors.success[600]} />
                    <p className="rental-feature-text">{t('rentalDetail.pickup', 'Pickup available')}</p>
                  </div>
                )}
                {tool.delivery_available && (
                  <div className="rental-feature">
                    <Icons.Truck size={18} color={colors.success[600]} />
                    <p className="rental-feature-text">{t('rentalDetail.delivery', 'Delivery available')}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="rental-actions">
                <button className="rental-action-btn rental-action-btn-secondary" onClick={handleRequestQuote}>
                  {t('rentalDetail.requestQuote', 'Request Quote')}
                </button>
                {tool.direct_booking_available && (
                  <button className="rental-action-btn rental-action-btn-primary" onClick={handleBookNow}>
                    <Icons.Calendar size={18} />
                    {t('rentalDetail.bookNow', 'Book Now')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom CTA */}
        <div className="rental-mobile-cta">
          <div className="rental-mobile-cta-content">
            <div className="rental-mobile-cta-price">
              {tool.daily_rate ? (
                <>
                  <p className="rental-mobile-cta-price-value">{tool.daily_rate.toLocaleString()} ₾</p>
                  <p className="rental-mobile-cta-price-unit">/ {t('rentalDetail.day', 'day')}</p>
                </>
              ) : (
                <p className="rental-mobile-cta-price-value">{t('rentalDetail.getQuote', 'Get Quote')}</p>
              )}
            </div>
            <div className="rental-mobile-cta-buttons">
              <button className="rental-mobile-cta-btn rental-mobile-cta-btn-secondary" onClick={handleRequestQuote}>
                {t('rentalDetail.quote', 'Quote')}
              </button>
              {tool.direct_booking_available && (
                <button className="rental-mobile-cta-btn rental-mobile-cta-btn-primary" onClick={handleBookNow}>
                  {t('rentalDetail.book', 'Book')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
