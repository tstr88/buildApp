/**
 * Uploads Controller
 * Handles photo uploads for delivery proofs, disputes, and product images
 */

import { Request, Response } from 'express';
import multer from 'multer';
import { processPhotos, validatePhoto, PhotoCategory } from '../services/photoUploadService';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3, // Max 3 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed'));
      return;
    }
    cb(null, true);
  },
});

// Multer middleware for single and multiple file uploads
export const uploadSingle = upload.single('photo');
export const uploadMultiple = upload.array('photos', 3);

/**
 * POST /api/uploads/delivery-proof
 * Upload delivery proof photos (supplier only)
 */
export async function uploadDeliveryProof(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.user_type !== 'supplier') {
      res.status(403).json({
        success: false,
        error: 'Only suppliers can upload delivery proofs',
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files provided',
      });
      return;
    }

    // Validate each file
    for (const file of files) {
      validatePhoto(file.buffer, file.mimetype);
    }

    // Process photos
    const keepGPS = req.body.keepGPS === 'true'; // Supplier can choose to keep GPS
    const results = await processPhotos(
      'deliveries',
      files.map((f) => f.buffer),
      keepGPS
    );

    res.json({
      success: true,
      data: results,
      message: `${results.length} photo(s) uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload delivery proof error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload photos',
    });
  }
}

/**
 * POST /api/uploads/dispute-evidence
 * Upload dispute evidence photos (buyer only)
 */
export async function uploadDisputeEvidence(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.user_type !== 'buyer') {
      res.status(403).json({
        success: false,
        error: 'Only buyers can upload dispute evidence',
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files provided',
      });
      return;
    }

    // Validate each file
    for (const file of files) {
      validatePhoto(file.buffer, file.mimetype);
    }

    // Process photos (no GPS retention for disputes)
    const results = await processPhotos(
      'disputes',
      files.map((f) => f.buffer),
      false
    );

    res.json({
      success: true,
      data: results,
      message: `${results.length} photo(s) uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload dispute evidence error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload photos',
    });
  }
}

/**
 * POST /api/uploads/product-image
 * Upload product catalog images (supplier only)
 */
export async function uploadProductImage(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.user_type !== 'supplier') {
      res.status(403).json({
        success: false,
        error: 'Only suppliers can upload product images',
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files provided',
      });
      return;
    }

    // Validate each file
    for (const file of files) {
      validatePhoto(file.buffer, file.mimetype);
    }

    // Process photos
    const results = await processPhotos(
      'products',
      files.map((f) => f.buffer),
      false
    );

    res.json({
      success: true,
      data: results,
      message: `${results.length} photo(s) uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload product image error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload photos',
    });
  }
}

/**
 * POST /api/uploads/rental-handover
 * Upload rental handover/return photos (supplier only)
 */
export async function uploadRentalHandover(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.user_type !== 'supplier') {
      res.status(403).json({
        success: false,
        error: 'Only suppliers can upload rental handover photos',
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files provided',
      });
      return;
    }

    // Validate each file
    for (const file of files) {
      validatePhoto(file.buffer, file.mimetype);
    }

    // Process photos
    const results = await processPhotos(
      'rentals',
      files.map((f) => f.buffer),
      false
    );

    res.json({
      success: true,
      data: results,
      message: `${results.length} photo(s) uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload rental handover error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload photos',
    });
  }
}
