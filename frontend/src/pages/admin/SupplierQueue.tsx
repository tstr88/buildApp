/**
 * Supplier Management Queue
 * Admin page for managing suppliers, approvals, and catalog health
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme/tokens';
import { AdminQueueTable, type ColumnDef } from '../../components/admin/AdminQueueTable';
import { ActionDropdown, type ActionItem } from '../../components/admin/ActionDropdown';
import { QueueFilters, type FilterDef } from '../../components/admin/QueueFilters';
import { AlertBadge } from '../../components/AlertBadge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SupplierQueueItem {
  id: string;
  businessName: string;
  status: 'unverified' | 'verified' | 'trusted' | 'paused';
  trustScore: number;
  skuCount: number;
  staleSkusCount: number;
  lastActivity: string;
  phone: string;
}

export function SupplierQueue() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<SupplierQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: 'all',
    trustScore: 'all',
    staleCatalog: 'all',
  });
  const [sortKey, setSortKey] = useState<string>('lastActivity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchSuppliers();
  }, [token, filterValues, sortKey, sortDirection]);

  const fetchSuppliers = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filterValues,
        sortKey,
        sortDirection,
      });

      const response = await fetch(`${API_URL}/api/admin/suppliers?${params}`, {
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
      console.error('Failed to fetch supplier queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (supplierId: string, newStatus: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/suppliers/${supplierId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert(t('admin.supplierQueue.statusUpdated', 'Supplier status updated'));
        fetchSuppliers();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleNudge = async (supplierId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/suppliers/${supplierId}/nudge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert(t('admin.supplierQueue.nudgeSent', 'Nudge sent to supplier'));
      }
    } catch (error) {
      console.error('Failed to nudge supplier:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      unverified: { color: colors.warning[600], label: 'Unverified' },
      verified: { color: colors.success[600], label: 'Verified' },
      trusted: { color: colors.primary[600], label: 'Trusted' },
      paused: { color: colors.error[600], label: 'Paused' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unverified;

    return (
      <span
        style={{
          color: config.color,
          fontWeight: typography.fontWeight.semibold,
          fontSize: typography.fontSize.sm,
        }}
      >
        {config.label}
      </span>
    );
  };

  const getTrustScoreBadge = (score: number) => {
    if (score < 70) {
      return <AlertBadge count={score} severity="error" />;
    }
    if (score < 90) {
      return <AlertBadge count={score} severity="warning" />;
    }
    return (
      <span style={{ color: colors.success[600], fontWeight: typography.fontWeight.semibold }}>
        {score}%
      </span>
    );
  };

  const filters: FilterDef[] = [
    {
      key: 'status',
      label: t('admin.supplierQueue.filters.status', 'Status'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.supplierQueue.filters.all', 'All') },
        { value: 'unverified', label: t('admin.supplierQueue.filters.unverified', 'Unverified') },
        { value: 'verified', label: t('admin.supplierQueue.filters.verified', 'Verified') },
        { value: 'trusted', label: t('admin.supplierQueue.filters.trusted', 'Trusted') },
        { value: 'paused', label: t('admin.supplierQueue.filters.paused', 'Paused') },
      ],
    },
    {
      key: 'trustScore',
      label: t('admin.supplierQueue.filters.trustScore', 'Trust Score'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.supplierQueue.filters.all', 'All') },
        { value: 'low', label: t('admin.supplierQueue.filters.low', '<70%') },
        { value: 'medium', label: t('admin.supplierQueue.filters.medium', '70-90%') },
        { value: 'high', label: t('admin.supplierQueue.filters.high', '>90%') },
      ],
    },
    {
      key: 'staleCatalog',
      label: t('admin.supplierQueue.filters.staleCatalog', 'Stale Catalog'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.supplierQueue.filters.all', 'All') },
        { value: 'yes', label: t('admin.supplierQueue.filters.yes', 'Yes (>14 days)') },
        { value: 'no', label: t('admin.supplierQueue.filters.no', 'No') },
      ],
    },
  ];

  const columns: ColumnDef<SupplierQueueItem>[] = [
    {
      key: 'businessName',
      header: t('admin.supplierQueue.columns.supplier', 'Supplier'),
      render: (item) => (
        <div>
          <div style={{ fontWeight: typography.fontWeight.medium }}>{item.businessName}</div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
            {item.phone}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: t('admin.supplierQueue.columns.status', 'Status'),
      render: (item) => getStatusBadge(item.status),
      sortable: true,
      width: '120px',
    },
    {
      key: 'trustScore',
      header: t('admin.supplierQueue.columns.trustScore', 'Trust Score'),
      render: (item) => getTrustScoreBadge(item.trustScore),
      sortable: true,
      width: '120px',
    },
    {
      key: 'skuCount',
      header: t('admin.supplierQueue.columns.skus', 'SKUs'),
      render: (item) => item.skuCount,
      sortable: true,
      width: '80px',
    },
    {
      key: 'staleSkusCount',
      header: t('admin.supplierQueue.columns.staleSkus', 'Stale SKUs'),
      render: (item) => (
        item.staleSkusCount > 0 ? (
          <AlertBadge count={item.staleSkusCount} severity="warning" />
        ) : (
          <span style={{ color: colors.text.tertiary }}>—</span>
        )
      ),
      sortable: true,
      width: '100px',
    },
    {
      key: 'lastActivity',
      header: t('admin.supplierQueue.columns.lastActivity', 'Last Activity'),
      render: (item) => {
        const daysAgo = Math.floor((Date.now() - new Date(item.lastActivity).getTime()) / (1000 * 60 * 60 * 24));
        return (
          <span style={{ color: daysAgo > 14 ? colors.warning[600] : colors.text.secondary }}>
            {daysAgo}d ago
          </span>
        );
      },
      sortable: true,
      width: '120px',
    },
    {
      key: 'actions',
      header: t('admin.supplierQueue.columns.actions', 'Actions'),
      render: (item) => {
        const actions: ActionItem[] = [
          {
            id: 'view',
            label: t('admin.supplierQueue.actions.viewProfile', 'View Profile'),
            icon: 'Eye',
            onClick: () => navigate(`/admin/suppliers/${item.id}`),
          },
        ];

        if (item.status === 'unverified') {
          actions.push({
            id: 'approve',
            label: t('admin.supplierQueue.actions.approve', 'Approve'),
            icon: 'CheckCircle',
            onClick: () => handleUpdateStatus(item.id, 'verified'),
          });
        }

        if (item.status !== 'paused') {
          actions.push({
            id: 'pause',
            label: t('admin.supplierQueue.actions.pause', 'Pause'),
            icon: 'Pause',
            variant: 'warning',
            onClick: () => handleUpdateStatus(item.id, 'paused'),
          });
        } else {
          actions.push({
            id: 'activate',
            label: t('admin.supplierQueue.actions.activate', 'Activate'),
            icon: 'Play',
            onClick: () => handleUpdateStatus(item.id, 'verified'),
          });
        }

        if (item.staleSkusCount > 0) {
          actions.push({
            id: 'nudge',
            label: t('admin.supplierQueue.actions.nudge', 'Nudge (Update Catalog)'),
            icon: 'Send',
            onClick: () => handleNudge(item.id),
          });
        }

        return <ActionDropdown actions={actions} />;
      },
      width: '80px',
    },
  ];

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues({ ...filterValues, [key]: value });
  };

  const handleResetFilters = () => {
    setFilterValues({
      status: 'all',
      trustScore: 'all',
      staleCatalog: 'all',
    });
  };

  const unverifiedCount = data.filter(item => item.status === 'unverified').length;

  return (
    <div style={{ padding: spacing[6], maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <h1
          style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          {t('admin.supplierQueue.title', 'Supplier Management')}
        </h1>
        <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
          {t('admin.supplierQueue.subtitle', 'Approve suppliers, manage status, and monitor catalog health')}
        </p>
        {unverifiedCount > 0 && (
          <div
            style={{
              marginTop: spacing[3],
              padding: spacing[3],
              backgroundColor: colors.warning[50],
              borderLeft: `4px solid ${colors.warning[600]}`,
              borderRadius: '4px',
            }}
          >
            <span style={{ color: colors.warning[700], fontWeight: typography.fontWeight.semibold }}>
              ⚠ {unverifiedCount} {unverifiedCount === 1 ? 'supplier' : 'suppliers'} pending approval
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <QueueFilters
        filters={filters}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: spacing[8], color: colors.text.tertiary }}>
          {t('common.loading', 'Loading...')}
        </div>
      ) : (
        <AdminQueueTable
          columns={columns}
          data={data}
          keyExtractor={(item) => item.id}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage={t('admin.supplierQueue.empty', 'No suppliers found')}
        />
      )}
    </div>
  );
}
