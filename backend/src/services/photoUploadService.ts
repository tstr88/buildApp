/**
 * Photo Upload Service
 * Handles secure photo uploads with EXIF stripping and compression
 */

import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

export type PhotoCategory = 'deliveries' | 'disputes' | 'products' | 'rentals';

interface ProcessPhotoOptions {
  category: PhotoCategory;
  buffer: Buffer;
  keepGPS?: boolean; // For supplier delivery proofs
}

interface ProcessedPhoto {
  filename: string;
  url: string;
  size: number;
}

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 80;
const UPLOAD_BASE_DIR = path.join(__dirname, '../../uploads');

/**
 * Process and save a photo with compression and EXIF stripping
 */
export async function processPhoto(options: ProcessPhotoOptions): Promise<ProcessedPhoto> {
  const { category, buffer, keepGPS = false } = options;

  // Generate unique filename
  const filename = `${Date.now()}-${uuidv4()}.webp`;
  const categoryDir = path.join(UPLOAD_BASE_DIR, category);
  const outputPath = path.join(categoryDir, filename);

  // Ensure directory exists
  await fs.mkdir(categoryDir, { recursive: true });

  // Process image with sharp
  let processor = sharp(buffer)
    .rotate() // Auto-rotate based on EXIF orientation
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    });

  // Strip EXIF metadata (privacy)
  // Note: sharp's webp() removes most EXIF by default
  // If we need more control, we can use .withMetadata({ exif: {} })
  if (!keepGPS) {
    processor = processor.withMetadata({
      orientation: undefined,
      density: undefined,
    });
  }

  // Convert to WebP with compression
  const outputBuffer = await processor
    .webp({ quality: QUALITY })
    .toBuffer();

  // Save to disk
  await fs.writeFile(outputPath, outputBuffer);

  // Get file size
  const stats = await fs.stat(outputPath);

  return {
    filename,
    url: `/uploads/${category}/${filename}`,
    size: stats.size,
  };
}

/**
 * Process multiple photos
 */
export async function processPhotos(
  category: PhotoCategory,
  buffers: Buffer[],
  keepGPS = false
): Promise<ProcessedPhoto[]> {
  const maxPhotos = 3;
  if (buffers.length > maxPhotos) {
    throw new Error(`Maximum ${maxPhotos} photos allowed`);
  }

  const results = await Promise.all(
    buffers.map((buffer) =>
      processPhoto({ category, buffer, keepGPS })
    )
  );

  return results;
}

/**
 * Delete a photo from the file system
 */
export async function deletePhoto(category: PhotoCategory, filename: string): Promise<void> {
  const filePath = path.join(UPLOAD_BASE_DIR, category, filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File might not exist, ignore error
    console.error(`Failed to delete photo: ${filePath}`, error);
  }
}

/**
 * Validate photo file
 */
export function validatePhoto(buffer: Buffer, mimetype: string): void {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (buffer.length > MAX_SIZE) {
    throw new Error('File too large. Maximum size is 5MB');
  }

  if (!ALLOWED_TYPES.includes(mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed');
  }
}
