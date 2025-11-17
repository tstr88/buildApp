/**
 * Rental Queue Page
 * Admin page for monitoring tool rentals and tracking overdue returns
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

interface RentalQueueItem {
  id: string;
  bookingId: string;
  toolName: string;
  supplierName: string;
  supplierPhone: string;
  handoverDate: string;
  handoverStatus: 'pending' | 'completed';
  returnDate: string;
  returnStatus: 'pending' | 'completed' | 'overdue';
  overdueDays?: number;
}

export function RentalQueue() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<RentalQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: 'all',
    overdue: 'all',
  });
  const [sortKey, setSortKey] = useState<string>('returnDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchRentals();
  }, [token, filterValues, sortKey, sortDirection]);

  const fetchRentals = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filterValues,
        sortKey,
        sortDirection,
      });

      const response = await fetch(`http://localhost:3001/api/admin/rentals?${params}`, {
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
      console.error('Failed to fetch rental queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getHandoverStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <span style={{ color: colors.success[600], fontWeight: typography.fontWeight.semibold }}>✓</span>;
    }
    return <span style={{ color: colors.warning[600], fontWeight: typography.fontWeight.semibold }}>Pending</span>;
  };

  const getReturnStatusBadge = (item: RentalQueueItem) => {
    if (item.returnStatus === 'overdue') {
      return <AlertBadge count={item.overdueDays || 0} severity="error" />;
    }
    if (item.returnStatus === 'completed') {
      return <span style={{ color: colors.success[600], fontWeight: typography.fontWeight.semibold }}>✓</span>;
    }
    return <span style={{ color: colors.text.secondary }}>Pending</span>;
  };

  const filters: FilterDef[] = [
    {
      key: 'status',
      label: t('admin.rentalQueue.filters.status', 'Status'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.rentalQueue.filters.all', 'All') },
        { value: 'active', label: t('admin.rentalQueue.filters.active', 'Active') },
        { value: 'completed', label: t('admin.rentalQueue.filters.completed', 'Completed') },
      ],
    },
    {
      key: 'overdue',
      label: t('admin.rentalQueue.filters.overdue', 'Overdue'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.rentalQueue.filters.all', 'All') },
        { value: 'yes', label: t('admin.rentalQueue.filters.yes', 'Yes') },
        { value: 'no', label: t('admin.rentalQueue.filters.no', 'No') },
      ],
    },
  ];

  const columns: ColumnDef<RentalQueueItem>[] = [
    {
      key: 'bookingId',
      header: t('admin.rentalQueue.columns.bookingId', 'Booking ID'),
      render: (item) => (
        <span style={{ fontFamily: 'monospace', fontSize: typography.fontSize.xs }}>
          #{item.bookingId.slice(0, 8)}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'tool',
      header: t('admin.rentalQueue.columns.tool', 'Tool'),
      render: (item) => item.toolName,
      sortable: true,
    },
    {
      key: 'supplier',
      header: t('admin.rentalQueue.columns.supplier', 'Supplier'),
      render: (item) => (
        <div>
          <div style={{ fontWeight: typography.fontWeight.medium }}>{item.supplierName}</div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
            {item.supplierPhone}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'handover',
      header: t('admin.rentalQueue.columns.handover', 'Handover'),
      render: (item) => (
        <div>
          <div style={{ fontSize: typography.fontSize.sm }}>{formatDate(item.handoverDate)}</div>
          <div>{getHandoverStatusBadge(item.handoverStatus)}</div>
        </div>
      ),
      sortable: true,
      width: '120px',
    },
    {
      key: 'return',
      header: t('admin.rentalQueue.columns.return', 'Return'),
      render: (item) => (
        <div>
          <div style={{ fontSize: typography.fontSize.sm }}>{formatDate(item.returnDate)}</div>
          <div>{getReturnStatusBadge(item)}</div>
        </div>
      ),
      sortable: true,
      width: '120px',
    },
    {
      key: 'overdue',
      header: t('admin.rentalQueue.columns.overdue', 'Overdue'),
      render: (item) => (
        item.overdueDays ? (
          <span style={{ color: colors.error[600], fontWeight: typography.fontWeight.semibold }}>
            {item.overdueDays}d
          </span>
        ) : (
          <span style={{ color: colors.text.tertiary }}>—</span>
        )
      ),
      sortable: true,
      width: '100px',
    },
    {
      key: 'actions',
      header: t('admin.rentalQueue.columns.actions', 'Actions'),
      render: (item) => {
        const actions: ActionItem[] = [
          {
            id: 'view',
            label: t('admin.rentalQueue.actions.viewBooking', 'View Booking'),
            icon: 'Eye',
            onClick: () => navigate(`/admin/rentals/${item.id}`),
          },
          {
            id: 'contact',
            label: t('admin.rentalQueue.actions.contactSupplier', 'Contact Supplier'),
            icon: 'Phone',
            onClick: () => window.open(`tel:${item.supplierPhone}`),
          },
        ];

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
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues({ ...filterValues, [key]: value });
  };

  const handleResetFilters = () => {
    setFilterValues({
      status: 'all',
      overdue: 'all',
    });
  };

  const overdueCount = data.filter(item => item.returnStatus === 'overdue').length;

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
          {t('admin.rentalQueue.title', 'Rental Queue')}
        </h1>
        <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
          {t('admin.rentalQueue.subtitle', 'Monitor tool rentals and track overdue returns')}
        </p>
        {overdueCount > 0 && (
          <div
            style={{
              marginTop: spacing[3],
              padding: spacing[3],
              backgroundColor: colors.error[50],
              borderLeft: `4px solid ${colors.error[600]}`,
              borderRadius: '4px',
            }}
          >
            <span style={{ color: colors.error[700], fontWeight: typography.fontWeight.semibold }}>
              ⚠ {overdueCount} overdue {overdueCount === 1 ? 'return' : 'returns'}
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
          emptyMessage={t('admin.rentalQueue.empty', 'No rentals found')}
        />
      )}
    </div>
  );
}
