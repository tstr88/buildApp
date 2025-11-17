/**
 * Dispute Queue Page
 * Admin page for monitoring and managing order disputes
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme/tokens';
import { AdminQueueTable, type ColumnDef } from '../../components/admin/AdminQueueTable';
import { ActionDropdown, type ActionItem } from '../../components/admin/ActionDropdown';
import { QueueFilters, type FilterDef } from '../../components/admin/QueueFilters';
import { AdminNoteModal } from '../../components/admin/AdminNoteModal';

interface DisputeQueueItem {
  id: string;
  orderId: string;
  supplierName: string;
  buyerType: 'homeowner' | 'contractor';
  issueCategory: string;
  reportedAt: string;
  status: 'open' | 'supplier_responded' | 'resolved';
  outcome?: string;
}

export function DisputeQueue() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DisputeQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: 'all',
    issueCategory: 'all',
    buyerType: 'all',
  });
  const [sortKey, setSortKey] = useState<string>('reportedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchDisputes();
  }, [token, filterValues, sortKey, sortDirection]);

  const fetchDisputes = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filterValues,
        sortKey,
        sortDirection,
      });

      const response = await fetch(`http://localhost:3001/api/admin/disputes?${params}`, {
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
      console.error('Failed to fetch dispute queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (note: string) => {
    if (!token || !selectedDisputeId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/disputes/${selectedDisputeId}/note`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (response.ok) {
        alert(t('admin.disputeQueue.noteSaved', 'Admin note saved'));
        fetchDisputes();
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleResolve = async (disputeId: string) => {
    if (!token) return;

    const outcome = prompt(t('admin.disputeQueue.enterOutcome', 'Enter outcome (e.g., Price adjust, Redeliver, Denied):'));
    if (!outcome) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/disputes/${disputeId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outcome }),
      });

      if (response.ok) {
        alert(t('admin.disputeQueue.resolved', 'Dispute marked as resolved'));
        fetchDisputes();
      }
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: colors.error[600], label: 'Open' },
      supplier_responded: { color: colors.warning[600], label: 'Supplier Responded' },
      resolved: { color: colors.success[600], label: 'Resolved' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filters: FilterDef[] = [
    {
      key: 'status',
      label: t('admin.disputeQueue.filters.status', 'Status'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.disputeQueue.filters.all', 'All') },
        { value: 'open', label: t('admin.disputeQueue.filters.open', 'Open') },
        { value: 'supplier_responded', label: t('admin.disputeQueue.filters.supplierResponded', 'Supplier Responded') },
        { value: 'resolved', label: t('admin.disputeQueue.filters.resolved', 'Resolved') },
      ],
    },
    {
      key: 'issueCategory',
      label: t('admin.disputeQueue.filters.issueCategory', 'Issue Category'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.disputeQueue.filters.all', 'All') },
        { value: 'spec_mismatch', label: t('admin.disputeQueue.filters.specMismatch', 'Spec Mismatch') },
        { value: 'quantity_short', label: t('admin.disputeQueue.filters.quantityShort', 'Quantity Short') },
        { value: 'quality_issue', label: t('admin.disputeQueue.filters.qualityIssue', 'Quality Issue') },
        { value: 'late_delivery', label: t('admin.disputeQueue.filters.lateDelivery', 'Late Delivery') },
        { value: 'other', label: t('admin.disputeQueue.filters.other', 'Other') },
      ],
    },
    {
      key: 'buyerType',
      label: t('admin.disputeQueue.filters.buyerType', 'Buyer Type'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.disputeQueue.filters.all', 'All') },
        { value: 'homeowner', label: t('admin.disputeQueue.filters.homeowner', 'Homeowner') },
        { value: 'contractor', label: t('admin.disputeQueue.filters.contractor', 'Contractor') },
      ],
    },
  ];

  const columns: ColumnDef<DisputeQueueItem>[] = [
    {
      key: 'orderId',
      header: t('admin.disputeQueue.columns.orderId', 'Order ID'),
      render: (item) => (
        <span style={{ fontFamily: 'monospace', fontSize: typography.fontSize.xs }}>
          #{item.orderId.slice(0, 8)}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'supplier',
      header: t('admin.disputeQueue.columns.supplier', 'Supplier'),
      render: (item) => item.supplierName,
      sortable: true,
    },
    {
      key: 'buyerType',
      header: t('admin.disputeQueue.columns.buyerType', 'Buyer Type'),
      render: (item) => (
        item.buyerType === 'homeowner'
          ? t('auth.buyerRoleHomeowner', 'Homeowner')
          : t('auth.buyerRoleContractor', 'Contractor')
      ),
      width: '120px',
    },
    {
      key: 'issueCategory',
      header: t('admin.disputeQueue.columns.issueCategory', 'Issue Category'),
      render: (item) => (
        <span style={{ fontSize: typography.fontSize.sm }}>
          {item.issueCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'reportedAt',
      header: t('admin.disputeQueue.columns.reported', 'Reported'),
      render: (item) => formatDate(item.reportedAt),
      sortable: true,
      width: '100px',
    },
    {
      key: 'status',
      header: t('admin.disputeQueue.columns.status', 'Status'),
      render: (item) => getStatusBadge(item.status),
      sortable: true,
      width: '160px',
    },
    {
      key: 'outcome',
      header: t('admin.disputeQueue.columns.outcome', 'Outcome'),
      render: (item) => (
        item.outcome ? (
          <span style={{ fontSize: typography.fontSize.sm }}>{item.outcome}</span>
        ) : (
          <span style={{ color: colors.text.tertiary }}>—</span>
        )
      ),
      width: '140px',
    },
    {
      key: 'actions',
      header: t('admin.disputeQueue.columns.actions', 'Actions'),
      render: (item) => {
        const actions: ActionItem[] = [
          {
            id: 'view',
            label: t('admin.disputeQueue.actions.viewDetails', 'View Details'),
            icon: 'Eye',
            onClick: () => navigate(`/admin/disputes/${item.id}`),
          },
          {
            id: 'add-note',
            label: t('admin.disputeQueue.actions.addNote', 'Add Admin Note'),
            icon: 'Edit',
            onClick: () => {
              setSelectedDisputeId(item.id);
              setNoteModalOpen(true);
            },
          },
        ];

        if (item.status !== 'resolved') {
          actions.push({
            id: 'resolve',
            label: t('admin.disputeQueue.actions.markResolved', 'Mark Resolved'),
            icon: 'CheckCircle',
            onClick: () => handleResolve(item.id),
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
      issueCategory: 'all',
      buyerType: 'all',
    });
  };

  const openCount = data.filter(item => item.status === 'open').length;

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
          {t('admin.disputeQueue.title', 'Dispute Queue')}
        </h1>
        <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
          {t('admin.disputeQueue.subtitle', 'Monitor and track order disputes for trust metrics')}
        </p>
        {openCount > 0 && (
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
              ⚠ {openCount} open {openCount === 1 ? 'dispute' : 'disputes'}
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
          emptyMessage={t('admin.disputeQueue.empty', 'No disputes found')}
        />
      )}

      {/* Note Modal */}
      <AdminNoteModal
        isOpen={noteModalOpen}
        onClose={() => {
          setNoteModalOpen(false);
          setSelectedDisputeId(null);
        }}
        onSubmit={handleAddNote}
        title={t('admin.disputeQueue.addNoteTitle', 'Add Admin Note')}
        placeholder={t('admin.disputeQueue.addNotePlaceholder', 'Internal notes (not visible to users)...')}
      />
    </div>
  );
}
