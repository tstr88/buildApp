/**
 * Orders Page
 * List and manage all buyer's orders
 * Professional modern design matching RFQs inbox style
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, heights } from '../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

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

type TabType = 'active' | 'completed' | 'cancelled';

// Generate a short reference code from order number
const getOrderCode = (orderNumber: string): string => {
  return `#${orderNumber}`;
};

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  const formatCurrency = (amount: number) => {
    return `₾${Number(amount || 0).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_schedule':
        return { bg: colors.warning[100], text: colors.warning[700], border: colors.warning[200] };
      case 'scheduled':
      case 'confirmed':
        return { bg: colors.info[100], text: colors.info[700], border: colors.info[200] };
      case 'in_transit':
        return { bg: colors.primary[100], text: colors.primary[700], border: colors.primary[200] };
      case 'delivered':
        return { bg: colors.success[100], text: colors.success[700], border: colors.success[200] };
      case 'completed':
        return { bg: colors.success[100], text: colors.success[700], border: colors.success[200] };
      case 'cancelled':
        return { bg: colors.neutral[100], text: colors.neutral[600], border: colors.neutral[200] };
      case 'disputed':
        return { bg: colors.error[100], text: colors.error[700], border: colors.error[200] };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[600], border: colors.neutral[200] };
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
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
    return labels[status] || status;
  };

  // Filter orders by tab
  const filterByTab = (order: Order) => {
    if (activeTab === 'active') {
      return ['pending', 'pending_schedule', 'scheduled', 'confirmed', 'in_transit', 'delivered'].includes(order.status);
    } else if (activeTab === 'completed') {
      return order.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return ['cancelled', 'disputed'].includes(order.status);
    }
    return false;
  };

  const filteredOrders = orders.filter(filterByTab);

  // Count for tabs
  const activeCount = orders.filter((o) =>
    ['pending', 'pending_schedule', 'scheduled', 'confirmed', 'in_transit', 'delivered'].includes(o.status)
  ).length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const cancelledCount = orders.filter((o) => ['cancelled', 'disputed'].includes(o.status)).length;

  // Check for orders needing attention (pending or in_transit)
  const needsAttentionCount = orders.filter((o) =>
    ['pending', 'pending_schedule', 'in_transit'].includes(o.status)
  ).length;

  const tabs = [
    { id: 'active', label: t('ordersPage.tabs.active', 'Active'), icon: Icons.Package, badge: needsAttentionCount > 0 ? needsAttentionCount : undefined },
    { id: 'completed', label: t('ordersPage.tabs.completed', 'Completed'), icon: Icons.CheckCircle },
    { id: 'cancelled', label: t('ordersPage.tabs.cancelled', 'Cancelled'), icon: Icons.XCircle },
  ];

  // Mobile Layout
  if (isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.neutral[100],
          paddingBottom: `calc(${heights.bottomNav} + env(safe-area-inset-bottom, 0px) + 20px)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: colors.primary[600],
            padding: spacing[4],
            paddingTop: `calc(${spacing[4]} + env(safe-area-inset-top, 0px))`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[0],
                  margin: 0,
                }}
              >
                {t('ordersPage.title', 'My Orders')}
              </h1>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  marginTop: spacing[1],
                }}
              >
                {t('ordersPage.subtitle', 'Track and manage your orders')}
              </p>
            </div>
            <button
              onClick={() => navigate('/direct-order')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: borderRadius.full,
                backgroundColor: colors.neutral[0],
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: shadows.md,
              }}
            >
              <Icons.Plus size={24} color={colors.primary[600]} />
            </button>
          </div>

          {/* Tab Pills */}
          <div
            style={{
              display: 'flex',
              gap: spacing[2],
              marginTop: spacing[4],
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: isActive ? colors.neutral[0] : 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: isActive ? colors.primary[700] : colors.neutral[0],
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {tab.badge && (
                    <span
                      style={{
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.error[600],
                        color: colors.neutral[0],
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.bold,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: spacing[4] }}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: spacing[12],
              }}
            >
              <Icons.Loader
                size={32}
                color={colors.primary[600]}
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <p style={{ color: colors.text.secondary, marginTop: spacing[3] }}>
                {t('common.loading', 'Loading...')}
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.xl,
                padding: spacing[8],
                textAlign: 'center',
                boxShadow: shadows.sm,
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.primary[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: spacing[4],
                }}
              >
                <Icons.Package size={32} color={colors.primary[600]} />
              </div>
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[2],
                }}
              >
                {t('ordersPage.empty.title', 'No orders found')}
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  margin: 0,
                  marginBottom: spacing[4],
                }}
              >
                {activeTab === 'active'
                  ? t('ordersPage.empty.noActive', 'Your active orders will appear here')
                  : activeTab === 'completed'
                  ? t('ordersPage.empty.noCompleted', 'Completed orders will appear here')
                  : t('ordersPage.empty.noCancelled', 'Cancelled orders will appear here')}
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => navigate('/direct-order')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[3]} ${spacing[5]}`,
                    backgroundColor: colors.primary[600],
                    color: colors.neutral[0],
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                >
                  <Icons.Plus size={18} />
                  {t('ordersPage.createOrder', 'Create Order')}
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {filteredOrders.map((order) => {
                const statusColor = getStatusColor(order.status);
                const needsAttention = ['pending', 'pending_schedule', 'in_transit'].includes(order.status);

                return (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.order_number}`)}
                    style={{
                      backgroundColor: colors.neutral[0],
                      borderRadius: borderRadius.lg,
                      padding: spacing[4],
                      boxShadow: shadows.sm,
                      cursor: 'pointer',
                      border: `1px solid ${colors.border.light}`,
                    }}
                  >

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[2] }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                          {/* Action needed indicator dot */}
                          {needsAttention && (
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: borderRadius.full,
                                backgroundColor: colors.primary[500],
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <span
                            style={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.bold,
                              color: colors.primary[600],
                              fontFamily: 'monospace',
                            }}
                          >
                            {getOrderCode(order.order_number)}
                          </span>
                          <span
                            style={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.medium,
                              padding: `2px ${spacing[2]}`,
                              borderRadius: borderRadius.full,
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                            }}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: needsAttention ? typography.fontWeight.bold : typography.fontWeight.semibold,
                            color: colors.text.primary,
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {order.supplier_name}
                        </h3>
                      </div>
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          flexShrink: 0,
                        }}
                      >
                        {formatRelativeTime(order.created_at)}
                      </span>
                    </div>

                    {/* Date and Project info */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[3],
                        marginBottom: spacing[3],
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                        <Icons.Calendar size={14} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                      {order.project_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                          <Icons.MapPin size={14} color={colors.text.tertiary} />
                          <span
                            style={{
                              fontSize: typography.fontSize.sm,
                              color: colors.text.secondary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {order.project_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div
                      style={{
                        display: 'flex',
                        gap: spacing[4],
                        paddingTop: spacing[3],
                        borderTop: `1px solid ${colors.border.light}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        {order.pickup_or_delivery === 'delivery' ? (
                          <Icons.Truck size={14} color={colors.info[600]} />
                        ) : (
                          <Icons.MapPin size={14} color={colors.secondary[700]} />
                        )}
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {order.pickup_or_delivery === 'delivery'
                            ? t('ordersPage.delivery', 'Delivery')
                            : t('ordersPage.pickup', 'Pickup')}
                        </span>
                      </div>
                      {order.promised_window_start && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                          <Icons.Clock size={14} color={colors.text.tertiary} />
                          <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                            {formatDate(order.promised_window_start)}
                          </span>
                        </div>
                      )}
                      <div style={{ marginLeft: 'auto' }}>
                        <span
                          style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.bold,
                            color: colors.success[600],
                          }}
                        >
                          {formatCurrency(order.grand_total || order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Spin animation */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[100],
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.primary[600],
          padding: spacing[6],
          paddingTop: spacing[8],
          paddingBottom: spacing[8],
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[0],
                  margin: 0,
                }}
              >
                {t('ordersPage.title', 'My Orders')}
              </h1>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  marginTop: spacing[2],
                }}
              >
                {t('ordersPage.subtitle', 'Track and manage your orders')}
              </p>
            </div>
            <button
              onClick={() => navigate('/direct-order')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[3]} ${spacing[5]}`,
                backgroundColor: colors.neutral[0],
                color: colors.primary[700],
                border: 'none',
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                cursor: 'pointer',
                boxShadow: shadows.md,
              }}
            >
              <Icons.Plus size={20} />
              {t('ordersPage.createOrder', 'New Order')}
            </button>
          </div>

          {/* Tab Pills */}
          <div
            style={{
              display: 'flex',
              gap: spacing[2],
              marginTop: spacing[6],
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: isActive ? colors.neutral[0] : 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: isActive ? colors.primary[700] : colors.neutral[0],
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {tab.badge && (
                    <span
                      style={{
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.error[600],
                        color: colors.neutral[0],
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.bold,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 6px',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: spacing[6] }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing[16],
            }}
          >
            <Icons.Loader
              size={40}
              color={colors.primary[600]}
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <p style={{ color: colors.text.secondary, marginTop: spacing[4] }}>
              {t('common.loading', 'Loading...')}
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.xl,
              padding: spacing[12],
              textAlign: 'center',
              boxShadow: shadows.sm,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: borderRadius.full,
                backgroundColor: colors.primary[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                marginBottom: spacing[5],
              }}
            >
              <Icons.Package size={40} color={colors.primary[600]} />
            </div>
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              {t('ordersPage.empty.title', 'No orders found')}
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing[6],
              }}
            >
              {activeTab === 'active'
                ? t('ordersPage.empty.noActive', 'Your active orders will appear here')
                : activeTab === 'completed'
                ? t('ordersPage.empty.noCompleted', 'Completed orders will appear here')
                : t('ordersPage.empty.noCancelled', 'Cancelled orders will appear here')}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={() => navigate('/direct-order')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[3]} ${spacing[6]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                }}
              >
                <Icons.Plus size={20} />
                {t('ordersPage.createFirstOrder', 'Create Your First Order')}
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3],
            }}
          >
            {filteredOrders.map((order) => {
              const statusColor = getStatusColor(order.status);
              const needsAttention = ['pending', 'pending_schedule', 'in_transit'].includes(order.status);

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.order_number}`)}
                  style={{
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.lg,
                    padding: spacing[5],
                    boxShadow: shadows.sm,
                    cursor: 'pointer',
                    border: `1px solid ${colors.border.light}`,
                    borderLeft: needsAttention ? `4px solid ${colors.primary[500]}` : `1px solid ${colors.border.light}`,
                    transition: 'all 200ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[5],
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = shadows.md;
                    e.currentTarget.style.backgroundColor = colors.neutral[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = shadows.sm;
                    e.currentTarget.style.backgroundColor = colors.neutral[0];
                  }}
                >

                  {/* Icon */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: borderRadius.lg,
                      backgroundColor: needsAttention ? colors.primary[100] : colors.neutral[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icons.Package size={24} color={needsAttention ? colors.primary[600] : colors.text.tertiary} />
                  </div>

                  {/* Main Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Code and status row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[1] }}>
                      <span
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.bold,
                          color: colors.primary[600],
                          fontFamily: 'monospace',
                        }}
                      >
                        {getOrderCode(order.order_number)}
                      </span>
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                          padding: `${spacing[1]} ${spacing[2]}`,
                          borderRadius: borderRadius.full,
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          flexShrink: 0,
                        }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    {/* Supplier name */}
                    <h3
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: needsAttention ? typography.fontWeight.bold : typography.fontWeight.semibold,
                        color: colors.text.primary,
                        margin: 0,
                        marginBottom: spacing[2],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.supplier_name}
                    </h3>

                    {/* Info row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                        <Icons.Calendar size={14} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                      {order.project_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                          <Icons.MapPin size={14} color={colors.text.tertiary} />
                          <span
                            style={{
                              fontSize: typography.fontSize.sm,
                              color: colors.text.secondary,
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {order.project_name}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        {order.pickup_or_delivery === 'delivery' ? (
                          <Icons.Truck size={14} color={colors.info[600]} />
                        ) : (
                          <Icons.MapPin size={14} color={colors.secondary[700]} />
                        )}
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {order.pickup_or_delivery === 'delivery'
                            ? t('ordersPage.delivery', 'Delivery')
                            : t('ordersPage.pickup', 'Pickup')}
                        </span>
                      </div>
                      {order.promised_window_start && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                          <Icons.Clock size={14} color={colors.text.tertiary} />
                          <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                            {formatDate(order.promised_window_start)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - amount and arrow */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[4],
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: typography.fontSize.lg,
                          fontWeight: typography.fontWeight.bold,
                          color: colors.success[600],
                        }}
                      >
                        {formatCurrency(order.grand_total || order.total_amount)}
                      </span>
                      <div
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                        }}
                      >
                        {formatRelativeTime(order.created_at)}
                      </div>
                    </div>
                    <Icons.ChevronRight size={20} color={colors.text.tertiary} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
