/**
 * Supplier Direct Orders Inbox
 * View and manage direct orders from buyers
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { useWebSocket } from '../context/WebSocketContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type TabType = 'new' | 'scheduled' | 'in_progress' | 'completed';

interface DirectOrderCard {
  id: string;
  order_id: string;
  buyer_type: 'homeowner' | 'contractor';
  buyer_name: string;
  item_count: number;
  total_amount: number;
  delivery_type: 'pickup' | 'delivery';
  status: 'pending_schedule' | 'window_proposed' | 'scheduled' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  scheduled_window_start?: string;
  scheduled_window_end?: string;
  created_at: string;
  relative_time: string;
}

export function SupplierDirectOrdersInbox() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>((searchParams.get('tab') as TabType) || 'new');
  const [orders, setOrders] = useState<DirectOrderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    new: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
  });
  const { socket, subscribeToOrders, unsubscribeFromOrders } = useWebSocket();

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['new', 'scheduled', 'in_progress', 'completed'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!socket) return;

    // Subscribe to orders list updates
    subscribeToOrders();

    // Listen for orders list update event
    const handleOrdersListUpdate = () => {
      console.log('[SupplierDirectOrdersInbox] Orders list updated, refreshing...');
      fetchOrders();
    };

    socket.on('orders:list-updated', handleOrdersListUpdate);

    // Cleanup on unmount
    return () => {
      socket.off('orders:list-updated', handleOrdersListUpdate);
      unsubscribeFromOrders();
    };
  }, [socket, subscribeToOrders, unsubscribeFromOrders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/suppliers/orders/direct?tab=${activeTab}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setCounts(data.counts || counts);
      }
    } catch (error) {
      console.error('Failed to fetch direct orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
      pending: { label: t('supplierOrders.status.needsScheduling', 'Needs Scheduling'), color: colors.warning[700], bgColor: colors.warning[100] },
      confirmed: { label: t('supplierOrders.status.scheduled', 'Scheduled'), color: colors.success[700], bgColor: colors.success[100] },
      in_transit: { label: t('supplierOrders.status.inTransit', 'In Transit'), color: colors.primary[700], bgColor: colors.primary[100] },
      delivered: { label: t('supplierOrders.status.delivered', 'Delivered'), color: colors.info[700], bgColor: colors.info[100] },
      completed: { label: t('supplierOrders.status.completed', 'Completed'), color: colors.success[700], bgColor: colors.success[100] },
      cancelled: { label: t('supplierOrders.status.cancelled', 'Cancelled'), color: colors.neutral[700], bgColor: colors.neutral[100] },
      disputed: { label: t('supplierOrders.status.disputed', 'Disputed'), color: colors.error[700], bgColor: colors.error[100] },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        style={{
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
          padding: `${spacing[1]} ${spacing[2]}`,
          borderRadius: borderRadius.sm,
          backgroundColor: config.bgColor,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatDeliveryWindow = (start?: string, _end?: string) => {
    if (!start) return t('supplierOrders.needsScheduling', 'Needs scheduling');

    const startDate = new Date(start);
    const dateStr = startDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
      }}
    >
      <div
        style={{
          maxWidth: '100%',
          padding: `${spacing[4]} ${spacing[3]}`,
          paddingBottom: spacing[10],
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: spacing[5] }}>
          <h1
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[1.5],
              letterSpacing: '-0.02em',
            }}
          >
            {t('supplierOrders.title', 'Direct Orders')}
          </h1>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              margin: 0,
              lineHeight: '1.5',
            }}
          >
            {t('supplierOrders.subtitle', 'Manage direct orders and deliveries')}
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: spacing[2],
            marginBottom: spacing[4],
            borderBottom: `2px solid ${colors.border.light}`,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            marginLeft: `-${spacing[3]}`,
            marginRight: `-${spacing[3]}`,
            paddingLeft: spacing[3],
            paddingRight: spacing[3],
          }}
        >
        <button
          onClick={() => handleTabChange('new')}
          style={{
            padding: `${spacing[2.5]} ${spacing[3]}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `3px solid ${activeTab === 'new' ? colors.primary[600] : 'transparent'}`,
            color: activeTab === 'new' ? colors.primary[600] : colors.text.secondary,
            fontSize: typography.fontSize.sm,
            fontWeight: activeTab === 'new' ? typography.fontWeight.semibold : typography.fontWeight.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1.5],
            transition: 'all 0.2s',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            marginBottom: '-2px',
          }}
        >
          {t('supplierOrders.tabs.new', 'New')}
          {counts.new > 0 && (
            <span
              style={{
                backgroundColor: colors.error[500],
                color: colors.neutral[0],
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.bold,
                padding: `${spacing[0.5]} ${spacing[1.5]}`,
                borderRadius: borderRadius.full,
                minWidth: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {counts.new}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('scheduled')}
          style={{
            padding: `${spacing[2.5]} ${spacing[3]}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `3px solid ${activeTab === 'scheduled' ? colors.primary[600] : 'transparent'}`,
            color: activeTab === 'scheduled' ? colors.primary[600] : colors.text.secondary,
            fontSize: typography.fontSize.sm,
            fontWeight: activeTab === 'scheduled' ? typography.fontWeight.semibold : typography.fontWeight.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1.5],
            transition: 'all 0.2s',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            marginBottom: '-2px',
          }}
        >
          {t('supplierOrders.tabs.scheduled', 'Scheduled')}
          {counts.scheduled > 0 && (
            <span
              style={{
                backgroundColor: colors.neutral[400],
                color: colors.neutral[0],
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.bold,
                padding: `${spacing[0.5]} ${spacing[1.5]}`,
                borderRadius: borderRadius.full,
                minWidth: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {counts.scheduled}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('in_progress')}
          style={{
            padding: `${spacing[2.5]} ${spacing[3]}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `3px solid ${activeTab === 'in_progress' ? colors.primary[600] : 'transparent'}`,
            color: activeTab === 'in_progress' ? colors.primary[600] : colors.text.secondary,
            fontSize: typography.fontSize.sm,
            fontWeight: activeTab === 'in_progress' ? typography.fontWeight.semibold : typography.fontWeight.medium,
            cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            marginBottom: '-2px',
          }}
        >
          {t('supplierOrders.tabs.inProgress', 'In Progress')}
        </button>

        <button
          onClick={() => handleTabChange('completed')}
          style={{
            padding: `${spacing[2.5]} ${spacing[3]}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `3px solid ${activeTab === 'completed' ? colors.primary[600] : 'transparent'}`,
            color: activeTab === 'completed' ? colors.primary[600] : colors.text.secondary,
            fontSize: typography.fontSize.sm,
            fontWeight: activeTab === 'completed' ? typography.fontWeight.semibold : typography.fontWeight.medium,
            cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            marginBottom: '-2px',
          }}
        >
          {t('supplierOrders.tabs.completed', 'Completed')}
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
          }}
        >
          <div style={{ color: colors.text.tertiary }}>{t('common.loading')}</div>
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: spacing[8],
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
          }}
        >
          <Icons.Package size={48} color={colors.neutral[400]} style={{ marginBottom: spacing[3] }} />
          <div
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            {t('supplierOrders.noOrders', 'No orders found')}
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
            {activeTab === 'new' && t('supplierOrders.noNewOrders', 'New orders will appear here')}
            {activeTab === 'scheduled' && t('supplierOrders.noScheduledOrders', 'Scheduled orders will appear here')}
            {activeTab === 'in_progress' && t('supplierOrders.noInProgressOrders', 'Orders in progress will appear here')}
            {activeTab === 'completed' && t('supplierOrders.noCompletedOrders', 'Completed orders will appear here')}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/supplier/orders/${order.order_id}`)}
              style={{
                backgroundColor: colors.neutral[0],
                padding: spacing[4],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.border.light}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = shadows.md;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Header: Order number and status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing[2.5],
                gap: spacing[2],
              }}>
                <h3 style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0,
                  letterSpacing: '-0.01em',
                }}>
                  #{order.order_id.slice(0, 8)}
                </h3>
                <span
                  style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    padding: `${spacing[1]} ${spacing[2.5]}`,
                    borderRadius: borderRadius.full,
                    backgroundColor: order.status === 'pending' ? colors.warning[100] : colors.success[100],
                    color: order.status === 'pending' ? colors.warning[700] : colors.success[700],
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {order.status === 'pending' ? t('supplierOrders.status.needsScheduling', 'New') : t('supplierOrders.status.scheduled', 'Scheduled')}
                </span>
              </div>

              {/* Buyer name */}
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing[3],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: '1.5',
              }}>
                {order.buyer_name}
              </p>

              {/* Info grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: spacing[3],
                marginBottom: spacing[3],
                padding: spacing[3],
                backgroundColor: colors.neutral[50],
                borderRadius: borderRadius.md,
              }}>
                {/* Delivery/Pickup type */}
                <div>
                  <div style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    marginBottom: spacing[1],
                    fontWeight: typography.fontWeight.medium,
                  }}>
                    Type
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    fontWeight: typography.fontWeight.medium,
                  }}>
                    {order.delivery_type === 'pickup' ? <Icons.Package size={14} /> : <Icons.Truck size={14} />}
                    {order.delivery_type === 'pickup' ? t('common.pickup', 'Pickup') : t('common.delivery', 'Delivery')}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    marginBottom: spacing[1],
                    fontWeight: typography.fontWeight.medium,
                  }}>
                    Items
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.medium,
                  }}>
                    {order.item_count}
                  </div>
                </div>

                {/* Total Amount - spans full width */}
                <div style={{ gridColumn: '1 / -1', paddingTop: spacing[2], borderTop: `1px solid ${colors.border.light}` }}>
                  <div style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    marginBottom: spacing[1],
                    fontWeight: typography.fontWeight.medium,
                  }}>
                    Total Amount
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.lg,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.bold,
                  }}>
                    ₾{Number(order.total_amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Window info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: spacing[2.5],
                backgroundColor: colors.primary[50],
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.primary[100]}`,
              }}>
                <Icons.Calendar size={16} style={{ flexShrink: 0, color: colors.primary[600] }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.primary[700],
                    marginBottom: spacing[0.5],
                    fontWeight: typography.fontWeight.medium,
                  }}>
                    {order.delivery_type === 'pickup' ? t('supplierOrders.pickupWindow', 'Pickup Window') : t('supplierOrders.deliveryWindow', 'Delivery Window')}
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.primary[900],
                    fontWeight: typography.fontWeight.semibold,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {formatDeliveryWindow(order.scheduled_window_start, order.scheduled_window_end)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
