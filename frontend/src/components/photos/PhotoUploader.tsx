/**
 * Photo Uploader Component
 * Drag & drop or click to upload photos
 */

import React, { useState, useRef } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface PhotoUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  maxPhotos?: number;
  accept?: string;
  category?: 'delivery' | 'dispute' | 'product' | 'rental';
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onUpload,
  maxPhotos = 3,
  accept = 'image/jpeg,image/png,image/webp',
  category = 'delivery',
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} is too large. Maximum size is 5MB`;
    }
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      return `${file.name} is not a valid image. Only JPEG, PNG, and WEBP are allowed`;
    }
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const totalFiles = selectedFiles.length + fileArray.length;

    if (totalFiles > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    // Validate files
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);
    setSelectedFiles([...selectedFiles, ...fileArray]);

    // Generate previews
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(selectedFiles);
      // Clear selections after successful upload
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? colors.primary[600] : colors.border.light}`,
          borderRadius: borderRadius.lg,
          padding: spacing[8],
          textAlign: 'center',
          cursor: selectedFiles.length >= maxPhotos ? 'not-allowed' : 'pointer',
          backgroundColor: isDragging ? colors.primary[50] : colors.neutral[0],
          transition: 'all 200ms',
          opacity: selectedFiles.length >= maxPhotos ? 0.5 : 1,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          disabled={selectedFiles.length >= maxPhotos}
          style={{ display: 'none' }}
        />
        <Icons.Upload size={48} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[3] }} />
        <p
          style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          {selectedFiles.length >= maxPhotos
            ? `Maximum ${maxPhotos} photos selected`
            : 'Drag & drop photos here or click to browse'}
        </p>
        <p style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, margin: 0 }}>
          JPEG, PNG, WEBP • Max 5MB per photo • Up to {maxPhotos} photos
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            marginTop: spacing[3],
            padding: spacing[3],
            backgroundColor: colors.error[50],
            border: `1px solid ${colors.error[200]}`,
            borderRadius: borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Icons.AlertCircle size={20} color={colors.error[600]} />
          <span style={{ fontSize: typography.fontSize.sm, color: colors.error[700] }}>{error}</span>
        </div>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div style={{ marginTop: spacing[4] }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: spacing[3],
            }}
          >
            {previews.map((preview, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: borderRadius.md,
                  overflow: 'hidden',
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  style={{
                    position: 'absolute',
                    top: spacing[2],
                    right: spacing[2],
                    backgroundColor: colors.error[600],
                    color: colors.neutral[0],
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Icons.X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            style={{
              marginTop: spacing[4],
              width: '100%',
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: isUploading ? colors.neutral[300] : colors.primary[600],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              cursor: isUploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
            }}
          >
            {isUploading ? (
              <>
                <Icons.Loader2 size={20} className="spinner" />
                Uploading {selectedFiles.length} photo(s)...
              </>
            ) : (
              <>
                <Icons.Upload size={20} />
                Upload {selectedFiles.length} photo(s)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
