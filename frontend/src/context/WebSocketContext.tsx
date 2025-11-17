/**
 * WebSocket Context
 * Manages Socket.io client connection and real-time events
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribeToOrder: (orderId: string) => void;
  unsubscribeFromOrder: (orderId: string) => void;
  subscribeToOrders: () => void;
  unsubscribeFromOrders: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only initialize WebSocket if user is authenticated
    if (!isAuthenticated || !user) {
      // Disconnect socket if user logs out
      if (socketRef.current) {
        console.log('[WebSocket] Disconnecting due to logout');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Don't create multiple connections
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    const token = localStorage.getItem('buildapp_auth_token');
    if (!token) {
      console.warn('[WebSocket] No auth token found');
      return;
    }

    console.log('[WebSocket] Initializing connection');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const newSocket = io(API_URL, {
      auth: {
        token,
      },
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      setIsConnected(false);
    });

    // Debug: Log all incoming events
    newSocket.onAny((eventName, ...args) => {
      console.log(`[WebSocket] Received event: ${eventName}`, args);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('[WebSocket] Cleaning up connection');
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  const subscribeToOrder = useCallback((orderId: string) => {
    if (socketRef.current) {
      console.log(`[WebSocket] Subscribing to order: ${orderId}`);
      socketRef.current.emit('subscribe:order', orderId);
    }
  }, []);

  const unsubscribeFromOrder = useCallback((orderId: string) => {
    if (socketRef.current) {
      console.log(`[WebSocket] Unsubscribing from order: ${orderId}`);
      socketRef.current.emit('unsubscribe:order', orderId);
    }
  }, []);

  const subscribeToOrders = useCallback(() => {
    if (socketRef.current) {
      console.log('[WebSocket] Subscribing to orders list');
      socketRef.current.emit('subscribe:orders');
    }
  }, []);

  const unsubscribeFromOrders = useCallback(() => {
    if (socketRef.current) {
      console.log('[WebSocket] Unsubscribing from orders list');
      socketRef.current.emit('unsubscribe:orders');
    }
  }, []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    subscribeToOrder,
    unsubscribeFromOrder,
    subscribeToOrders,
    unsubscribeFromOrders,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
