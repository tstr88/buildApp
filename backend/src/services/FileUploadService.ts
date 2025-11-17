/**
 * File Upload Service
 * Handles file uploads with image processing and EXIF scrubbing
 * Local storage for MVP, S3 support ready for future
 */

import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { FileUploadError } from '../utils/errors/CustomErrors';

/**
 * Allowed image MIME types
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * Maximum file size (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Upload directory path
 */
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

/**
 * File upload service class
 */
export class FileUploadService {
  private uploadDir: string;

  constructor(uploadDir: string = UPLOAD_DIR) {
    this.uploadDir = uploadDir;
    this.ensureUploadDirExists();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirExists(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Configure multer storage
   */
  private getStorage(): multer.StorageEngine {
    return multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (_req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });
  }

  /**
   * File filter for multer
   */
  private fileFilter(
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ): void {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new FileUploadError(`Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
    }
  }

  /**
   * Get multer upload middleware
   * @param fieldName - Form field name for the file
   * @param maxCount - Maximum number of files (default: 1)
   * @returns Multer middleware
   */
  getUploadMiddleware(_fieldName: string, maxCount: number = 1): multer.Multer {
    return multer({
      storage: this.getStorage(),
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: maxCount,
      },
      fileFilter: this.fileFilter.bind(this),
    });
  }

  /**
   * Process and optimize image
   * Removes EXIF data, resizes, and optimizes
   * @param filePath - Path to the uploaded file
   * @param options - Processing options
   * @returns Path to the processed file
   */
  async processImage(
    filePath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<string> {
    try {
      const {
        width = 1920,
        height = 1080,
        quality = 85,
        format = 'jpeg',
      } = options;

      const outputPath = filePath.replace(
        path.extname(filePath),
        `.processed.${format}`
      );

      await sharp(filePath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .rotate() // Auto-rotate based on EXIF orientation
        .toFormat(format, { quality })
        .withMetadata({}) // Remove EXIF data
        .toFile(outputPath);

      // Delete original file
      await fs.unlink(filePath);

      return outputPath;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new FileUploadError(
        'Failed to process image',
        { error: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Create thumbnail from image
   * @param filePath - Path to the image file
   * @param size - Thumbnail size (default: 200)
   * @returns Path to the thumbnail
   */
  async createThumbnail(filePath: string, size: number = 200): Promise<string> {
    try {
      const thumbnailPath = filePath.replace(
        path.extname(filePath),
        `.thumb${path.extname(filePath)}`
      );

      await sharp(filePath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .withMetadata({})
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      throw new FileUploadError(
        'Failed to create thumbnail',
        { error: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Scrub EXIF data from image buffer
   * @param buffer - Image buffer
   * @returns Cleaned buffer
   */
  async scrubExif(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .withMetadata({})
        .toBuffer();
    } catch (error) {
      console.error('EXIF scrubbing error:', error);
      throw new FileUploadError(
        'Failed to scrub EXIF data',
        { error: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Delete file
   * @param filePath - Path to the file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('File deletion error:', error);
      // Don't throw error if file doesn't exist
    }
  }

  /**
   * Get file URL for serving
   * @param filename - File name
   * @returns File URL
   */
  getFileUrl(filename: string): string {
    // For local storage, return relative path
    // In production with S3, this would return the S3 URL
    return `/uploads/${filename}`;
  }

  /**
   * Save uploaded file info to database
   * @param file - Multer file object
   * @param userId - User ID who uploaded the file
   * @returns File metadata
   */
  async saveFileMetadata(
    file: Express.Multer.File,
    _userId: string
  ): Promise<{
    id: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }> {
    const fileId = uuidv4();
    const fileUrl = this.getFileUrl(file.filename);

    // In a real implementation, save to database
    // For now, return metadata
    return {
      id: fileId,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: fileUrl,
    };
  }
}

// Export singleton instance
export default new FileUploadService();
