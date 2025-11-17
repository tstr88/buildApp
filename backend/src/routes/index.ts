/**
 * Main API router
 * Aggregates all route modules
 */

import { Router } from 'express';
import authRoutes from './authRoutes';
import buyersRoutes from './buyers';
import suppliersRoutes from './suppliers';
import catalogRoutes from './catalog';
import factoriesRoutes from './factories';
import rentalsRoutes from './rentals';
import adminRoutes from './admin';
import notificationsRoutes from './notifications';
import templatesRoutes from './templates';
import uploadsRoutes from './uploads';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'buildApp API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/buyers', buyersRoutes);
router.use('/suppliers', suppliersRoutes);
router.use('/catalog', catalogRoutes);
router.use('/factories', factoriesRoutes);
router.use('/rentals', rentalsRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/templates', templatesRoutes);
router.use('/uploads', uploadsRoutes);

export default router;
