/**
 * NotificationList Page
 * Professional notifications page matching app design system
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/icons/Icons';
import { api } from '../services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

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

export default function NotificationList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (pageNum: number, isRefresh = false) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        sortBy: 'delivered_at',
        sortOrder: 'desc',
      });

      if (filter === 'unread') {
        queryParams.append('isRead', 'false');
      }

      const response = await api.get<NotificationsResponse>(`/notifications?${queryParams.toString()}`);

      if (response.success && response.data) {
        const newNotifications = response.data.data;
        if (isRefresh) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
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
  }, [filter]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await api.post(`/notifications/${notification.id}/read`, {});
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
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
        setNotifications(prev =>
          prev.map(n => ({
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

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const groupNotificationsByDay = (notifications: Notification[]): GroupedNotifications => {
    const groups: GroupedNotifications = {};
    notifications.forEach(notification => {
      const date = new Date(notification.delivered_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = t('profilePage.sections.notifications.today');
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = t('profilePage.sections.notifications.yesterday');
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

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, keyof typeof Icons> = {
      offer_received: 'FileText',
      offer_expiring: 'Clock',
      delivery_approaching: 'Truck',
      delivery_completed: 'CheckCircle',
      order_auto_completed: 'CheckCircle',
      rental_handover_due: 'Wrench',
      rental_return_reminder: 'Calendar',
      window_confirmed: 'Calendar',
      rfq_received: 'FileText',
      offer_accepted: 'CheckCircle',
      direct_order_placed: 'Package',
      delivery_due_today: 'Truck',
      buyer_confirmed_delivery: 'CheckCircle',
      buyer_reported_issue: 'AlertCircle',
      catalog_prices_stale: 'DollarSign',
      unanswered_rfqs_summary: 'FileText',
      disputes_summary: 'AlertTriangle',
      platform_health_report: 'TrendingUp',
      order_confirmed: 'CheckCircle',
      delivery_scheduled: 'Calendar',
      confirmation_reminder: 'Bell',
      dispute_raised: 'AlertCircle',
      payment_due: 'DollarSign',
      rental_due: 'Wrench',
      return_reminder: 'Calendar',
      system_message: 'Info',
    };
    return iconMap[type] || 'Bell';
  };

  const getNotificationColor = (type: string): { bg: string; text: string } => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      offer_received: { bg: colors.info[50], text: colors.info[600] },
      offer_expiring: { bg: colors.warning[50], text: colors.warning[700] },
      delivery_approaching: { bg: colors.success[50], text: colors.success[600] },
      delivery_completed: { bg: colors.success[50], text: colors.success[600] },
      order_auto_completed: { bg: colors.neutral[100], text: colors.neutral[600] },
      rental_handover_due: { bg: '#F3E8FF', text: '#7C3AED' },
      rental_return_reminder: { bg: '#F3E8FF', text: '#7C3AED' },
      window_confirmed: { bg: colors.info[50], text: colors.info[600] },
      rfq_received: { bg: colors.info[50], text: colors.info[600] },
      offer_accepted: { bg: colors.success[50], text: colors.success[600] },
      direct_order_placed: { bg: '#EEF2FF', text: '#4F46E5' },
      delivery_due_today: { bg: colors.warning[50], text: colors.warning[700] },
      buyer_confirmed_delivery: { bg: colors.success[50], text: colors.success[600] },
      buyer_reported_issue: { bg: colors.error[50], text: colors.error[600] },
      catalog_prices_stale: { bg: colors.warning[50], text: colors.warning[700] },
      unanswered_rfqs_summary: { bg: colors.neutral[100], text: colors.neutral[600] },
      disputes_summary: { bg: colors.error[50], text: colors.error[600] },
      platform_health_report: { bg: colors.info[50], text: colors.info[600] },
      order_confirmed: { bg: colors.success[50], text: colors.success[600] },
      delivery_scheduled: { bg: colors.info[50], text: colors.info[600] },
      confirmation_reminder: { bg: colors.warning[50], text: colors.warning[700] },
      dispute_raised: { bg: colors.error[50], text: colors.error[600] },
      payment_due: { bg: colors.warning[50], text: colors.warning[700] },
      rental_due: { bg: '#F3E8FF', text: '#7C3AED' },
      return_reminder: { bg: '#F3E8FF', text: '#7C3AED' },
      system_message: { bg: colors.neutral[100], text: colors.neutral[600] },
    };
    return colorMap[type] || { bg: colors.neutral[100], text: colors.neutral[600] };
  };

  const groupedNotifications = groupNotificationsByDay(notifications);

  if (loading && page === 1) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background.secondary,
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: `3px solid ${colors.border.light}`,
            borderTop: `3px solid ${colors.primary[600]}`,
            borderRadius: borderRadius.full,
            animation: 'spin 1s linear infinite',
          }}
        >
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background.secondary,
        paddingBottom: spacing[20],
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1020,
          backgroundColor: colors.neutral[0],
          borderBottom: `1px solid ${colors.border.light}`,
          boxShadow: shadows.sm,
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: spacing[4],
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing[4],
            }}
          >
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                color: colors.text.secondary,
                fontSize: typography.fontSize.base,
              }}
            >
              <Icons.ArrowLeft size={20} />
              {t('profilePage.back')}
            </button>
            <div
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}
            >
              {t('profilePage.sections.notifications.title')}
            </div>
            <div style={{ width: '60px' }} />
          </div>

          {/* Stats and Mark All Read */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing[4],
            }}
          >
            <div
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
              }}
            >
              {unreadCount > 0
                ? `${unreadCount} ${t('profilePage.sections.notifications.unread')}`
                : t('profilePage.sections.notifications.noUnread')}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.primary[600],
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  transition: 'background-color 200ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.primary[50])}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {t('profilePage.sections.notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: spacing[2] }}>
            <button
              onClick={() => {
                setFilter('all');
                setPage(1);
              }}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                backgroundColor: filter === 'all' ? colors.primary[600] : colors.neutral[100],
                color: filter === 'all' ? colors.text.inverse : colors.text.secondary,
                border: 'none',
                borderRadius: borderRadius.full,
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                if (filter !== 'all') {
                  e.currentTarget.style.backgroundColor = colors.neutral[200];
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== 'all') {
                  e.currentTarget.style.backgroundColor = colors.neutral[100];
                }
              }}
            >
              {t('profilePage.sections.notifications.all')}
            </button>
            <button
              onClick={() => {
                setFilter('unread');
                setPage(1);
              }}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                backgroundColor: filter === 'unread' ? colors.primary[600] : colors.neutral[100],
                color: filter === 'unread' ? colors.text.inverse : colors.text.secondary,
                border: 'none',
                borderRadius: borderRadius.full,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
              onMouseEnter={(e) => {
                if (filter !== 'unread') {
                  e.currentTarget.style.backgroundColor = colors.neutral[200];
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== 'unread') {
                  e.currentTarget.style.backgroundColor = colors.neutral[100];
                }
              }}
            >
              {t('profilePage.sections.notifications.unread')}
              {unreadCount > 0 && (
                <span
                  style={{
                    padding: `${spacing[1]} ${spacing[2]}`,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                    backgroundColor: filter === 'unread' ? colors.neutral[0] : colors.primary[600],
                    color: filter === 'unread' ? colors.primary[600] : colors.neutral[0],
                    borderRadius: borderRadius.full,
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: spacing[4],
        }}
      >
        {notifications.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[12],
              textAlign: 'center',
              boxShadow: shadows.sm,
            }}
          >
            <Icons.Bell
              style={{
                width: '64px',
                height: '64px',
                color: colors.text.tertiary,
                margin: `0 auto ${spacing[4]}`,
              }}
            />
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing[2],
              }}
            >
              {filter === 'unread'
                ? t('profilePage.sections.notifications.noUnread')
                : t('profilePage.sections.notifications.noNotifications')}
            </h3>
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
                  }}
                >
                  {day}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  {dayNotifications.map((notification) => {
                    const Icon = Icons[getNotificationIcon(notification.notification_type)];
                    const iconColors = getNotificationColor(notification.notification_type);

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        style={{
                          backgroundColor: colors.neutral[0],
                          borderRadius: borderRadius.lg,
                          padding: spacing[4],
                          cursor: 'pointer',
                          borderLeft: !notification.is_read
                            ? `4px solid ${colors.primary[600]}`
                            : `4px solid transparent`,
                          boxShadow: shadows.sm,
                          transition: 'all 200ms ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = shadows.md;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = shadows.sm;
                        }}
                      >
                        <div style={{ display: 'flex', gap: spacing[3] }}>
                          <div
                            style={{
                              flexShrink: 0,
                              width: '40px',
                              height: '40px',
                              borderRadius: borderRadius.lg,
                              backgroundColor: iconColors.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon size={20} style={{ color: iconColors.text }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'start',
                                justifyContent: 'space-between',
                                gap: spacing[2],
                                marginBottom: spacing[1],
                              }}
                            >
                              <h3
                                style={{
                                  fontSize: typography.fontSize.sm,
                                  fontWeight: !notification.is_read
                                    ? typography.fontWeight.bold
                                    : typography.fontWeight.medium,
                                  color: colors.text.primary,
                                  flex: 1,
                                }}
                              >
                                {notification.title}
                              </h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                                <span
                                  style={{
                                    fontSize: typography.fontSize.xs,
                                    color: colors.text.tertiary,
                                  }}
                                >
                                  {new Date(notification.delivered_at).toLocaleTimeString(
                                    i18n.language === 'ka' ? 'ka-GE' : 'en-US',
                                    { hour: '2-digit', minute: '2-digit' }
                                  )}
                                </span>
                                <button
                                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                                  style={{
                                    padding: spacing[1],
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: borderRadius.sm,
                                    cursor: 'pointer',
                                    opacity: 0,
                                    transition: 'all 200ms ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.neutral[100];
                                    e.currentTarget.style.opacity = '1';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                  className="delete-btn"
                                >
                                  <Icons.X size={16} style={{ color: colors.text.tertiary }} />
                                </button>
                              </div>
                            </div>
                            <p
                              style={{
                                fontSize: typography.fontSize.sm,
                                color: colors.text.secondary,
                                marginBottom: notification.deep_link ? spacing[2] : 0,
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
                                  fontSize: typography.fontSize.xs,
                                  fontWeight: typography.fontWeight.medium,
                                  color: colors.primary[600],
                                }}
                              >
                                ნახეთ დეტალები →
                              </div>
                            )}
                          </div>
                        </div>
                        <style>{`
                          div:hover .delete-btn {
                            opacity: 1 !important;
                          }
                        `}</style>
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
                    padding: `${spacing[2]} ${spacing[6]}`,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    backgroundColor: colors.neutral[0],
                    color: colors.text.primary,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.lg,
                    boxShadow: shadows.sm,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = colors.neutral[50];
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.neutral[0];
                  }}
                >
                  {loading ? t('common.loading') : t('profilePage.sections.notifications.loadMore')}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
