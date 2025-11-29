/**
 * Orders Page
 * List and manage all buyer's orders
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, MapPin, Truck, Calendar, Search } from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../theme/tokens';
import { TabNavigation, PageHeader, EmptyState, StatusBadge, ListCard } from '../components/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Order {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name: string;
  project_id?: string;
  project_name?: string;
  order_type: 'material' | 'rental';
  total_amount: number;
  grand_total: number;
  pickup_or_delivery: 'pickup' | 'delivery';
  promised_window_start?: string;
  promised_window_end?: string;
  payment_terms: string;
  status: 'pending' | 'pending_schedule' | 'scheduled' | 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  created_at: string;
  updated_at: string;
}

type TabType = 'active' | 'completed' | 'disputed';

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(
        `${API_URL}/api/buyers/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab as TabType);
  };

  const getStatusType = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'pending',
      pending_schedule: 'pending',
      scheduled: 'scheduled',
      confirmed: 'confirmed',
      in_transit: 'in_transit',
      delivered: 'delivered',
      completed: 'completed',
      cancelled: 'cancelled',
      disputed: 'disputed',
    };
    return statusMap[status] || 'pending';
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t('ordersPage.status.pending', 'Pending'),
      pending_schedule: t('ordersPage.status.pendingSchedule', 'Needs Scheduling'),
      scheduled: t('ordersPage.status.scheduled', 'Scheduled'),
      confirmed: t('ordersPage.status.confirmed', 'Confirmed'),
      in_transit: t('ordersPage.status.inTransit', 'In Transit'),
      delivered: t('ordersPage.status.delivered', 'Delivered'),
      completed: t('ordersPage.status.completed', 'Completed'),
      cancelled: t('ordersPage.status.cancelled', 'Cancelled'),
      disputed: t('ordersPage.status.disputed', 'Disputed'),
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter orders by tab
  const filterByTab = (order: Order) => {
    if (selectedTab === 'active') {
      return ['pending', 'pending_schedule', 'scheduled', 'confirmed', 'in_transit', 'delivered'].includes(order.status);
    } else if (selectedTab === 'completed') {
      return order.status === 'completed';
    } else if (selectedTab === 'disputed') {
      return order.status === 'disputed';
    }
    return false;
  };

  const filteredOrders = orders.filter((order) => {
    // Apply tab filter first
    if (!filterByTab(order)) return false;

    // Then apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(query) ||
        order.supplier_name?.toLowerCase().includes(query) ||
        order.project_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Count orders by tab for badges
  const activeCount = orders.filter(o => ['pending', 'pending_schedule', 'scheduled', 'confirmed', 'in_transit', 'delivered'].includes(o.status)).length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const disputedCount = orders.filter(o => o.status === 'disputed').length;

  const tabs = [
    { id: 'active', label: t('ordersPage.tabs.active', 'Active'), count: activeCount },
    { id: 'completed', label: t('ordersPage.tabs.completed', 'Completed'), count: completedCount },
    { id: 'disputed', label: t('ordersPage.tabs.disputed', 'Disputed'), count: disputedCount, hasAlert: disputedCount > 0 },
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
        title={t('ordersPage.title', 'My Orders')}
        subtitle={t('ordersPage.subtitle', 'Track and manage your orders')}
      />

      <TabNavigation
        tabs={tabs}
        activeTab={selectedTab}
        onTabChange={handleTabChange}
      />

      {/* Search */}
      <div style={{ marginBottom: spacing[4] }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search
            size={20}
            color={colors.text.tertiary}
            style={{
              position: 'absolute',
              left: spacing[3],
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('ordersPage.searchPlaceholder', 'Search orders...')}
            style={{
              width: '100%',
              padding: `${spacing[3]} ${spacing[3]} ${spacing[3]} ${spacing[10]}`,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              backgroundColor: colors.neutral[0],
              outline: 'none',
              transition: 'border-color 200ms ease, box-shadow 200ms ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary[600];
              e.target.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border.light;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
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
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t('ordersPage.empty.title', 'No orders found')}
          description={
            searchQuery
              ? t('ordersPage.empty.tryAdjust', 'Try adjusting your search')
              : t('ordersPage.empty.startFirst', 'Your orders will appear here')
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {filteredOrders.map((order) => (
            <ListCard
              key={order.id}
              onClick={() => navigate(`/orders/${order.order_number}`)}
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
                    {order.order_number}
                  </span>

                  {/* Status Badge */}
                  <StatusBadge
                    status={getStatusType(order.status)}
                    label={getStatusLabel(order.status)}
                    size="sm"
                  />
                </div>

                <span style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, whiteSpace: 'nowrap' }}>
                  {formatDate(order.created_at)}
                </span>
              </div>

              {/* Supplier Name */}
              <div
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing[3],
                }}
              >
                {order.supplier_name}
              </div>

              {/* Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: spacing[4],
                }}
              >
                {/* Total Amount */}
                <div>
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      marginBottom: spacing[1],
                    }}
                  >
                    {t('ordersPage.fields.totalAmount', 'Total')}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.success[600],
                    }}
                  >
                    ₾{Number(order.grand_total || order.total_amount || 0).toFixed(2)}
                  </div>
                </div>

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
                    {order.pickup_or_delivery === 'pickup' ? <MapPin size={12} /> : <Truck size={12} />}
                    {order.pickup_or_delivery === 'pickup'
                      ? t('ordersPage.fields.pickup', 'Pickup')
                      : t('ordersPage.fields.delivery', 'Delivery')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    {order.project_name || t('ordersPage.fields.depot', 'Depot')}
                  </div>
                </div>

                {/* Scheduled Date */}
                {order.promised_window_start && (
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
                      {t('ordersPage.fields.scheduled', 'Scheduled')}
                    </div>
                    <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                      {formatDate(order.promised_window_start)}
                    </div>
                  </div>
                )}
              </div>
            </ListCard>
          ))}
        </div>
      )}
    </div>
  );
};
