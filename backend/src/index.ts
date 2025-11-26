import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import apiRoutes from './routes';
import { errorHandler, notFoundHandler, handleUncaughtException, handleUnhandledRejection } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { setupSwagger } from './config/swagger';
import { initializeWebSocket } from './websocket';

dotenv.config();

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// CORS configuration - allow frontend origin from environment variable
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin)); // Remove undefined values

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use(requestLogger);

// Serve uploaded files (for MVP)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Setup Swagger documentation
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}

// API routes
app.use('/api', apiRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Create HTTP server and initialize WebSocket
const httpServer = http.createServer(app);
initializeWebSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket server initialized`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  }
});

export default app;
