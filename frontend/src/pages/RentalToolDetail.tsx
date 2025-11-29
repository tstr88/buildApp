/**
 * Rental Tool Detail Page
 * View complete details of a single rental tool
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../theme/tokens';
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
        alert('Tool not found');
        navigate('/rentals');
      }
    } catch (error) {
      console.error('Failed to fetch tool:', error);
      alert('Failed to load tool');
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
            onClick={() => navigate('/rentals')}
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
            Back to Tool Rentals
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
            <Icons.Wrench size={24} color={colors.primary[600]} />
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
                {tool.tool_name}
              </h1>
              {tool.spec_string && (
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary,
                    margin: 0,
                  }}
                >
                  {tool.spec_string}
                </p>
              )}
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
        {/* Left Column - Tool Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
          {/* Tool Image */}
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
                position: 'relative',
              }}
            >
              {tool.photo_url ? (
                <img
                  src={tool.photo_url}
                  alt={tool.tool_name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Icons.Wrench size={96} color={colors.neutral[400]} />
              )}

              {tool.direct_booking_available && (
                <div
                  style={{
                    position: 'absolute',
                    top: spacing[2],
                    right: spacing[2],
                    backgroundColor: colors.primary[600],
                    color: colors.neutral[0],
                    padding: `${spacing[1]} ${spacing[2]}`,
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                  }}
                >
                  <Icons.Zap size={12} />
                  Direct Booking
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {tool.description && (
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
                {tool.description}
              </p>
            </div>
          )}

          {/* Tool Specifications */}
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
              Specifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {tool.category && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Category
                  </span>
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.primary,
                      fontWeight: typography.fontWeight.medium,
                      textTransform: 'capitalize',
                    }}
                  >
                    {tool.category}
                  </span>
                </div>
              )}

              {tool.brand && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Brand
                  </span>
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.primary,
                      fontWeight: typography.fontWeight.medium,
                    }}
                  >
                    {tool.brand}
                  </span>
                </div>
              )}

              {tool.condition && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Condition
                  </span>
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.primary,
                      fontWeight: typography.fontWeight.medium,
                    }}
                  >
                    {tool.condition}
                  </span>
                </div>
              )}

              {tool.year && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Year
                  </span>
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.primary,
                      fontWeight: typography.fontWeight.medium,
                    }}
                  >
                    {tool.year}
                  </span>
                </div>
              )}
            </div>
          </div>

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
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Icons.Building2 size={20} color={colors.primary[600]} />
              <span
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                {tool.supplier_name}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Rental Info */}
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
            {/* Rental Rates */}
            <div style={{ marginBottom: spacing[4] }}>
              {tool.daily_rate && (
                <div style={{ marginBottom: spacing[2] }}>
                  <p
                    style={{
                      fontSize: typography.fontSize['2xl'],
                      fontWeight: typography.fontWeight.bold,
                      color: colors.primary[600],
                      margin: 0,
                    }}
                  >
                    {tool.daily_rate.toLocaleString()} ₾
                    <span
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.normal,
                        color: colors.text.secondary,
                      }}
                    >
                      {' '}
                      / day
                    </span>
                  </p>
                </div>
              )}

              {tool.weekly_rate && (
                <p
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                  }}
                >
                  {tool.weekly_rate.toLocaleString()} ₾
                  <span
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.normal,
                      color: colors.text.secondary,
                    }}
                  >
                    {' '}
                    / week
                  </span>
                </p>
              )}

              {tool.deposit_amount && (
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    margin: 0,
                    marginTop: spacing[2],
                  }}
                >
                  {tool.deposit_amount.toLocaleString()} ₾ deposit required
                </p>
              )}
            </div>

            {/* Availability */}
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
              {tool.pickup_available && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Icons.MapPin size={20} color={colors.success[600]} />
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    Pickup available
                  </span>
                </div>
              )}

              {tool.delivery_available && (
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
                onClick={handleRequestQuote}
                style={{
                  width: '100%',
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: colors.neutral[0],
                  border: `1px solid ${colors.primary[600]}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.primary[600],
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[0];
                }}
              >
                Request Quote
              </button>

              {tool.direct_booking_available && (
                <button
                  onClick={handleBookNow}
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
                  <Icons.Calendar size={20} />
                  Book Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
