/**
 * NotificationBellConnected Component
 * NotificationBell with live unread count from API
 */

import { useState, useEffect, useCallback } from 'react';
import { NotificationBell } from './NotificationBell';
import { api } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';

export const NotificationBellConnected = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useWebSocket();

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get<{ count: number }>('/notifications/unread-count');
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  useEffect(() => {
    // Fetch immediately on mount
    fetchUnreadCount();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Listen for WebSocket notification events
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      fetchUnreadCount();
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('rfq:created', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('rfq:created', handleNewNotification);
    };
  }, [socket, fetchUnreadCount]);

  return <NotificationBell count={unreadCount} />;
};
