/**
 * Orders Page
 * List and manage all buyer's orders
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: colors.success[50], text: colors.success[700], border: colors.success[200] };
      case 'confirmed':
      case 'scheduled':
        return { bg: colors.primary[50], text: colors.primary[700], border: colors.primary[200] };
      case 'in_transit':
      case 'delivered':
        return { bg: colors.info[50], text: colors.info[700], border: colors.info[200] };
      case 'pending':
      case 'pending_schedule':
        return { bg: colors.warning[50], text: colors.warning[700], border: colors.warning[200] };
      case 'cancelled':
      case 'disputed':
        return { bg: colors.error[50], text: colors.error[700], border: colors.error[200] };
      default:
        return { bg: colors.neutral[50], text: colors.text.secondary, border: colors.border.light };
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t('ordersPage.status.pending'),
      pending_schedule: t('ordersPage.status.pendingSchedule'),
      scheduled: t('ordersPage.status.scheduled'),
      confirmed: t('ordersPage.status.confirmed'),
      in_transit: t('ordersPage.status.inTransit'),
      delivered: t('ordersPage.status.delivered'),
      completed: t('ordersPage.status.completed'),
      cancelled: t('ordersPage.status.cancelled'),
      disputed: t('ordersPage.status.disputed'),
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
  const activeCount = orders.filter(o => filterByTab({ ...o } as Order)).length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const disputedCount = orders.filter(o => o.status === 'disputed').length;

  const tabs = [
    { key: 'active' as TabType, label: t('ordersPage.tabs.active'), count: activeCount },
    { key: 'completed' as TabType, label: t('ordersPage.tabs.completed'), count: completedCount },
    { key: 'disputed' as TabType, label: t('ordersPage.tabs.disputed'), count: disputedCount, hasAlert: disputedCount > 0 },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        padding: spacing[4],
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: spacing[6],
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[4],
            marginBottom: spacing[4],
          }}
        >
          <div>
            <h1
              style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              {t('ordersPage.title')}
            </h1>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              {t('ordersPage.subtitle')}
            </p>
          </div>

          <button
            onClick={() => navigate('/orders/direct')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: colors.primary[600],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              cursor: 'pointer',
              boxShadow: shadows.sm,
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[700];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[600];
            }}
          >
            <Icons.Zap size={20} />
            {t('ordersPage.newDirectOrder')}
          </button>
        </div>

        {/* Tabs Navigation */}
        <div
          style={{
            display: 'flex',
            gap: spacing[1],
            marginBottom: spacing[6],
            borderBottom: `2px solid ${colors.border.light}`,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                style={{
                  padding: `${spacing[3]} ${spacing[4]}`,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  color: isActive ? colors.primary[600] : colors.text.secondary,
                  borderBottom: isActive ? `2px solid ${colors.primary[600]}` : '2px solid transparent',
                  marginBottom: '-2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  transition: 'all 200ms ease',
                  position: 'relative',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = colors.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = colors.text.secondary;
                  }
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    style={{
                      padding: `${spacing[0.5]} ${spacing[2]}`,
                      backgroundColor: tab.hasAlert ? colors.error[100] : colors.neutral[100],
                      color: tab.hasAlert ? colors.error[700] : colors.text.tertiary,
                      borderRadius: borderRadius.full,
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.hasAlert && (
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: colors.error[600],
                      position: 'absolute',
                      top: spacing[2],
                      right: spacing[2],
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ marginBottom: spacing[4] }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Icons.Search
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
              placeholder={t('ordersPage.searchPlaceholder')}
              style={{
                width: '100%',
                padding: `${spacing[3]} ${spacing[3]} ${spacing[3]} ${spacing[10]}`,
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                backgroundColor: colors.neutral[0],
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
      </div>

      {/* Orders List */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {loading ? (
          <div
            style={{
              padding: spacing[12],
              textAlign: 'center',
            }}
          >
            <Icons.Loader
              size={48}
              color={colors.text.tertiary}
              style={{ margin: '0 auto', marginBottom: spacing[3] }}
            />
            <p
              style={{
                fontSize: typography.fontSize.lg,
                color: colors.text.tertiary,
                margin: 0,
              }}
            >
              {t('ordersPage.loading')}
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            style={{
              padding: spacing[12],
              textAlign: 'center',
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <Icons.Package
              size={64}
              color={colors.text.tertiary}
              style={{ margin: '0 auto', marginBottom: spacing[4] }}
            />
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              {t('ordersPage.empty.title')}
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing[4],
              }}
            >
              {searchQuery
                ? t('ordersPage.empty.tryAdjust')
                : t('ordersPage.empty.startFirst')}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/orders/direct')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[3]} ${spacing[6]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                }}
              >
                <Icons.Plus size={20} />
                {t('ordersPage.placeDirectOrder')}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {filteredOrders.map((order) => {
              const statusColors = getStatusColor(order.status);
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.order_number}`)}
                  style={{
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.border.light}`,
                    padding: spacing[3],
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = shadows.md;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Header: Order number and status */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: spacing[2],
                      gap: spacing[2],
                    }}
                  >
                    <h3
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {order.order_number}
                    </h3>
                    <div
                      style={{
                        padding: `${spacing[0.5]} ${spacing[2]}`,
                        backgroundColor: statusColors.bg,
                        border: `1px solid ${statusColors.border}`,
                        borderRadius: borderRadius.full,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                          color: statusColors.text,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Supplier name */}
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      margin: 0,
                      marginBottom: spacing[3],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {order.supplier_name}
                  </p>

                  {/* Compact info grid - 2 columns max on mobile */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: spacing[2],
                      padding: spacing[2],
                      backgroundColor: colors.neutral[50],
                      borderRadius: borderRadius.md,
                    }}
                  >
                    {/* Total amount */}
                    <div>
                      <p
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          margin: 0,
                          marginBottom: spacing[0.5],
                        }}
                      >
                        {t('ordersPage.fields.totalAmount')}
                      </p>
                      <p
                        style={{
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                          margin: 0,
                        }}
                      >
                        ₾{Number(order.grand_total || order.total_amount || 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Order date */}
                    <div>
                      <p
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          margin: 0,
                          marginBottom: spacing[0.5],
                        }}
                      >
                        {t('ordersPage.fields.orderDate')}
                      </p>
                      <p
                        style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.text.primary,
                          margin: 0,
                        }}
                      >
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    {/* Delivery/Pickup */}
                    <div style={{ gridColumn: order.promised_window_start ? 'auto' : '1 / -1' }}>
                      <p
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          margin: 0,
                          marginBottom: spacing[0.5],
                        }}
                      >
                        {order.pickup_or_delivery === 'pickup' ? t('ordersPage.fields.pickup') : t('ordersPage.fields.delivery')}
                      </p>
                      <p
                        style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.text.primary,
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[1],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {order.pickup_or_delivery === 'pickup' ? (
                          <Icons.MapPin size={14} style={{ flexShrink: 0 }} />
                        ) : (
                          <Icons.Truck size={14} style={{ flexShrink: 0 }} />
                        )}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.project_name || t('ordersPage.fields.depot')}
                        </span>
                      </p>
                    </div>

                    {/* Scheduled date (if exists) */}
                    {order.promised_window_start && (
                      <div>
                        <p
                          style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.text.tertiary,
                            margin: 0,
                            marginBottom: spacing[0.5],
                          }}
                        >
                          {t('ordersPage.fields.scheduled')}
                        </p>
                        <p
                          style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.text.primary,
                            margin: 0,
                          }}
                        >
                          {formatDate(order.promised_window_start)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
