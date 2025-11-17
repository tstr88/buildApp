/**
 * Photo Gallery Component
 * Displays photos in a grid with lightbox viewer
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface PhotoGalleryProps {
  photos: string[];
  alt?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, alt = 'Photo' }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
  };

  return (
    <>
      {/* Photo Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: photos.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: spacing[3],
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={index}
            onClick={() => openLightbox(index)}
            style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: borderRadius.md,
              overflow: 'hidden',
              border: `1px solid ${colors.border.light}`,
              cursor: 'pointer',
              transition: 'transform 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img
              src={`http://localhost:3001${photo}`}
              alt={`${alt} ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Zoom Icon Overlay */}
            <div
              style={{
                position: 'absolute',
                top: spacing[2],
                right: spacing[2],
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: colors.neutral[0],
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.ZoomIn size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: spacing[4],
              right: spacing[4],
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: colors.neutral[0],
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <Icons.X size={24} />
          </button>

          {/* Counter */}
          {photos.length > 1 && (
            <div
              style={{
                position: 'absolute',
                top: spacing[4],
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: colors.neutral[0],
                padding: `${spacing[2]} ${spacing[4]}`,
                borderRadius: borderRadius.full,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              {currentIndex + 1} / {photos.length}
            </div>
          )}

          {/* Previous Button */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              style={{
                position: 'absolute',
                left: spacing[4],
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: colors.neutral[0],
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <Icons.ChevronLeft size={24} />
            </button>
          )}

          {/* Image */}
          <img
            src={`http://localhost:3001${photos[currentIndex]}`}
            alt={`${alt} ${currentIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: borderRadius.md,
            }}
          />

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              style={{
                position: 'absolute',
                right: spacing[4],
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: colors.neutral[0],
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <Icons.ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </>
  );
};
