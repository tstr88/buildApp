/**
 * WebSocket Server Configuration
 * Handles real-time updates for direct orders
 */

import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userType?: string;
}

let io: Server | null = null;

export function initializeWebSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173', // Frontend URL
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; userType?: string };
      socket.userId = decoded.userId;
      socket.userType = decoded.userType;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[WebSocket] User connected: ${socket.userId} (${socket.userType})`);

    // Join user-specific room for targeted notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      console.log(`[WebSocket] User ${socket.userId} joined room: user:${socket.userId}`);
    }

    // Join supplier-specific room if user is a supplier
    if (socket.userType === 'supplier' && socket.userId) {
      socket.join('suppliers');
      console.log(`[WebSocket] Supplier ${socket.userId} joined suppliers room`);
    }

    // Join buyer-specific room if user is a buyer
    if (socket.userType === 'buyer' && socket.userId) {
      socket.join('buyers');
      console.log(`[WebSocket] Buyer ${socket.userId} joined buyers room`);
    }

    socket.on('disconnect', () => {
      console.log(`[WebSocket] User disconnected: ${socket.userId}`);
    });

    // Handle order page subscriptions
    socket.on('subscribe:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`[WebSocket] User ${socket.userId} subscribed to order: ${orderId}`);
    });

    socket.on('unsubscribe:order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
      console.log(`[WebSocket] User ${socket.userId} unsubscribed from order: ${orderId}`);
    });

    // Handle orders page subscriptions
    socket.on('subscribe:orders', () => {
      socket.join('orders:list');
      console.log(`[WebSocket] User ${socket.userId} subscribed to orders list`);
    });

    socket.on('unsubscribe:orders', () => {
      socket.leave('orders:list');
      console.log(`[WebSocket] User ${socket.userId} unsubscribed from orders list`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('WebSocket server not initialized. Call initializeWebSocket first.');
  }
  return io;
}

// Event emission helpers
export const emitOrderCreated = (order: any, supplierId: string) => {
  const socketIO = getIO();

  // Notify specific supplier
  socketIO.to(`user:${supplierId}`).emit('order:created', order);

  // Notify all suppliers (for orders list page)
  socketIO.to('suppliers').emit('orders:list-updated');
  socketIO.to('orders:list').emit('orders:list-updated');

  console.log(`[WebSocket] Emitted order:created to supplier ${supplierId}`);
};

export const emitWindowProposed = (order: any, targetUserId: string) => {
  const socketIO = getIO();

  // Notify specific user (buyer or supplier)
  socketIO.to(`user:${targetUserId}`).emit('order:window-proposed', order);

  // Notify order page subscribers
  socketIO.to(`order:${order.order_number}`).emit('order:updated', order);

  console.log(`[WebSocket] Emitted order:window-proposed to user ${targetUserId}`);
};

export const emitWindowAccepted = (order: any, targetUserId: string) => {
  const socketIO = getIO();

  // Notify specific user (buyer or supplier)
  socketIO.to(`user:${targetUserId}`).emit('order:window-accepted', order);

  // Notify order page subscribers
  socketIO.to(`order:${order.order_number}`).emit('order:updated', order);

  console.log(`[WebSocket] Emitted order:window-accepted to user ${targetUserId}`);
};

export const emitOrderStatusChanged = (order: any, buyerId: string, supplierId: string) => {
  const socketIO = getIO();

  // Notify both buyer and supplier
  socketIO.to(`user:${buyerId}`).emit('order:status-changed', order);
  socketIO.to(`user:${supplierId}`).emit('order:status-changed', order);

  // Notify order page subscribers
  socketIO.to(`order:${order.order_number}`).emit('order:updated', order);

  // Notify orders list subscribers
  socketIO.to('orders:list').emit('orders:list-updated');

  console.log(`[WebSocket] Emitted order:status-changed for order ${order.order_number}`);
};

export const emitOrderUpdated = (order: any, buyerId: string, supplierId: string) => {
  const socketIO = getIO();

  // Notify both buyer and supplier
  socketIO.to(`user:${buyerId}`).emit('order:updated', order);
  socketIO.to(`user:${supplierId}`).emit('order:updated', order);

  // Notify order page subscribers
  socketIO.to(`order:${order.order_number}`).emit('order:updated', order);

  console.log(`[WebSocket] Emitted order:updated for order ${order.order_number}`);
};

export const emitOfferCreated = (rfqId: string, buyerUserId: string) => {
  const socketIO = getIO();

  // Notify the buyer that a new offer was submitted for their RFQ
  socketIO.to(`user:${buyerUserId}`).emit('offer:created', { rfqId });

  // Notify RFQs list page subscribers (buyers viewing their RFQ list)
  socketIO.to('buyers').emit('rfqs:list-updated');

  console.log(`[WebSocket] Emitted offer:created for RFQ ${rfqId} to buyer ${buyerUserId}`);
};
