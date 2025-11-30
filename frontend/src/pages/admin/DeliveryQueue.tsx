/**
 * Delivery Queue Page
 * Admin page for monitoring today's deliveries and tracking late orders
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
import { AdminNoteModal } from '../../components/admin/AdminNoteModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface DeliveryQueueItem {
  id: string;
  orderId: string;
  supplierName: string;
  buyerName: string;
  scheduledWindowStart: string;
  scheduledWindowEnd: string;
  status: 'scheduled' | 'in_progress' | 'late' | 'completed';
  minutesLate?: number;
  supplierPhone: string;
  buyerPhone: string;
}

export function DeliveryQueue() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DeliveryQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    date: 'today',
    status: 'all',
    supplier: '',
  });
  const [sortKey, setSortKey] = useState<string>('scheduledWindowStart');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchDeliveries();
  }, [token, filterValues, sortKey, sortDirection]);

  const fetchDeliveries = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filterValues,
        sortKey,
        sortDirection,
      });

      const response = await fetch(`${API_URL}/api/admin/deliveries?${params}`, {
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
      console.error('Failed to fetch delivery queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (note: string) => {
    if (!token || !selectedOrderId) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/deliveries/${selectedOrderId}/note`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (response.ok) {
        alert(t('admin.deliveryQueue.noteSaved', 'Note saved'));
        fetchDeliveries();
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (item: DeliveryQueueItem) => {
    if (item.status === 'late' || (item.minutesLate && item.minutesLate > 30)) {
      return <AlertBadge count={item.minutesLate || 0} severity="error" />;
    }
    if (item.status === 'in_progress') {
      return <span style={{ color: colors.warning[600], fontWeight: typography.fontWeight.semibold }}>In Progress</span>;
    }
    if (item.status === 'completed') {
      return <span style={{ color: colors.success[600], fontWeight: typography.fontWeight.semibold }}>✓ Completed</span>;
    }
    return <span style={{ color: colors.text.secondary }}>Scheduled</span>;
  };

  const filters: FilterDef[] = [
    {
      key: 'date',
      label: t('admin.deliveryQueue.filters.date', 'Date'),
      type: 'select',
      options: [
        { value: 'today', label: t('admin.deliveryQueue.filters.today', 'Today') },
        { value: 'tomorrow', label: t('admin.deliveryQueue.filters.tomorrow', 'Tomorrow') },
        { value: 'week', label: t('admin.deliveryQueue.filters.week', 'This Week') },
      ],
    },
    {
      key: 'status',
      label: t('admin.deliveryQueue.filters.status', 'Status'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.deliveryQueue.filters.all', 'All') },
        { value: 'scheduled', label: t('admin.deliveryQueue.filters.scheduled', 'Scheduled') },
        { value: 'in_progress', label: t('admin.deliveryQueue.filters.inProgress', 'In Progress') },
        { value: 'late', label: t('admin.deliveryQueue.filters.late', 'Late') },
        { value: 'completed', label: t('admin.deliveryQueue.filters.completed', 'Completed') },
      ],
    },
    {
      key: 'supplier',
      label: t('admin.deliveryQueue.filters.supplier', 'Supplier'),
      type: 'search',
      placeholder: t('admin.deliveryQueue.filters.searchSupplier', 'Search supplier...'),
    },
  ];

  const columns: ColumnDef<DeliveryQueueItem>[] = [
    {
      key: 'orderId',
      header: t('admin.deliveryQueue.columns.orderId', 'Order ID'),
      render: (item) => (
        <span style={{ fontFamily: 'monospace', fontSize: typography.fontSize.xs }}>
          #{item.orderId.slice(0, 8)}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'supplier',
      header: t('admin.deliveryQueue.columns.supplier', 'Supplier'),
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
      key: 'buyer',
      header: t('admin.deliveryQueue.columns.buyer', 'Buyer'),
      render: (item) => (
        <div>
          <div style={{ fontWeight: typography.fontWeight.medium }}>{item.buyerName}</div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
            {item.buyerPhone}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'scheduledWindow',
      header: t('admin.deliveryQueue.columns.scheduledWindow', 'Scheduled Window'),
      render: (item) => (
        <div style={{ fontSize: typography.fontSize.sm }}>
          {formatTime(item.scheduledWindowStart)} - {formatTime(item.scheduledWindowEnd)}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: t('admin.deliveryQueue.columns.status', 'Status'),
      render: (item) => getStatusBadge(item),
      sortable: true,
      width: '140px',
    },
    {
      key: 'minutesLate',
      header: t('admin.deliveryQueue.columns.late', 'Late'),
      render: (item) => (
        item.minutesLate ? (
          <span style={{ color: item.minutesLate > 30 ? colors.error[600] : colors.warning[600] }}>
            +{item.minutesLate}min
          </span>
        ) : (
          <span style={{ color: colors.text.tertiary }}>—</span>
        )
      ),
      sortable: true,
      width: '80px',
    },
    {
      key: 'actions',
      header: t('admin.deliveryQueue.columns.actions', 'Actions'),
      render: (item) => {
        const actions: ActionItem[] = [
          {
            id: 'view',
            label: t('admin.deliveryQueue.actions.viewOrder', 'View Order'),
            icon: 'Eye',
            onClick: () => navigate(`/admin/orders/${item.orderId}`),
          },
          {
            id: 'contact-supplier',
            label: t('admin.deliveryQueue.actions.contactSupplier', 'Contact Supplier'),
            icon: 'Phone',
            onClick: () => window.open(`tel:${item.supplierPhone}`),
          },
          {
            id: 'mark-issue',
            label: t('admin.deliveryQueue.actions.markIssue', 'Mark Issue'),
            icon: 'AlertTriangle',
            variant: 'warning',
            onClick: () => {
              setSelectedOrderId(item.orderId);
              setNoteModalOpen(true);
            },
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
      date: 'today',
      status: 'all',
      supplier: '',
    });
  };

  const lateCount = data.filter(item => item.status === 'late' || (item.minutesLate && item.minutesLate > 30)).length;

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
          {t('admin.deliveryQueue.title', 'Delivery Queue')}
        </h1>
        <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
          {t('admin.deliveryQueue.subtitle', 'Monitor scheduled deliveries and track late orders')}
        </p>
        {lateCount > 0 && (
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
              ⚠ {lateCount} {lateCount === 1 ? 'delivery' : 'deliveries'} late
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
          emptyMessage={t('admin.deliveryQueue.empty', 'No deliveries found')}
        />
      )}

      {/* Note Modal */}
      <AdminNoteModal
        isOpen={noteModalOpen}
        onClose={() => {
          setNoteModalOpen(false);
          setSelectedOrderId(null);
        }}
        onSubmit={handleAddNote}
        title={t('admin.deliveryQueue.markIssueTitle', 'Mark Issue')}
        placeholder={t('admin.deliveryQueue.markIssuePlaceholder', 'Describe the issue (e.g., Supplier notified, Buyer contacted)...')}
      />
    </div>
  );
}
