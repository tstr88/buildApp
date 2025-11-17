/**
 * Uploads Routes
 * Photo upload endpoints for delivery proofs, disputes, and product images
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  uploadDeliveryProof,
  uploadDisputeEvidence,
  uploadProductImage,
  uploadRentalHandover,
  uploadMultiple,
} from '../../controllers/uploadsController';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

/**
 * POST /api/uploads/delivery-proof
 * Upload delivery proof photos (supplier only)
 * Body: multipart/form-data with 'photos' field (max 3 files)
 */
router.post(
  '/delivery-proof',
  uploadMultiple,
  asyncHandler(uploadDeliveryProof)
);

/**
 * POST /api/uploads/dispute-evidence
 * Upload dispute evidence photos (buyer only)
 * Body: multipart/form-data with 'photos' field (max 3 files)
 */
router.post(
  '/dispute-evidence',
  uploadMultiple,
  asyncHandler(uploadDisputeEvidence)
);

/**
 * POST /api/uploads/product-image
 * Upload product catalog images (supplier only)
 * Body: multipart/form-data with 'photos' field (max 3 files)
 */
router.post(
  '/product-image',
  uploadMultiple,
  asyncHandler(uploadProductImage)
);

/**
 * POST /api/uploads/rental-handover
 * Upload rental handover/return photos (supplier only)
 * Body: multipart/form-data with 'photos' field (max 3 files)
 */
router.post(
  '/rental-handover',
  uploadMultiple,
  asyncHandler(uploadRentalHandover)
);

export default router;
