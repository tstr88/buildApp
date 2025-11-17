/**
 * RFQ Queue Page
 * Admin page for managing RFQs and nudging suppliers
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

interface RFQQueueItem {
  id: string;
  buyerName: string;
  buyerType: 'homeowner' | 'contractor';
  itemsCount: number;
  suppliersSentTo: number;
  repliesReceived: number;
  ageHours: number;
  createdAt: string;
}

export function RFQQueue() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<RFQQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    zeroReplies: 'all',
    buyerType: 'all',
    region: 'all',
  });
  const [sortKey, setSortKey] = useState<string>('ageHours');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchRFQs();
  }, [token, filterValues, sortKey, sortDirection]);

  const fetchRFQs = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filterValues,
        sortKey,
        sortDirection,
      });

      const response = await fetch(`http://localhost:3001/api/admin/rfqs?${params}`, {
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
      console.error('Failed to fetch RFQ queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNudgeSuppliers = async (rfqId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/rfqs/${rfqId}/nudge-suppliers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert(t('admin.rfqQueue.nudgeSent', 'Nudge sent to suppliers'));
      }
    } catch (error) {
      console.error('Failed to nudge suppliers:', error);
    }
  };

  const handleBatchNudge = async () => {
    if (selectedItems.size === 0) return;

    for (const rfqId of selectedItems) {
      await handleNudgeSuppliers(rfqId);
    }
    setSelectedItems(new Set());
  };

  const filters: FilterDef[] = [
    {
      key: 'zeroReplies',
      label: t('admin.rfqQueue.filters.zeroReplies', 'Zero Replies'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.rfqQueue.filters.all', 'All') },
        { value: '24h', label: t('admin.rfqQueue.filters.24h', '>24 hours') },
        { value: '48h', label: t('admin.rfqQueue.filters.48h', '>48 hours') },
      ],
    },
    {
      key: 'buyerType',
      label: t('admin.rfqQueue.filters.buyerType', 'Buyer Type'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.rfqQueue.filters.all', 'All') },
        { value: 'homeowner', label: t('admin.rfqQueue.filters.homeowner', 'Homeowner') },
        { value: 'contractor', label: t('admin.rfqQueue.filters.contractor', 'Contractor') },
      ],
    },
    {
      key: 'region',
      label: t('admin.rfqQueue.filters.region', 'Region'),
      type: 'select',
      options: [
        { value: 'all', label: t('admin.rfqQueue.filters.all', 'All') },
        { value: 'tbilisi', label: t('admin.rfqQueue.filters.tbilisi', 'Tbilisi') },
        { value: 'other', label: t('admin.rfqQueue.filters.other', 'Other Regions') },
      ],
    },
  ];

  const columns: ColumnDef<RFQQueueItem>[] = [
    {
      key: 'id',
      header: t('admin.rfqQueue.columns.rfqId', 'RFQ ID'),
      render: (item) => (
        <span style={{ fontFamily: 'monospace', fontSize: typography.fontSize.xs }}>
          #{item.id.slice(0, 8)}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'buyer',
      header: t('admin.rfqQueue.columns.buyer', 'Buyer'),
      render: (item) => (
        <div>
          <div style={{ fontWeight: typography.fontWeight.medium }}>{item.buyerName}</div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
            {item.buyerType === 'homeowner' ? t('auth.buyerRoleHomeowner', 'Homeowner') : t('auth.buyerRoleContractor', 'Contractor')}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'items',
      header: t('admin.rfqQueue.columns.items', 'Items'),
      render: (item) => item.itemsCount,
      sortable: true,
      width: '80px',
    },
    {
      key: 'suppliers',
      header: t('admin.rfqQueue.columns.suppliersSent', 'Suppliers Sent To'),
      render: (item) => item.suppliersSentTo,
      sortable: true,
      width: '140px',
    },
    {
      key: 'replies',
      header: t('admin.rfqQueue.columns.replies', 'Replies'),
      render: (item) => (
        item.repliesReceived === 0 && item.ageHours > 24 ? (
          <AlertBadge count={0} severity="error" />
        ) : (
          <span>{item.repliesReceived}</span>
        )
      ),
      sortable: true,
      width: '100px',
    },
    {
      key: 'age',
      header: t('admin.rfqQueue.columns.age', 'Age'),
      render: (item) => (
        <span style={{ color: item.ageHours > 48 ? colors.error[600] : colors.text.primary }}>
          {item.ageHours}h
        </span>
      ),
      sortable: true,
      width: '80px',
    },
    {
      key: 'actions',
      header: t('admin.rfqQueue.columns.actions', 'Actions'),
      render: (item) => {
        const actions: ActionItem[] = [
          {
            id: 'view',
            label: t('admin.rfqQueue.actions.view', 'View RFQ'),
            icon: 'Eye',
            onClick: () => navigate(`/admin/rfqs/${item.id}`),
          },
          {
            id: 'nudge',
            label: t('admin.rfqQueue.actions.nudge', 'Nudge Suppliers'),
            icon: 'Send',
            onClick: () => handleNudgeSuppliers(item.id),
          },
          {
            id: 'suggest',
            label: t('admin.rfqQueue.actions.suggest', 'Suggest Suppliers'),
            icon: 'Users',
            onClick: () => navigate(`/admin/rfqs/${item.id}/suggest`),
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
      setSortDirection('desc');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues({ ...filterValues, [key]: value });
  };

  const handleResetFilters = () => {
    setFilterValues({
      zeroReplies: 'all',
      buyerType: 'all',
      region: 'all',
    });
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map(item => item.id)));
    }
  };

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
          {t('admin.rfqQueue.title', 'RFQ Queue')}
        </h1>
        <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
          {t('admin.rfqQueue.subtitle', 'Manage RFQs and nudge suppliers to respond')}
        </p>
      </div>

      {/* Filters */}
      <QueueFilters
        filters={filters}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Batch Actions */}
      {selectedItems.size > 0 && (
        <div
          style={{
            backgroundColor: colors.primary[50],
            padding: spacing[3],
            borderRadius: '8px',
            marginBottom: spacing[4],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
            {t('admin.rfqQueue.selected', '{{count}} selected', { count: selectedItems.size })}
          </span>
          <button
            onClick={handleBatchNudge}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: colors.primary[600],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: '6px',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            {t('admin.rfqQueue.actions.nudgeAll', 'Nudge All Selected')}
          </button>
        </div>
      )}

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
          selectable
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onSelectAll={handleSelectAll}
          emptyMessage={t('admin.rfqQueue.empty', 'No RFQs found')}
        />
      )}
    </div>
  );
}
