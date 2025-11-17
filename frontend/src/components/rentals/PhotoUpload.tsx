import React, { useState, useRef } from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import * as Icons from 'lucide-react';

interface PhotoUploadProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  label?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  label = 'Upload Photos',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalPhotos = photos.length + newFiles.length;

    if (totalPhotos > maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    // Create preview URLs
    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newUrls]);

    // Update parent
    onPhotosChange([...photos, ...newFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(previewUrls[index]);

    const newPhotos = [...photos];
    newPhotos.splice(index, 1);

    const newUrls = [...previewUrls];
    newUrls.splice(index, 1);

    setPreviewUrls(newUrls);
    onPhotosChange(newPhotos);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>{label}</label>

      {/* Photo Grid */}
      {previewUrls.length > 0 && (
        <div style={styles.photoGrid}>
          {previewUrls.map((url, index) => (
            <div key={index} style={styles.photoCard}>
              <img src={url} alt={`Photo ${index + 1}`} style={styles.photoImage} />
              <button
                type="button"
                style={styles.removeButton}
                onClick={() => handleRemovePhoto(index)}
                aria-label="Remove photo"
              >
                <Icons.X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {photos.length < maxPhotos && (
        <button type="button" style={styles.uploadButton} onClick={handleBrowseClick}>
          <Icons.Camera size={20} />
          <span>
            {photos.length === 0 ? 'Add Photos' : `Add More (${photos.length}/${maxPhotos})`}
          </span>
        </button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={styles.hiddenInput}
      />

      {/* Helper Text */}
      <p style={styles.helperText}>
        Upload up to {maxPhotos} photos. JPG, PNG formats supported.
      </p>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    display: 'block',
    ...typography.body,
    fontWeight: 600,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  photoCard: {
    position: 'relative',
    width: '100%',
    paddingBottom: '100%', // 1:1 aspect ratio
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  photoImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: colors.error,
    color: colors.background,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'transform 0.2s',
  },
  uploadButton: {
    width: '100%',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    border: `2px dashed ${colors.border}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...typography.body,
    color: colors.textSecondary,
    transition: 'all 0.2s',
  },
  hiddenInput: {
    display: 'none',
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    margin: 0,
  },
};
