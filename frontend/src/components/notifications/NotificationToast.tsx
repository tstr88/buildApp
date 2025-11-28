/**
 * Notification Toast Component
 * Displays in-app notifications for real-time events
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { useWebSocket } from '../../context/WebSocketContext';

interface Notification {
  id: string;
  type: 'order_created' | 'window_proposed' | 'window_accepted' | 'status_changed' | 'order_updated' | 'rfq_received';
  title: string;
  message: string;
  timestamp: Date;
  orderId?: string;
  rfqId?: string;
}

export function NotificationToast() {
  const { t } = useTranslation();
  const { socket } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for RFQ created events (for suppliers)
    socket.on('rfq:created', (data: any) => {
      console.log('[NotificationToast] Received rfq:created event', data);
      const notification: Notification = {
        id: `${Date.now()}-rfq`,
        type: 'rfq_received',
        title: t('notifications.newRfq', 'New RFQ Received'),
        message: t('notifications.newRfqMessage', 'You have received a new request for quote'),
        timestamp: new Date(),
        rfqId: data?.rfqId,
      };
      addNotification(notification);
    });

    // Listen for order created events
    socket.on('order:created', (order: any) => {
      console.log('[NotificationToast] Received order:created event', order);
      const notification: Notification = {
        id: `${Date.now()}-created`,
        type: 'order_created',
        title: t('notifications.newOrder', 'New Order'),
        message: t('notifications.newOrderMessage', `New order #${order.order_number || order.order_id} received`),
        timestamp: new Date(),
        orderId: order.order_number || order.order_id,
      };
      addNotification(notification);
    });

    // Listen for window proposal events
    socket.on('order:window-proposed', (order: any) => {
      console.log('[NotificationToast] Received order:window-proposed event', order);
      const notification: Notification = {
        id: `${Date.now()}-proposed`,
        type: 'window_proposed',
        title: t('notifications.windowProposal', 'Window Proposal'),
        message: t('notifications.windowProposalMessage', `New delivery window proposed for order #${order.order_number || order.order_id}`),
        timestamp: new Date(),
        orderId: order.order_number || order.order_id,
      };
      addNotification(notification);
    });

    // Listen for window accepted events
    socket.on('order:window-accepted', (order: any) => {
      console.log('[NotificationToast] Received order:window-accepted event', order);
      const notification: Notification = {
        id: `${Date.now()}-accepted`,
        type: 'window_accepted',
        title: t('notifications.windowAccepted', 'Window Accepted'),
        message: t('notifications.windowAcceptedMessage', `Delivery window confirmed for order #${order.order_number || order.order_id}`),
        timestamp: new Date(),
        orderId: order.order_number || order.order_id,
      };
      addNotification(notification);
    });

    // Listen for status change events
    socket.on('order:status-changed', (order: any) => {
      console.log('[NotificationToast] Received order:status-changed event', order);
      const notification: Notification = {
        id: `${Date.now()}-status`,
        type: 'status_changed',
        title: t('notifications.statusChanged', 'Status Updated'),
        message: t('notifications.statusChangedMessage', `Order #${order.order_number || order.order_id} status changed to ${order.status}`),
        timestamp: new Date(),
        orderId: order.order_number || order.order_id,
      };
      addNotification(notification);
    });

    // NOTE: Removed 'order:updated' listener to prevent duplicate notifications
    // Specific events (window-proposed, window-accepted, status-changed) are sufficient

    // Cleanup listeners on unmount
    return () => {
      socket.off('rfq:created');
      socket.off('order:created');
      socket.off('order:window-proposed');
      socket.off('order:window-accepted');
      socket.off('order:status-changed');
    };
  }, [socket, t]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);

    // Auto-remove notification after 30 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 30000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'rfq_received':
        return <Icons.FileText size={20} color={colors.primary[600]} />;
      case 'order_created':
        return <Icons.ShoppingCart size={20} color={colors.primary[600]} />;
      case 'window_proposed':
        return <Icons.Calendar size={20} color={colors.info[600]} />;
      case 'window_accepted':
        return <Icons.CheckCircle size={20} color={colors.success[600]} />;
      case 'status_changed':
        return <Icons.RefreshCw size={20} color={colors.warning[600]} />;
      case 'order_updated':
        return <Icons.Bell size={20} color={colors.neutral[600]} />;
      default:
        return <Icons.Bell size={20} color={colors.neutral[600]} />;
    }
  };

  const getBackgroundColor = (type: Notification['type']) => {
    switch (type) {
      case 'rfq_received':
        return colors.primary[50];
      case 'order_created':
        return colors.primary[50];
      case 'window_proposed':
        return colors.info[50];
      case 'window_accepted':
        return colors.success[50];
      case 'status_changed':
        return colors.warning[50];
      case 'order_updated':
        return colors.neutral[50];
      default:
        return colors.neutral[50];
    }
  };

  const getBorderColor = (type: Notification['type']) => {
    switch (type) {
      case 'rfq_received':
        return colors.primary[200];
      case 'order_created':
        return colors.primary[200];
      case 'window_proposed':
        return colors.info[200];
      case 'window_accepted':
        return colors.success[200];
      case 'status_changed':
        return colors.warning[200];
      case 'order_updated':
        return colors.neutral[200];
      default:
        return colors.neutral[200];
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: spacing[4],
        right: spacing[4],
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[2],
        maxWidth: '400px',
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            backgroundColor: getBackgroundColor(notification.type),
            border: `1px solid ${getBorderColor(notification.type)}`,
            borderRadius: borderRadius.lg,
            padding: spacing[4],
            boxShadow: shadows.lg,
            display: 'flex',
            alignItems: 'flex-start',
            gap: spacing[3],
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div style={{ flexShrink: 0, marginTop: spacing[1] }}>
            {getIcon(notification.type)}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing[1],
              }}
            >
              {notification.title}
            </div>
            <div
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.secondary,
              }}
            >
              {notification.message}
            </div>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: spacing[1],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.X size={16} color={colors.text.tertiary} />
          </button>
        </div>
      ))}
    </div>
  );
}
