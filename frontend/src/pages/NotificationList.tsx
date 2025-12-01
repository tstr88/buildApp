/**
 * NotificationList Page
 * Professional notifications page matching RFQs inbox style
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { api } from '../services/api';
import { colors, spacing, typography, borderRadius, shadows, heights } from '../theme/tokens';

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

interface Notification {
  id: string;
  notification_type: string;
  channel: string;
  title: string;
  message: string;
  deep_link: string | null;
  data: Record<string, unknown> | null;
  delivered_at: string;
  read_at: string | null;
  is_read: boolean;
  expires_at: string | null;
}

interface GroupedNotifications {
  [key: string]: Notification[];
}

interface NotificationsResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

type TabType = 'all' | 'unread';

export default function NotificationList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchNotifications = async (pageNum: number, isRefresh = false) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        sortBy: 'delivered_at',
        sortOrder: 'desc',
      });

      if (activeTab === 'unread') {
        queryParams.append('isRead', 'false');
      }

      const response = await api.get<NotificationsResponse>(`/notifications?${queryParams.toString()}`);

      if (response.success && response.data) {
        const newNotifications = response.data.data;
        if (isRefresh) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }
        setHasMore(response.data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get<{ count: number }>('/notifications/unread-count');
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchNotifications(1, true);
    fetchUnreadCount();
  }, [activeTab]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await api.post(`/notifications/${notification.id}/read`, {});
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    if (notification.deep_link) {
      const path = notification.deep_link.replace('buildapp://', '/');
      navigate(path);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await api.post<{ markedCount: number }>('/notifications/read-all', {});
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            is_read: true,
            read_at: new Date().toISOString(),
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
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
    return date.toLocaleDateString(i18n.language === 'ka' ? 'ka-GE' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const groupNotificationsByDay = (notifs: Notification[]): GroupedNotifications => {
    const groups: GroupedNotifications = {};
    notifs.forEach((notification) => {
      const date = new Date(notification.delivered_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = t('profilePage.sections.notifications.today', 'Today');
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = t('profilePage.sections.notifications.yesterday', 'Yesterday');
      } else {
        key = date.toLocaleDateString(i18n.language === 'ka' ? 'ka-GE' : 'en-US', {
          month: 'long',
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(notification);
    });
    return groups;
  };

  const getNotificationIcon = (type: string): React.ComponentType<{ size?: number; color?: string }> => {
    const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
      offer_received: Icons.FileText,
      offer_expiring: Icons.Clock,
      delivery_approaching: Icons.Truck,
      delivery_completed: Icons.CheckCircle,
      order_auto_completed: Icons.CheckCircle,
      rental_handover_due: Icons.Wrench,
      rental_return_reminder: Icons.Calendar,
      window_confirmed: Icons.Calendar,
      rfq_received: Icons.FileText,
      offer_accepted: Icons.CheckCircle,
      direct_order_placed: Icons.Package,
      delivery_due_today: Icons.Truck,
      buyer_confirmed_delivery: Icons.CheckCircle,
      buyer_reported_issue: Icons.AlertCircle,
      catalog_prices_stale: Icons.DollarSign,
      unanswered_rfqs_summary: Icons.FileText,
      disputes_summary: Icons.AlertTriangle,
      platform_health_report: Icons.TrendingUp,
      order_confirmed: Icons.CheckCircle,
      delivery_scheduled: Icons.Calendar,
      confirmation_reminder: Icons.Bell,
      dispute_raised: Icons.AlertCircle,
      payment_due: Icons.DollarSign,
      rental_due: Icons.Wrench,
      return_reminder: Icons.Calendar,
      system_message: Icons.Info,
    };
    return iconMap[type] || Icons.Bell;
  };

  const getNotificationColor = (type: string): { bg: string; text: string } => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      offer_received: { bg: colors.info[100], text: colors.info[600] },
      offer_expiring: { bg: colors.warning[100], text: colors.warning[700] },
      delivery_approaching: { bg: colors.success[100], text: colors.success[600] },
      delivery_completed: { bg: colors.success[100], text: colors.success[600] },
      order_auto_completed: { bg: colors.neutral[100], text: colors.neutral[600] },
      rental_handover_due: { bg: colors.primary[100], text: colors.primary[600] },
      rental_return_reminder: { bg: colors.primary[100], text: colors.primary[600] },
      window_confirmed: { bg: colors.info[100], text: colors.info[600] },
      rfq_received: { bg: colors.info[100], text: colors.info[600] },
      offer_accepted: { bg: colors.success[100], text: colors.success[600] },
      direct_order_placed: { bg: colors.info[100], text: colors.info[600] },
      delivery_due_today: { bg: colors.warning[100], text: colors.warning[700] },
      buyer_confirmed_delivery: { bg: colors.success[100], text: colors.success[600] },
      buyer_reported_issue: { bg: colors.error[100], text: colors.error[600] },
      catalog_prices_stale: { bg: colors.warning[100], text: colors.warning[700] },
      unanswered_rfqs_summary: { bg: colors.neutral[100], text: colors.neutral[600] },
      disputes_summary: { bg: colors.error[100], text: colors.error[600] },
      platform_health_report: { bg: colors.info[100], text: colors.info[600] },
      order_confirmed: { bg: colors.success[100], text: colors.success[600] },
      delivery_scheduled: { bg: colors.info[100], text: colors.info[600] },
      confirmation_reminder: { bg: colors.warning[100], text: colors.warning[700] },
      dispute_raised: { bg: colors.error[100], text: colors.error[600] },
      payment_due: { bg: colors.warning[100], text: colors.warning[700] },
      rental_due: { bg: colors.primary[100], text: colors.primary[600] },
      return_reminder: { bg: colors.primary[100], text: colors.primary[600] },
      system_message: { bg: colors.neutral[100], text: colors.neutral[600] },
    };
    return colorMap[type] || { bg: colors.neutral[100], text: colors.neutral[600] };
  };

  const groupedNotifications = groupNotificationsByDay(notifications);

  const tabs = [
    { id: 'all', label: t('profilePage.sections.notifications.all', 'All'), icon: Icons.Bell },
    {
      id: 'unread',
      label: t('profilePage.sections.notifications.unread', 'Unread'),
      icon: Icons.Circle,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
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
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: borderRadius.full,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Icons.ArrowLeft size={20} color={colors.neutral[0]} />
              </button>
              <div>
                <h1
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.neutral[0],
                    margin: 0,
                  }}
                >
                  {t('profilePage.sections.notifications.title', 'Notifications')}
                </h1>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                }}
              >
                {t('profilePage.sections.notifications.markAllRead', 'Mark all read')}
              </button>
            )}
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
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setPage(1);
                  }}
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
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: spacing[4] }}>
          {loading && page === 1 ? (
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
          ) : notifications.length === 0 ? (
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
                <Icons.Bell size={32} color={colors.primary[600]} />
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
                {activeTab === 'unread'
                  ? t('profilePage.sections.notifications.noUnread', 'No unread notifications')
                  : t('profilePage.sections.notifications.noNotifications', 'No notifications')}
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  margin: 0,
                }}
              >
                {t('profilePage.sections.notifications.checkBackLater', 'Check back later for updates')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[5] }}>
              {Object.entries(groupedNotifications).map(([day, dayNotifications]) => (
                <div key={day}>
                  <h2
                    style={{
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.tertiary,
                      textTransform: 'uppercase',
                      marginBottom: spacing[3],
                      paddingLeft: spacing[1],
                    }}
                  >
                    {day}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                    {dayNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.notification_type);
                      const iconColors = getNotificationColor(notification.notification_type);
                      const isUnread = !notification.is_read;

                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          style={{
                            backgroundColor: colors.neutral[0],
                            borderRadius: borderRadius.lg,
                            padding: spacing[4],
                            boxShadow: shadows.sm,
                            cursor: 'pointer',
                            border: isUnread ? `2px solid ${colors.primary[400]}` : `1px solid ${colors.border.light}`,
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {isUnread && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                backgroundColor: colors.primary[600],
                              }}
                            />
                          )}

                          <div style={{ display: 'flex', gap: spacing[3] }}>
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: borderRadius.lg,
                                backgroundColor: iconColors.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Icon size={20} color={iconColors.text} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  gap: spacing[2],
                                  marginBottom: spacing[1],
                                }}
                              >
                                <h3
                                  style={{
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: isUnread ? typography.fontWeight.bold : typography.fontWeight.medium,
                                    color: colors.text.primary,
                                    margin: 0,
                                  }}
                                >
                                  {notification.title}
                                </h3>
                                <span
                                  style={{
                                    fontSize: typography.fontSize.xs,
                                    color: colors.text.tertiary,
                                    flexShrink: 0,
                                  }}
                                >
                                  {formatRelativeTime(notification.delivered_at)}
                                </span>
                              </div>
                              <p
                                style={{
                                  fontSize: typography.fontSize.sm,
                                  color: colors.text.secondary,
                                  margin: 0,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {notification.message}
                              </p>
                              {notification.deep_link && (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: spacing[1],
                                    marginTop: spacing[2],
                                    fontSize: typography.fontSize.xs,
                                    fontWeight: typography.fontWeight.medium,
                                    color: colors.primary[600],
                                  }}
                                >
                                  {t('common.viewDetails', 'View details')}
                                  <Icons.ChevronRight size={14} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  style={{
                    padding: `${spacing[3]} ${spacing[5]}`,
                    backgroundColor: colors.neutral[0],
                    color: colors.text.primary,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.lg,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {loading
                    ? t('common.loading', 'Loading...')
                    : t('profilePage.sections.notifications.loadMore', 'Load more')}
                </button>
              )}
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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: borderRadius.full,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Icons.ArrowLeft size={20} color={colors.neutral[0]} />
              </button>
              <div>
                <h1
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.neutral[0],
                    margin: 0,
                  }}
                >
                  {t('profilePage.sections.notifications.title', 'Notifications')}
                </h1>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: 'rgba(255,255,255,0.8)',
                    margin: 0,
                    marginTop: spacing[1],
                  }}
                >
                  {unreadCount > 0
                    ? `${unreadCount} ${t('profilePage.sections.notifications.unreadMessages', 'unread messages')}`
                    : t('profilePage.sections.notifications.allCaughtUp', 'All caught up')}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
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
                <Icons.CheckCheck size={20} />
                {t('profilePage.sections.notifications.markAllRead', 'Mark all read')}
              </button>
            )}
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
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setPage(1);
                  }}
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
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: spacing[6] }}>
        {loading && page === 1 ? (
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
        ) : notifications.length === 0 ? (
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
              <Icons.Bell size={40} color={colors.primary[600]} />
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
              {activeTab === 'unread'
                ? t('profilePage.sections.notifications.noUnread', 'No unread notifications')
                : t('profilePage.sections.notifications.noNotifications', 'No notifications')}
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              {t('profilePage.sections.notifications.checkBackLater', 'Check back later for updates')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
            {Object.entries(groupedNotifications).map(([day, dayNotifications]) => (
              <div key={day}>
                <h2
                  style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.tertiary,
                    textTransform: 'uppercase',
                    marginBottom: spacing[3],
                    paddingLeft: spacing[1],
                  }}
                >
                  {day}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  {dayNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.notification_type);
                    const iconColors = getNotificationColor(notification.notification_type);
                    const isUnread = !notification.is_read;

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        style={{
                          backgroundColor: colors.neutral[0],
                          borderRadius: borderRadius.lg,
                          padding: spacing[5],
                          boxShadow: shadows.sm,
                          cursor: 'pointer',
                          border: isUnread ? `2px solid ${colors.primary[400]}` : `1px solid ${colors.border.light}`,
                          transition: 'all 200ms ease',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: spacing[4],
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
                        {isUnread && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              bottom: 0,
                              width: '4px',
                              backgroundColor: colors.primary[600],
                            }}
                          />
                        )}

                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: borderRadius.lg,
                            backgroundColor: iconColors.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={24} color={iconColors.text} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: spacing[3],
                              marginBottom: spacing[1],
                            }}
                          >
                            <h3
                              style={{
                                fontSize: typography.fontSize.base,
                                fontWeight: isUnread ? typography.fontWeight.bold : typography.fontWeight.medium,
                                color: colors.text.primary,
                                margin: 0,
                              }}
                            >
                              {notification.title}
                            </h3>
                            <span
                              style={{
                                fontSize: typography.fontSize.sm,
                                color: colors.text.tertiary,
                                flexShrink: 0,
                              }}
                            >
                              {formatRelativeTime(notification.delivered_at)}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: typography.fontSize.sm,
                              color: colors.text.secondary,
                              margin: 0,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {notification.message}
                          </p>
                          {notification.deep_link && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: spacing[1],
                                marginTop: spacing[2],
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.medium,
                                color: colors.primary[600],
                              }}
                            >
                              {t('common.viewDetails', 'View details')}
                              <Icons.ChevronRight size={16} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: spacing[4] }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  style={{
                    padding: `${spacing[3]} ${spacing[6]}`,
                    backgroundColor: colors.neutral[0],
                    color: colors.text.primary,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.lg,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    boxShadow: shadows.sm,
                  }}
                >
                  {loading
                    ? t('common.loading', 'Loading...')
                    : t('profilePage.sections.notifications.loadMore', 'Load more')}
                </button>
              </div>
            )}
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
