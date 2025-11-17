/**
 * Admin Dashboard
 * Platform health monitoring and operations
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme/tokens';
import { AdminDashboardTile } from '../components/AdminDashboardTile';

interface DashboardData {
  liveRFQs: {
    totalActive: number;
    zeroReplies24h: number;
    avgResponseHours: number;
  };
  deliveries: {
    scheduledToday: number;
    completed: number;
    inProgress: number;
    late: number;
  };
  confirmations: {
    expiringBuyerConfirmations: number;
    pendingRentalHandovers: number;
  };
  disputes: {
    open_disputes: number;
    breakdown: Record<string, number>;
    avg_resolution_days: number;
  };
  supplierHealth: {
    unverified: number;
    staleCatalogs: number;
    lowTrustScores: number;
  };
  rentalHealth: {
    activeBookings: number;
    overdueReturns: number;
  };
  billing: {
    outstandingFees: number;
    overdueInvoices: number;
  };
  platformStats: {
    totalBuyers: number;
    totalSuppliers: number;
    totalUsers: number;
    ordersThisMonth: number;
    directOrdersThisMonth: number;
    gmvThisMonth: number;
    revenueThisMonth: number;
  };
}

export function AdminDashboard() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          color: colors.text.tertiary,
        }}
      >
        {t('common.loading', 'Loading...')}
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: spacing[8],
          color: colors.text.tertiary,
        }}
      >
        {t('admin.dashboard.failedToLoad', 'Failed to load dashboard data')}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: spacing[6],
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <h1
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}
        >
          {t('admin.dashboard.title', 'Operations Dashboard')}
        </h1>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            margin: 0,
          }}
        >
          {t('admin.dashboard.subtitle', 'Monitor platform health and operations')}
        </p>
      </div>

      {/* Dashboard Tiles Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: spacing[5],
        }}
      >
        {/* 1. Live RFQs */}
        <AdminDashboardTile
          title={t('admin.dashboard.liveRFQs.title', 'Live RFQs')}
          count={data.liveRFQs.totalActive}
          icon="FileText"
          stats={[
            {
              label: t('admin.dashboard.liveRFQs.zeroReplies', 'Zero replies >24h'),
              value: data.liveRFQs.zeroReplies24h,
              severity: data.liveRFQs.zeroReplies24h > 0 ? 'warning' : undefined,
            },
            {
              label: t('admin.dashboard.liveRFQs.avgResponse', 'Avg response time'),
              value: `${data.liveRFQs.avgResponseHours.toFixed(1)}h`,
            },
          ]}
          ctaLabel={t('admin.dashboard.liveRFQs.cta', 'View RFQ Queue')}
          ctaPath="/admin/rfqs"
        />

        {/* 2. Today's Deliveries */}
        <AdminDashboardTile
          title={t('admin.dashboard.deliveries.title', "Today's Deliveries")}
          count={data.deliveries.scheduledToday}
          icon="Truck"
          stats={[
            {
              label: t('admin.dashboard.deliveries.completed', 'Completed'),
              value: data.deliveries.completed,
              color: colors.success[600],
            },
            {
              label: t('admin.dashboard.deliveries.inProgress', 'In progress'),
              value: data.deliveries.inProgress,
            },
            {
              label: t('admin.dashboard.deliveries.late', 'Late'),
              value: data.deliveries.late,
              severity: data.deliveries.late > 0 ? 'error' : undefined,
            },
          ]}
          ctaLabel={t('admin.dashboard.deliveries.cta', 'View Delivery Queue')}
          ctaPath="/admin/deliveries"
        />

        {/* 3. Pending Confirmations */}
        <AdminDashboardTile
          title={t('admin.dashboard.confirmations.title', 'Pending Confirmations')}
          count={data.confirmations.expiringBuyerConfirmations + data.confirmations.pendingRentalHandovers}
          icon="Clock"
          stats={[
            {
              label: t('admin.dashboard.confirmations.expiring', '24h confirmations expiring <6h'),
              value: data.confirmations.expiringBuyerConfirmations,
              severity: data.confirmations.expiringBuyerConfirmations > 0 ? 'warning' : undefined,
            },
            {
              label: t('admin.dashboard.confirmations.rentalHandovers', '2h rental handovers'),
              value: data.confirmations.pendingRentalHandovers,
            },
          ]}
          ctaLabel={t('admin.dashboard.confirmations.cta', 'View Confirmation Queue')}
          ctaPath="/admin/confirmations"
        />

        {/* 4. Disputes */}
        <AdminDashboardTile
          title={t('admin.dashboard.disputes.title', 'Disputes')}
          count={data.disputes.open_disputes}
          icon="AlertCircle"
          stats={[
            {
              label: t('admin.dashboard.disputes.avgResolution', 'Avg resolution time'),
              value: `${data.disputes.avg_resolution_days} days`,
            },
          ]}
          ctaLabel={t('admin.dashboard.disputes.cta', 'View Disputes')}
          ctaPath="/admin/disputes"
        />

        {/* 5. Supplier Health */}
        <AdminDashboardTile
          title={t('admin.dashboard.supplierHealth.title', 'Supplier Health')}
          count={data.supplierHealth.unverified + data.supplierHealth.staleCatalogs + data.supplierHealth.lowTrustScores}
          icon="Factory"
          stats={[
            {
              label: t('admin.dashboard.supplierHealth.unverified', 'Unverified suppliers'),
              value: data.supplierHealth.unverified,
            },
            {
              label: t('admin.dashboard.supplierHealth.staleCatalogs', 'Stale catalogs >14 days'),
              value: data.supplierHealth.staleCatalogs,
            },
            {
              label: t('admin.dashboard.supplierHealth.lowTrust', 'Low trust scores <70%'),
              value: data.supplierHealth.lowTrustScores,
              severity: data.supplierHealth.lowTrustScores > 0 ? 'warning' : undefined,
            },
          ]}
          ctaLabel={t('admin.dashboard.supplierHealth.cta', 'Manage Suppliers')}
          ctaPath="/admin/suppliers"
        />

        {/* 6. Rental Health */}
        <AdminDashboardTile
          title={t('admin.dashboard.rentalHealth.title', 'Rental Health')}
          count={data.rentalHealth.activeBookings}
          icon="Wrench"
          stats={[
            {
              label: t('admin.dashboard.rentalHealth.overdueReturns', 'Overdue returns'),
              value: data.rentalHealth.overdueReturns,
              severity: data.rentalHealth.overdueReturns > 0 ? 'error' : undefined,
            },
          ]}
          ctaLabel={t('admin.dashboard.rentalHealth.cta', 'View Rentals')}
          ctaPath="/admin/rentals"
        />

        {/* 7. Billing */}
        <AdminDashboardTile
          title={t('admin.dashboard.billing.title', 'Billing')}
          count={`₾${data.billing.outstandingFees.toFixed(2)}`}
          icon="DollarSign"
          stats={[
            {
              label: t('admin.dashboard.billing.overdueInvoices', 'Overdue invoices >14 days'),
              value: data.billing.overdueInvoices,
              severity: data.billing.overdueInvoices > 0 ? 'error' : undefined,
            },
          ]}
          ctaLabel={t('admin.dashboard.billing.cta', 'View Billing')}
          ctaPath="/admin/billing"
        />

        {/* 8. Platform Stats */}
        <AdminDashboardTile
          title={t('admin.dashboard.platformStats.title', 'Platform Stats')}
          count={data.platformStats.totalUsers}
          icon="TrendingUp"
          stats={[
            {
              label: t('admin.dashboard.platformStats.buyers', 'Buyers'),
              value: data.platformStats.totalBuyers,
            },
            {
              label: t('admin.dashboard.platformStats.suppliers', 'Suppliers'),
              value: data.platformStats.totalSuppliers,
            },
            {
              label: t('admin.dashboard.platformStats.ordersThisMonth', 'Orders this month'),
              value: data.platformStats.ordersThisMonth,
            },
            {
              label: t('admin.dashboard.platformStats.directOrders', 'Direct orders'),
              value: data.platformStats.directOrdersThisMonth,
            },
            {
              label: t('admin.dashboard.platformStats.gmv', 'GMV this month'),
              value: `₾${data.platformStats.gmvThisMonth.toFixed(0)}`,
            },
            {
              label: t('admin.dashboard.platformStats.revenue', 'Revenue this month'),
              value: `₾${data.platformStats.revenueThisMonth.toFixed(2)}`,
              color: colors.success[600],
            },
          ]}
          ctaLabel={t('admin.dashboard.platformStats.cta', 'View Analytics')}
          ctaPath="/admin/analytics"
        />

        {/* 9. Templates */}
        <AdminDashboardTile
          title={t('admin.dashboard.templates.title', 'Project Templates')}
          count="2"
          icon="FileText"
          stats={[
            {
              label: t('admin.dashboard.templates.published', 'Published templates'),
              value: 2,
              color: colors.success[600],
            },
            {
              label: t('admin.dashboard.templates.draft', 'Draft templates'),
              value: 0,
            },
          ]}
          ctaLabel={t('admin.dashboard.templates.cta', 'Manage Templates')}
          ctaPath="/admin/templates"
        />
      </div>
    </div>
  );
}
