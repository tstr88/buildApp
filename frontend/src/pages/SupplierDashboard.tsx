/**
 * Supplier Dashboard (Ops Home)
 * Main dashboard for suppliers showing RFQs, offers, deliveries, and performance
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { useWebSocket } from '../context/WebSocketContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface DashboardStats {
  newRFQs: number;
  offersWaitingApproval: number;
  newDirectOrders: number;
  scheduledConfirmedOrders: number;
  todaysDeliveries: number;
  trustScore: number;
  trustTrend: 'up' | 'down' | 'stable';
}

interface RecentActivity {
  id: string;
  type: 'rfq_received' | 'offer_accepted' | 'delivery_completed' | 'payment_received';
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
}

export function SupplierDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { socket } = useWebSocket();
  const [stats, setStats] = useState<DashboardStats>({
    newRFQs: 0,
    offersWaitingApproval: 0,
    newDirectOrders: 0,
    scheduledConfirmedOrders: 0,
    todaysDeliveries: 0,
    trustScore: 100,
    trustTrend: 'stable',
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');

      if (!token) {
        console.error('No auth token found');
        setNeedsOnboarding(true);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/suppliers/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setActivities(data.activities || []);
        setNeedsOnboarding(false);
      } else if (response.status === 404) {
        // Supplier profile not found - needs onboarding
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Listen for WebSocket events to refresh stats
  useEffect(() => {
    if (!socket) return;

    const handleRefresh = () => {
      fetchDashboardData();
    };

    socket.on('rfqs:list-updated', handleRefresh);
    socket.on('rfq:created', handleRefresh);
    socket.on('orders:list-updated', handleRefresh);

    return () => {
      socket.off('rfqs:list-updated', handleRefresh);
      socket.off('rfq:created', handleRefresh);
      socket.off('orders:list-updated', handleRefresh);
    };
  }, [socket, fetchDashboardData]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rfq_received':
        return <Icons.Mail size={20} color={colors.primary[600]} />;
      case 'offer_accepted':
        return <Icons.CheckCircle size={20} color={colors.success[600]} />;
      case 'delivery_completed':
        return <Icons.Truck size={20} color={colors.info[600]} />;
      case 'payment_received':
        return <Icons.DollarSign size={20} color={colors.success[600]} />;
      default:
        return <Icons.Info size={20} color={colors.neutral[500]} />;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <div style={{ color: colors.text.tertiary }}>{t('common.loading')}</div>
      </div>
    );
  }

  // Show onboarding CTA if supplier hasn't completed onboarding
  if (needsOnboarding) {
    return (
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: spacing[6],
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: spacing[8], textAlign: 'center' }}>
          <h1
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[3],
            }}
          >
            {t('supplierDashboard.welcomeTitle', 'Welcome to BuildApp!')}
          </h1>
          <p
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            {t('supplierDashboard.welcomeSubtitle', 'Complete your supplier profile to start receiving orders')}
          </p>
        </div>

        {/* Empty State Card */}
        <div
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[8],
            borderRadius: borderRadius.xl,
            border: `1px solid ${colors.border.light}`,
            boxShadow: shadows.lg,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: borderRadius.full,
              backgroundColor: colors.primary[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: spacing[5],
            }}
          >
            <Icons.Store size={40} color={colors.primary[600]} />
          </div>

          <h2
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[3],
            }}
          >
            {t('supplierDashboard.setupYourBusiness', 'Set Up Your Business')}
          </h2>

          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
              margin: 0,
              marginBottom: spacing[6],
              lineHeight: '1.6',
            }}
          >
            {t('supplierDashboard.onboardingDescription',
              'Complete your supplier profile to start receiving RFQs and direct orders from buyers. Set up your depot location, catalog, and business information.'
            )}
          </p>

          {/* Feature list */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3],
              marginBottom: spacing[6],
              textAlign: 'left',
            }}
          >
            {[
              { icon: Icons.MapPin, text: t('supplierDashboard.feature1', 'Set your depot location and delivery zones') },
              { icon: Icons.Package, text: t('supplierDashboard.feature2', 'Add your products and pricing') },
              { icon: Icons.Mail, text: t('supplierDashboard.feature3', 'Start receiving RFQs from buyers') },
              { icon: Icons.TrendingUp, text: t('supplierDashboard.feature4', 'Grow your business with direct orders') },
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: spacing[3],
                  backgroundColor: colors.background.secondary,
                  borderRadius: borderRadius.md,
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: borderRadius.full,
                    backgroundColor: colors.primary[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <feature.icon size={18} color={colors.primary[600]} />
                </div>
                <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/supplier/onboard')}
            style={{
              width: '100%',
              maxWidth: '400px',
              height: '56px',
              backgroundColor: colors.primary[600],
              color: colors.neutral[0],
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              border: 'none',
              borderRadius: borderRadius.lg,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
              margin: '0 auto',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[700];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[600];
            }}
          >
            {t('supplierDashboard.startOnboarding', 'Complete Supplier Profile')}
            <Icons.ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background.secondary,
        paddingBottom: '80px',
      }}
    >
      {/* Header - Primary branded */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
          padding: `${spacing[5]} ${spacing[6]}`,
          boxShadow: shadows.md,
          position: 'sticky',
          top: 0,
          zIndex: 1020,
          marginBottom: spacing[6],
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[0],
              margin: 0,
              marginBottom: spacing[2],
            }}
          >
            {t('supplierDashboard.title', 'Supplier Dashboard')}
          </h1>
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0,
            }}
          >
            {t('supplierDashboard.subtitle', 'Manage your RFQs, offers, and deliveries')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `0 ${spacing[6]}`,
        }}
      >

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: spacing[4],
          marginBottom: spacing[6],
        }}
      >
        {/* New RFQs */}
        <div
          onClick={() => navigate('/supplier/rfqs?tab=new')}
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[5],
            borderRadius: borderRadius.lg,
            border: `2px solid ${stats.newRFQs > 0 ? colors.primary[600] : colors.border.light}`,
            boxShadow: shadows.sm,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = shadows.md;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = shadows.sm;
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[3] }}>
            <Icons.Mail size={28} color={colors.primary[600]} />
            {stats.newRFQs > 0 && (
              <div
                style={{
                  backgroundColor: colors.error[500],
                  color: colors.neutral[0],
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.bold,
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: borderRadius.full,
                  minWidth: '24px',
                  textAlign: 'center',
                }}
              >
                {stats.newRFQs}
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[1],
            }}
          >
            {stats.newRFQs}
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
            {t('supplierDashboard.newRFQs', 'New RFQs')}
          </div>
          <div
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.primary[600],
              marginTop: spacing[2],
              fontWeight: typography.fontWeight.medium,
            }}
          >
            {t('common.viewAll', 'View All')} →
          </div>
        </div>

        {/* Offers Waiting for Approval */}
        <div
          onClick={() => navigate('/supplier/rfqs?tab=sent')}
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[5],
            borderRadius: borderRadius.lg,
            border: `2px solid ${stats.offersWaitingApproval > 0 ? colors.warning[500] : colors.border.light}`,
            boxShadow: shadows.sm,
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[3] }}>
            <Icons.Send size={28} color={colors.warning[600]} />
            {stats.offersWaitingApproval > 0 && (
              <div
                style={{
                  backgroundColor: colors.warning[500],
                  color: colors.neutral[0],
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.bold,
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: borderRadius.full,
                  minWidth: '24px',
                  textAlign: 'center',
                }}
              >
                {stats.offersWaitingApproval}
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[1],
            }}
          >
            {stats.offersWaitingApproval}
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
            {t('supplierDashboard.offersWaitingApproval', 'Offers Waiting Approval')}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginTop: spacing[1] }}>
            {t('supplierDashboard.pendingBuyerResponse', 'Pending buyer response')}
          </div>
        </div>

        {/* New Direct Orders */}
        <div
          onClick={() => navigate('/supplier/orders?tab=new')}
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[5],
            borderRadius: borderRadius.lg,
            border: `2px solid ${stats.newDirectOrders > 0 ? colors.info[500] : colors.border.light}`,
            boxShadow: shadows.sm,
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[3] }}>
            <Icons.ShoppingCart size={28} color={colors.info[600]} />
            {stats.newDirectOrders > 0 && (
              <div
                style={{
                  backgroundColor: colors.info[500],
                  color: colors.neutral[0],
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.bold,
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: borderRadius.full,
                  minWidth: '24px',
                  textAlign: 'center',
                }}
              >
                {stats.newDirectOrders}
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[1],
            }}
          >
            {stats.newDirectOrders}
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
            {t('supplierDashboard.newDirectOrders', 'New Direct Orders')}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginTop: spacing[1] }}>
            {t('supplierDashboard.needsConfirmation', 'Needs confirmation')}
          </div>
        </div>

        {/* Scheduled Confirmed Orders */}
        <div
          onClick={() => navigate('/supplier/orders?tab=scheduled')}
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[5],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            boxShadow: shadows.sm,
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ marginBottom: spacing[3] }}>
            <Icons.Calendar size={28} color={colors.success[600]} />
          </div>
          <div
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[1],
            }}
          >
            {stats.scheduledConfirmedOrders}
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
            {t('supplierDashboard.scheduledConfirmedOrders', 'Scheduled Orders')}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginTop: spacing[1] }}>
            {t('supplierDashboard.confirmed', 'Confirmed & scheduled')}
          </div>
        </div>

        {/* Today's Deliveries */}
        <div
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[5],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            boxShadow: shadows.sm,
          }}
        >
          <div style={{ marginBottom: spacing[3] }}>
            <Icons.Truck size={28} color={colors.success[600]} />
          </div>
          <div
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[1],
            }}
          >
            {stats.todaysDeliveries}
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
            {t('supplierDashboard.todaysDeliveries', "Today's Deliveries")}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginTop: spacing[1] }}>
            {t('supplierDashboard.dueToday', 'Due today')}
          </div>
        </div>

        {/* Trust Score */}
        <div
          onClick={() => navigate('/supplier/performance')}
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[5],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            boxShadow: shadows.sm,
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[3] }}>
            <Icons.Award size={28} color={colors.primary[600]} />
            {stats.trustTrend === 'up' && <Icons.TrendingUp size={20} color={colors.success[600]} />}
            {stats.trustTrend === 'down' && <Icons.TrendingDown size={20} color={colors.error[600]} />}
          </div>
          <div
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[1],
            }}
          >
            {stats.trustScore}%
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
            {t('supplierDashboard.trustScore', 'Trust Score')}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          padding: spacing[5],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          boxShadow: shadows.sm,
          marginBottom: spacing[6],
        }}
      >
        <h2
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[4],
          }}
        >
          {t('supplierDashboard.quickActions', 'Quick Actions')}
        </h2>
        <div style={{ display: 'flex', gap: spacing[3], flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/supplier/rfqs?tab=new')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[3]} ${spacing[5]}`,
              backgroundColor: colors.primary[600],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Icons.Mail size={20} />
            {t('supplierDashboard.viewNewRFQs', 'New RFQs')}
            {stats.newRFQs > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: colors.error[500],
                  color: colors.neutral[0],
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.bold,
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: borderRadius.full,
                  minWidth: '24px',
                  textAlign: 'center',
                }}
              >
                {stats.newRFQs}
              </div>
            )}
          </button>

          <button
            onClick={() => navigate('/supplier/catalog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[3]} ${spacing[5]}`,
              backgroundColor: colors.neutral[0],
              color: colors.text.primary,
              border: `1px solid ${colors.border.default}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            <Icons.Package size={20} />
            {t('supplierDashboard.manageCatalog', 'Manage Catalog')}
          </button>

          <button
            onClick={() => navigate('/supplier/performance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[3]} ${spacing[5]}`,
              backgroundColor: colors.neutral[0],
              color: colors.text.primary,
              border: `1px solid ${colors.border.default}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            <Icons.BarChart3 size={20} />
            {t('supplierDashboard.viewPerformance', 'View Performance')}
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          padding: spacing[5],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          boxShadow: shadows.sm,
        }}
      >
        <h2
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[4],
          }}
        >
          {t('supplierDashboard.recentActivity', 'Recent Activity')}
        </h2>

        {activities.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: spacing[8],
              color: colors.text.tertiary,
            }}
          >
            <Icons.Inbox size={48} color={colors.neutral[400]} style={{ marginBottom: spacing[3] }} />
            <div>{t('supplierDashboard.noActivity', 'No recent activity')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {activities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  gap: spacing[3],
                  padding: spacing[3],
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.border.light}`,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.background.secondary)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: borderRadius.full,
                    backgroundColor: colors.background.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      marginBottom: spacing[1],
                    }}
                  >
                    {activity.title}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                    }}
                  >
                    {activity.description}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    flexShrink: 0,
                  }}
                >
                  {activity.relativeTime}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
