/**
 * NotificationBellConnected Component
 * NotificationBell with live unread count from API
 */

import { useState, useEffect } from 'react';
import { NotificationBell } from './NotificationBell';
import { api } from '../../services/api';

export const NotificationBellConnected = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count
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
    // Fetch immediately on mount
    fetchUnreadCount();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return <NotificationBell count={unreadCount} />;
};
