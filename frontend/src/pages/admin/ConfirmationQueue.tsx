/**
 * Confirmation Queue Page
 * Admin page for monitoring expiring confirmations and sending reminders
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme/tokens';
import { AdminQueueTable, type ColumnDef } from '../../components/admin/AdminQueueTable';
import { ActionDropdown, type ActionItem } from '../../components/admin/ActionDropdown';
import { AlertBadge } from '../../components/AlertBadge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ConfirmationItem {
  id: string;
  orderId: string;
  type: 'delivery' | 'handover' | 'return';
  buyerName: string;
  buyerPhone: string;
  timeRemainingMinutes: number;
  deadline: string;
}

export function ConfirmationQueue() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'expiring' | 'auto_completed'>('expiring');
  const [expiringData, setExpiringData] = useState<ConfirmationItem[]>([]);
  const [autoCompletedData, setAutoCompletedData] = useState<ConfirmationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfirmations();
  }, [token, activeTab]);

  const fetchConfirmations = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/confirmations?tab=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (activeTab === 'expiring') {
          setExpiringData(result.data);
        } else {
          setAutoCompletedData(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch confirmation queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/confirmations/${id}/remind`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert(t('admin.confirmationQueue.reminderSent', 'SMS reminder sent to buyer'));
      }
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };

  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}min`;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      delivery: { color: colors.primary[600], label: 'Delivery' },
      handover: { color: colors.warning[600], label: 'Handover' },
      return: { color: colors.info[600], label: 'Return' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.delivery;

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

  const expiringColumns: ColumnDef<ConfirmationItem>[] = [
    {
      key: 'orderId',
      header: t('admin.confirmationQueue.columns.orderId', 'Order/Booking ID'),
      render: (item) => (
        <span style={{ fontFamily: 'monospace', fontSize: typography.fontSize.xs }}>
          #{item.orderId.slice(0, 8)}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'type',
      header: t('admin.confirmationQueue.columns.type', 'Type'),
      render: (item) => getTypeBadge(item.type),
      width: '100px',
    },
    {
      key: 'buyer',
      header: t('admin.confirmationQueue.columns.buyer', 'Buyer'),
      render: (item) => (
        <div>
          <div style={{ fontWeight: typography.fontWeight.medium }}>{item.buyerName}</div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
            {item.buyerPhone}
          </div>
        </div>
      ),
    },
    {
      key: 'timeRemaining',
      header: t('admin.confirmationQueue.columns.timeRemaining', 'Time Remaining'),
      render: (item) => {
        const isUrgent = item.timeRemainingMinutes < 120; // Less than 2 hours
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            {isUrgent && <AlertBadge count={item.timeRemainingMinutes} severity="error" />}
            {!isUrgent && (
              <span style={{ color: colors.warning[600], fontWeight: typography.fontWeight.semibold }}>
                {formatTimeRemaining(item.timeRemainingMinutes)}
              </span>
            )}
          </div>
        );
      },
      sortable: true,
      width: '140px',
    },
    {
      key: 'actions',
      header: t('admin.confirmationQueue.columns.actions', 'Actions'),
      render: (item) => {
        const actions: ActionItem[] = [
          {
            id: 'send-reminder',
            label: t('admin.confirmationQueue.actions.sendReminder', 'Send SMS Reminder'),
            icon: 'Send',
            onClick: () => handleSendReminder(item.id),
          },
          {
            id: 'call',
            label: t('admin.confirmationQueue.actions.callBuyer', 'Call Buyer'),
            icon: 'Phone',
            onClick: () => window.open(`tel:${item.buyerPhone}`),
          },
        ];
        return <ActionDropdown actions={actions} />;
      },
      width: '80px',
    },
  ];

  const autoCompletedColumns: ColumnDef<ConfirmationItem>[] = [
    {
      key: 'orderId',
      header: t('admin.confirmationQueue.columns.orderId', 'Order/Booking ID'),
      render: (item) => (
        <span style={{ fontFamily: 'monospace', fontSize: typography.fontSize.xs }}>
          #{item.orderId.slice(0, 8)}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'type',
      header: t('admin.confirmationQueue.columns.type', 'Type'),
      render: (item) => getTypeBadge(item.type),
      width: '100px',
    },
    {
      key: 'buyer',
      header: t('admin.confirmationQueue.columns.buyer', 'Buyer'),
      render: (item) => (
        <div>
          <div style={{ fontWeight: typography.fontWeight.medium }}>{item.buyerName}</div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
            {item.buyerPhone}
          </div>
        </div>
      ),
    },
    {
      key: 'deadline',
      header: t('admin.confirmationQueue.columns.autoCompletedAt', 'Auto-Completed At'),
      render: (item) => new Date(item.deadline).toLocaleString(),
      width: '180px',
    },
    {
      key: 'actions',
      header: t('admin.confirmationQueue.columns.actions', 'Actions'),
      render: (item) => {
        const actions: ActionItem[] = [
          {
            id: 'view',
            label: t('admin.confirmationQueue.actions.viewOrder', 'View Order'),
            icon: 'Eye',
            onClick: () => {}, // Navigate to order details
          },
        ];
        return <ActionDropdown actions={actions} />;
      },
      width: '80px',
    },
  ];

  const currentData = activeTab === 'expiring' ? expiringData : autoCompletedData;
  const currentColumns = activeTab === 'expiring' ? expiringColumns : autoCompletedColumns;
  const urgentCount = expiringData.filter(item => item.timeRemainingMinutes < 120).length;

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
          {t('admin.confirmationQueue.title', 'Confirmation Queue')}
        </h1>
        <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
          {t('admin.confirmationQueue.subtitle', 'Monitor expiring buyer confirmations and send reminders')}
        </p>
        {activeTab === 'expiring' && urgentCount > 0 && (
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
              ⚠ {urgentCount} {urgentCount === 1 ? 'confirmation' : 'confirmations'} expiring soon {'(<2 hours)'}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: spacing[2],
          marginBottom: spacing[4],
          borderBottom: `1px solid ${colors.border.light}`,
        }}
      >
        <button
          onClick={() => setActiveTab('expiring')}
          style={{
            padding: `${spacing[3]} ${spacing[4]}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'expiring' ? colors.primary[600] : 'transparent'}`,
            color: activeTab === 'expiring' ? colors.primary[600] : colors.text.secondary,
            fontWeight: activeTab === 'expiring' ? typography.fontWeight.semibold : typography.fontWeight.normal,
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
          }}
        >
          {t('admin.confirmationQueue.tabs.expiringSoon', 'Expiring Soon')}
          {urgentCount > 0 && (
            <span
              style={{
                marginLeft: spacing[2],
                backgroundColor: colors.error[500],
                color: colors.neutral[0],
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: typography.fontWeight.bold,
              }}
            >
              {urgentCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('auto_completed')}
          style={{
            padding: `${spacing[3]} ${spacing[4]}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'auto_completed' ? colors.primary[600] : 'transparent'}`,
            color: activeTab === 'auto_completed' ? colors.primary[600] : colors.text.secondary,
            fontWeight: activeTab === 'auto_completed' ? typography.fontWeight.semibold : typography.fontWeight.normal,
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
          }}
        >
          {t('admin.confirmationQueue.tabs.autoCompleted', 'Auto-Completed')}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: spacing[8], color: colors.text.tertiary }}>
          {t('common.loading', 'Loading...')}
        </div>
      ) : (
        <AdminQueueTable
          columns={currentColumns}
          data={currentData}
          keyExtractor={(item) => item.id}
          emptyMessage={
            activeTab === 'expiring'
              ? t('admin.confirmationQueue.emptyExpiring', 'No expiring confirmations')
              : t('admin.confirmationQueue.emptyAutoCompleted', 'No auto-completed orders')
          }
        />
      )}
    </div>
  );
}
