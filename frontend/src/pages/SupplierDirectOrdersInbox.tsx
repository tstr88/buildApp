/**
 * Supplier Direct Orders Inbox
 * View and manage direct orders from buyers
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Truck, Calendar } from 'lucide-react';
import { colors, spacing, typography } from '../theme/tokens';
import { useWebSocket } from '../context/WebSocketContext';
import { TabNavigation, PageHeader, EmptyState, StatusBadge, ListCard } from '../components/shared';

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
  const { t, i18n } = useTranslation();
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

    subscribeToOrders();

    const handleOrdersListUpdate = () => {
      console.log('[SupplierDirectOrdersInbox] Orders list updated, refreshing...');
      fetchOrders();
    };

    socket.on('orders:list-updated', handleOrdersListUpdate);

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    setSearchParams({ tab });
  };

  const formatDeliveryWindow = (start?: string, _end?: string) => {
    if (!start) return t('supplierOrders.needsScheduling', 'Needs scheduling');

    const startDate = new Date(start);
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';
    const dateStr = startDate.toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = startDate.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  };

  const getStatusType = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending_schedule: 'pending',
      window_proposed: 'pending',
      scheduled: 'scheduled',
      in_transit: 'in_transit',
      delivered: 'delivered',
      completed: 'completed',
      cancelled: 'cancelled',
      disputed: 'disputed',
    };
    return statusMap[status] || 'pending';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending_schedule: t('supplierOrders.status.needsScheduling', 'Needs Scheduling'),
      window_proposed: t('supplierOrders.status.windowProposed', 'Window Proposed'),
      scheduled: t('supplierOrders.status.scheduled', 'Scheduled'),
      in_transit: t('supplierOrders.status.inTransit', 'In Transit'),
      delivered: t('supplierOrders.status.delivered', 'Delivered'),
      completed: t('supplierOrders.status.completed', 'Completed'),
      cancelled: t('supplierOrders.status.cancelled', 'Cancelled'),
      disputed: t('supplierOrders.status.disputed', 'Disputed'),
    };
    return labels[status] || status;
  };

  const tabs = [
    { id: 'new', label: t('supplierOrders.tabs.new', 'New'), count: counts.new, hasAlert: counts.new > 0 },
    { id: 'scheduled', label: t('supplierOrders.tabs.scheduled', 'Scheduled'), count: counts.scheduled },
    { id: 'in_progress', label: t('supplierOrders.tabs.inProgress', 'In Progress'), count: counts.in_progress },
    { id: 'completed', label: t('supplierOrders.tabs.completed', 'Completed'), count: counts.completed },
  ];

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: spacing[6],
      }}
    >
      <PageHeader
        title={t('supplierOrders.title', 'Direct Orders')}
        subtitle={t('supplierOrders.subtitle', 'Manage direct orders and deliveries')}
      />

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

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
        <EmptyState
          icon={Package}
          title={t('supplierOrders.noOrders', 'No orders found')}
          description={
            activeTab === 'new'
              ? t('supplierOrders.noNewOrders', 'New orders will appear here')
              : activeTab === 'scheduled'
                ? t('supplierOrders.noScheduledOrders', 'Scheduled orders will appear here')
                : activeTab === 'in_progress'
                  ? t('supplierOrders.noInProgressOrders', 'Orders in progress will appear here')
                  : t('supplierOrders.noCompletedOrders', 'Completed orders will appear here')
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {orders.map((order) => (
            <ListCard
              key={order.id}
              onClick={() => navigate(`/supplier/orders/${order.order_id}`)}
              isUnread={activeTab === 'new'}
            >
              {/* Header Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: spacing[3],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}
                  >
                    Order #{order.order_id.slice(0, 8)}
                  </span>

                  {/* Buyer Type Badge */}
                  <StatusBadge
                    status={order.buyer_type}
                    label={order.buyer_type === 'homeowner' ? t('common.homeowner', 'Homeowner') : t('common.contractor', 'Contractor')}
                    size="sm"
                  />

                  {/* Status Badge */}
                  <StatusBadge
                    status={getStatusType(order.status)}
                    label={getStatusLabel(order.status)}
                    size="sm"
                  />
                </div>

                <span style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, whiteSpace: 'nowrap' }}>
                  {order.relative_time}
                </span>
              </div>

              {/* Buyer Name */}
              <div
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing[3],
                }}
              >
                {order.buyer_name}
              </div>

              {/* Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: spacing[4],
                }}
              >
                {/* Delivery/Pickup Type */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      marginBottom: spacing[1],
                    }}
                  >
                    {order.delivery_type === 'pickup' ? <Package size={12} /> : <Truck size={12} />}
                    {t('supplierOrders.type', 'Type')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    {order.delivery_type === 'pickup' ? t('common.pickup', 'Pickup') : t('common.delivery', 'Delivery')}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      marginBottom: spacing[1],
                    }}
                  >
                    <Package size={12} />
                    {t('supplierOrders.items', 'Items')}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                    }}
                  >
                    {order.item_count} {t('common.items', 'items')}
                  </div>
                </div>

                {/* Delivery/Pickup Window */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      marginBottom: spacing[1],
                    }}
                  >
                    <Calendar size={12} />
                    {order.delivery_type === 'pickup'
                      ? t('supplierOrders.pickupWindow', 'Pickup')
                      : t('supplierOrders.deliveryWindow', 'Delivery')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    {formatDeliveryWindow(order.scheduled_window_start, order.scheduled_window_end)}
                  </div>
                </div>

                {/* Total Amount */}
                <div>
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      marginBottom: spacing[1],
                    }}
                  >
                    {t('supplierOrders.totalAmount', 'Total')}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.success[600],
                    }}
                  >
                    ₾{Number(order.total_amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </ListCard>
          ))}
        </div>
      )}
    </div>
  );
}
