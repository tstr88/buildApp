/**
 * My Rentals Page
 * List and manage all buyer's rental bookings
 * Professional modern design matching RFQs inbox style
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, heights } from '../theme/tokens';
import { API_BASE_URL } from '../services/api/client';

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

interface RentalBooking {
  id: string;
  booking_number: string;
  supplier_id: string;
  supplier_name: string;
  tool_name: string;
  tool_spec?: string;
  start_date: string;
  end_date: string;
  rental_duration_days: number;
  total_rental_amount: number;
  deposit_amount: number;
  delivery_fee: number;
  pickup_or_delivery: 'pickup' | 'delivery';
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

type TabType = 'active' | 'upcoming' | 'completed';

export const MyRentals: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [rentals, setRentals] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_BASE_URL}/buyers/rentals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRentals(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  const formatCurrency = (amount: number) => {
    return `₾${Number(amount || 0).toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: colors.warning[100], text: colors.warning[700] };
      case 'confirmed':
        return { bg: colors.info[100], text: colors.info[700] };
      case 'active':
        return { bg: colors.success[100], text: colors.success[700] };
      case 'completed':
        return { bg: colors.neutral[100], text: colors.neutral[600] };
      case 'cancelled':
        return { bg: colors.error[100], text: colors.error[700] };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[600] };
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t('myRentals.status.pending', 'Pending'),
      confirmed: t('myRentals.status.confirmed', 'Confirmed'),
      active: t('myRentals.status.active', 'Active'),
      completed: t('myRentals.status.completed', 'Completed'),
      cancelled: t('myRentals.status.cancelled', 'Cancelled'),
    };
    return labels[status] || status;
  };

  // Check if rental is currently active (today is between start and end date)
  const isActive = (rental: RentalBooking) => {
    const now = new Date();
    const start = new Date(rental.start_date);
    const end = new Date(rental.end_date);
    return now >= start && now <= end && rental.status !== 'completed' && rental.status !== 'cancelled';
  };

  // Check if rental is upcoming (start date in future)
  const isUpcoming = (rental: RentalBooking) => {
    const now = new Date();
    const start = new Date(rental.start_date);
    return start > now && rental.status !== 'completed' && rental.status !== 'cancelled';
  };

  // Filter rentals by tab
  const filterByTab = (rental: RentalBooking) => {
    if (activeTab === 'active') {
      return isActive(rental);
    } else if (activeTab === 'upcoming') {
      return isUpcoming(rental) || rental.status === 'confirmed' || rental.status === 'pending';
    } else if (activeTab === 'completed') {
      return rental.status === 'completed' || rental.status === 'cancelled';
    }
    return false;
  };

  const filteredRentals = rentals.filter(filterByTab);

  // Count rentals by tab for badges
  const activeCount = rentals.filter((r) => isActive(r)).length;
  const upcomingCount = rentals.filter((r) => isUpcoming(r) || r.status === 'confirmed' || r.status === 'pending').length;
  const completedCount = rentals.filter((r) => r.status === 'completed' || r.status === 'cancelled').length;

  const tabs = [
    { id: 'active', label: t('myRentals.tabs.active', 'Active'), icon: Icons.Wrench, badge: activeCount > 0 ? activeCount : undefined },
    { id: 'upcoming', label: t('myRentals.tabs.upcoming', 'Upcoming'), icon: Icons.Calendar, badge: upcomingCount > 0 ? upcomingCount : undefined },
    { id: 'completed', label: t('myRentals.tabs.completed', 'Completed'), icon: Icons.CheckCircle },
  ];

  // Mobile Layout
  if (isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.neutral[100],
          paddingBottom: `calc(${heights.bottomNav} + env(safe-area-inset-bottom, 0px) + 20px)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: colors.primary[600],
            padding: spacing[4],
            paddingTop: `calc(${spacing[4]} + env(safe-area-inset-top, 0px))`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[0],
                  margin: 0,
                }}
              >
                {t('myRentals.title', 'My Rentals')}
              </h1>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  marginTop: spacing[1],
                }}
              >
                {t('myRentals.subtitle', 'Track your equipment rentals')}
              </p>
            </div>
            <button
              onClick={() => navigate('/rentals')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: borderRadius.full,
                backgroundColor: colors.neutral[0],
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: shadows.md,
              }}
            >
              <Icons.Plus size={24} color={colors.primary[600]} />
            </button>
          </div>

          {/* Tab Pills */}
          <div
            style={{
              display: 'flex',
              gap: spacing[2],
              marginTop: spacing[4],
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {tabs.map((tab) => {
              const isActiveTab = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: isActiveTab ? colors.neutral[0] : 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: isActiveTab ? colors.primary[700] : colors.neutral[0],
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {tab.badge && (
                    <span
                      style={{
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.error[600],
                        color: colors.neutral[0],
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.bold,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: spacing[4] }}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: spacing[12],
              }}
            >
              <Icons.Loader
                size={32}
                color={colors.primary[600]}
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <p style={{ color: colors.text.secondary, marginTop: spacing[3] }}>
                {t('common.loading', 'Loading...')}
              </p>
            </div>
          ) : filteredRentals.length === 0 ? (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.xl,
                padding: spacing[8],
                textAlign: 'center',
                boxShadow: shadows.sm,
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.primary[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: spacing[4],
                }}
              >
                <Icons.Wrench size={32} color={colors.primary[600]} />
              </div>
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[2],
                }}
              >
                {activeTab === 'active'
                  ? t('myRentals.noActiveRentals', 'No active rentals')
                  : activeTab === 'upcoming'
                  ? t('myRentals.noUpcomingRentals', 'No upcoming rentals')
                  : t('myRentals.noCompletedRentals', 'No completed rentals')}
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  margin: 0,
                  marginBottom: spacing[4],
                }}
              >
                {t('myRentals.browseToRent', 'Browse available equipment to rent')}
              </p>
              <button
                onClick={() => navigate('/rentals')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[3]} ${spacing[5]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                }}
              >
                <Icons.Plus size={18} />
                {t('myRentals.browseRentals', 'Browse Rentals')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {filteredRentals.map((rental) => {
                const statusColor = getStatusColor(rental.status);
                const isCurrentlyActive = isActive(rental);

                return (
                  <div
                    key={rental.id}
                    onClick={() => navigate(`/rentals/${rental.id}`)}
                    style={{
                      backgroundColor: colors.neutral[0],
                      borderRadius: borderRadius.lg,
                      padding: spacing[4],
                      boxShadow: shadows.sm,
                      cursor: 'pointer',
                      border: isCurrentlyActive ? `2px solid ${colors.success[400]}` : `1px solid ${colors.border.light}`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Active indicator line */}
                    {isCurrentlyActive && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          backgroundColor: colors.success[600],
                        }}
                      />
                    )}

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[2] }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                          <span
                            style={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.bold,
                              color: colors.primary[600],
                              fontFamily: 'monospace',
                            }}
                          >
                            #{rental.booking_number}
                          </span>
                          <span
                            style={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.medium,
                              padding: `2px ${spacing[2]}`,
                              borderRadius: borderRadius.full,
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                            }}
                          >
                            {getStatusLabel(rental.status)}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: isCurrentlyActive ? typography.fontWeight.bold : typography.fontWeight.semibold,
                            color: colors.text.primary,
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {rental.tool_spec ? `${rental.tool_spec} ` : ''}{rental.tool_name}
                        </h3>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.bold,
                            color: colors.primary[600],
                          }}
                        >
                          {formatCurrency(rental.total_rental_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Supplier */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[2],
                        marginBottom: spacing[3],
                      }}
                    >
                      <Icons.Store size={14} color={colors.text.tertiary} />
                      <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                        {rental.supplier_name}
                      </span>
                    </div>

                    {/* Stats */}
                    <div
                      style={{
                        display: 'flex',
                        gap: spacing[4],
                        paddingTop: spacing[3],
                        borderTop: `1px solid ${colors.border.light}`,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.Calendar size={14} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.Clock size={14} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {rental.rental_duration_days} {t('myRentals.days', 'days')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        {rental.pickup_or_delivery === 'delivery' ? (
                          <Icons.Truck size={14} color={colors.info[600]} />
                        ) : (
                          <Icons.MapPin size={14} color={colors.secondary[700]} />
                        )}
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {rental.pickup_or_delivery === 'delivery'
                            ? t('myRentals.delivery', 'Delivery')
                            : t('myRentals.pickup', 'Pickup')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Spin animation */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[100],
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.primary[600],
          padding: spacing[6],
          paddingTop: spacing[8],
          paddingBottom: spacing[8],
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[0],
                  margin: 0,
                }}
              >
                {t('myRentals.title', 'My Rentals')}
              </h1>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  marginTop: spacing[2],
                }}
              >
                {t('myRentals.subtitle', 'Track your equipment rentals')}
              </p>
            </div>
            <button
              onClick={() => navigate('/rentals')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[3]} ${spacing[5]}`,
                backgroundColor: colors.neutral[0],
                color: colors.primary[700],
                border: 'none',
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                cursor: 'pointer',
                boxShadow: shadows.md,
              }}
            >
              <Icons.Plus size={20} />
              {t('myRentals.browseRentals', 'Browse Rentals')}
            </button>
          </div>

          {/* Tab Pills */}
          <div
            style={{
              display: 'flex',
              gap: spacing[2],
              marginTop: spacing[6],
            }}
          >
            {tabs.map((tab) => {
              const isActiveTab = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: isActiveTab ? colors.neutral[0] : 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: isActiveTab ? colors.primary[700] : colors.neutral[0],
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {tab.badge && (
                    <span
                      style={{
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.error[600],
                        color: colors.neutral[0],
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.bold,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 6px',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: spacing[6] }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing[16],
            }}
          >
            <Icons.Loader
              size={40}
              color={colors.primary[600]}
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <p style={{ color: colors.text.secondary, marginTop: spacing[4] }}>
              {t('common.loading', 'Loading...')}
            </p>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.xl,
              padding: spacing[12],
              textAlign: 'center',
              boxShadow: shadows.sm,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: borderRadius.full,
                backgroundColor: colors.primary[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                marginBottom: spacing[5],
              }}
            >
              <Icons.Wrench size={40} color={colors.primary[600]} />
            </div>
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              {activeTab === 'active'
                ? t('myRentals.noActiveRentals', 'No active rentals')
                : activeTab === 'upcoming'
                ? t('myRentals.noUpcomingRentals', 'No upcoming rentals')
                : t('myRentals.noCompletedRentals', 'No completed rentals')}
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing[6],
              }}
            >
              {t('myRentals.browseToRent', 'Browse available equipment to rent')}
            </p>
            <button
              onClick={() => navigate('/rentals')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[3]} ${spacing[6]}`,
                backgroundColor: colors.primary[600],
                color: colors.neutral[0],
                border: 'none',
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
              }}
            >
              <Icons.Plus size={20} />
              {t('myRentals.browseRentals', 'Browse Rentals')}
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3],
            }}
          >
            {filteredRentals.map((rental) => {
              const statusColor = getStatusColor(rental.status);
              const isCurrentlyActive = isActive(rental);

              return (
                <div
                  key={rental.id}
                  onClick={() => navigate(`/rentals/${rental.id}`)}
                  style={{
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.lg,
                    padding: spacing[5],
                    boxShadow: shadows.sm,
                    cursor: 'pointer',
                    border: isCurrentlyActive ? `2px solid ${colors.success[400]}` : `1px solid ${colors.border.light}`,
                    transition: 'all 200ms ease',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[5],
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = shadows.md;
                    e.currentTarget.style.backgroundColor = colors.neutral[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = shadows.sm;
                    e.currentTarget.style.backgroundColor = colors.neutral[0];
                  }}
                >
                  {/* Active indicator - left border */}
                  {isCurrentlyActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: '4px',
                        backgroundColor: colors.success[600],
                      }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: borderRadius.lg,
                      backgroundColor: isCurrentlyActive ? colors.success[100] : colors.neutral[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icons.Wrench size={24} color={isCurrentlyActive ? colors.success[600] : colors.text.tertiary} />
                  </div>

                  {/* Main Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Code and status row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[1] }}>
                      <span
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.bold,
                          color: colors.primary[600],
                          fontFamily: 'monospace',
                        }}
                      >
                        #{rental.booking_number}
                      </span>
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                          padding: `${spacing[1]} ${spacing[2]}`,
                          borderRadius: borderRadius.full,
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          flexShrink: 0,
                        }}
                      >
                        {getStatusLabel(rental.status)}
                      </span>
                    </div>

                    {/* Tool name */}
                    <h3
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: isCurrentlyActive ? typography.fontWeight.bold : typography.fontWeight.semibold,
                        color: colors.text.primary,
                        margin: 0,
                        marginBottom: spacing[2],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {rental.tool_spec ? `${rental.tool_spec} ` : ''}{rental.tool_name}
                    </h3>

                    {/* Info row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                        <Icons.Store size={14} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {rental.supplier_name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                        <Icons.Calendar size={14} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.Clock size={14} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {rental.rental_duration_days} {t('myRentals.days', 'days')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        {rental.pickup_or_delivery === 'delivery' ? (
                          <Icons.Truck size={14} color={colors.info[600]} />
                        ) : (
                          <Icons.MapPin size={14} color={colors.secondary[700]} />
                        )}
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {rental.pickup_or_delivery === 'delivery'
                            ? t('myRentals.delivery', 'Delivery')
                            : t('myRentals.pickup', 'Pickup')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side - amount and arrow */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[4],
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: typography.fontSize.lg,
                          fontWeight: typography.fontWeight.bold,
                          color: colors.primary[600],
                        }}
                      >
                        {formatCurrency(rental.total_rental_amount)}
                      </span>
                      {rental.deposit_amount > 0 && (
                        <div
                          style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.text.tertiary,
                          }}
                        >
                          +{formatCurrency(rental.deposit_amount)} {t('myRentals.deposit', 'deposit')}
                        </div>
                      )}
                    </div>
                    <Icons.ChevronRight size={20} color={colors.text.tertiary} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MyRentals;
