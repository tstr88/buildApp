/**
 * Map Pin Picker Component
 * Interactive map for selecting supplier depot location
 */

import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import L from 'leaflet';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix default icon issue with Leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Georgia bounds (approximate)
const GEORGIA_BOUNDS = {
  minLat: 41.0,
  maxLat: 43.5,
  minLng: 40.0,
  maxLng: 46.7,
};

// Default center (Tbilisi)
const DEFAULT_CENTER: [number, number] = [41.7151, 44.8271];
const DEFAULT_ZOOM = 13;

interface MapPinPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string;
}

// Component to handle map click events
const LocationMarker: React.FC<{
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}> = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

export const MapPinPicker: React.FC<MapPinPickerProps> = ({
  onLocationSelect,
  initialLat,
  initialLng,
  initialAddress = '',
}) => {
  const { t } = useTranslation();

  // Set initial position if provided and valid, otherwise null
  const getInitialPosition = (): [number, number] | null => {
    if (initialLat && initialLng) {
      return [initialLat, initialLng];
    }
    return null;
  };

  const [position, setPosition] = useState<[number, number] | null>(getInitialPosition());
  const [address, setAddress] = useState(initialAddress);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Validate if coordinates are within Georgia bounds
  const isWithinGeorgiaBounds = (lat: number, lng: number): boolean => {
    return (
      lat >= GEORGIA_BOUNDS.minLat &&
      lat <= GEORGIA_BOUNDS.maxLat &&
      lng >= GEORGIA_BOUNDS.minLng &&
      lng <= GEORGIA_BOUNDS.maxLng
    );
  };

  // Handle position update
  const handlePositionChange = (newPosition: [number, number]) => {
    const [lat, lng] = newPosition;

    if (!isWithinGeorgiaBounds(lat, lng)) {
      setError(t('supplierOnboarding.location.outsideGeorgia'));
      return;
    }

    setError(null);
    setPosition(newPosition);

    // Reverse geocode to get address (using Nominatim - free OpenStreetMap service)
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${t('lang')}`
    )
      .then((res) => res.json())
      .then((data) => {
        const fetchedAddress = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddress(fetchedAddress);
        onLocationSelect(lat, lng, fetchedAddress);
      })
      .catch(() => {
        // Fallback to coordinates if geocoding fails
        const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddress(fallbackAddress);
        onLocationSelect(lat, lng, fallbackAddress);
      });
  };

  // Use current location
  const handleUseCurrentLocation = () => {
    setLocating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(t('supplierOnboarding.location.geolocationNotSupported'));
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (!isWithinGeorgiaBounds(lat, lng)) {
          setError(t('supplierOnboarding.location.outsideGeorgia'));
          setLocating(false);
          return;
        }

        const newPosition: [number, number] = [lat, lng];
        handlePositionChange(newPosition);

        // Pan map to new location
        if (mapRef.current) {
          mapRef.current.setView(newPosition, DEFAULT_ZOOM);
        }

        setLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(t('supplierOnboarding.location.geolocationError'));
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Get map center (use position if set, otherwise default)
  const mapCenter = position || DEFAULT_CENTER;

  return (
    <div style={{ width: '100%' }}>
      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: spacing[3],
            backgroundColor: colors.red[50],
            border: `1px solid ${colors.error}`,
            borderRadius: borderRadius.md,
            marginBottom: spacing[3],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Icons.AlertCircle size={20} color={colors.error} />
          <span style={{ fontSize: typography.fontSize.sm, color: colors.error }}>
            {error}
          </span>
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          padding: spacing[3],
          backgroundColor: colors.primary[50],
          border: `1px solid ${colors.primary[200]}`,
          borderRadius: borderRadius.md,
          marginBottom: spacing[3],
          display: 'flex',
          alignItems: 'flex-start',
          gap: spacing[2],
        }}
      >
        <Icons.Info size={20} color={colors.primary[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          {t('supplierOnboarding.location.mapInstructions')}
        </p>
      </div>

      {/* Use Current Location Button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        style={{
          width: '100%',
          padding: spacing[3],
          backgroundColor: colors.neutral[0],
          border: `2px solid ${colors.primary[600]}`,
          borderRadius: borderRadius.md,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.medium,
          color: colors.primary[600],
          cursor: locating ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[2],
          marginBottom: spacing[3],
          opacity: locating ? 0.6 : 1,
        }}
      >
        {locating ? (
          <>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: `2px solid ${colors.primary[600]}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            {t('supplierOnboarding.location.locating')}
          </>
        ) : (
          <>
            <Icons.Crosshair size={20} />
            {t('supplierOnboarding.location.useCurrentLocation')}
          </>
        )}
      </button>

      {/* Map Container */}
      <div
        style={{
          width: '100%',
          height: '400px',
          borderRadius: borderRadius.md,
          overflow: 'hidden',
          border: `2px solid ${colors.border.light}`,
          marginBottom: spacing[3],
        }}
      >
        <MapContainer
          center={mapCenter}
          zoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
      </div>

      {/* Selected Location Display */}
      {position && address && (
        <div
          style={{
            padding: spacing[3],
            backgroundColor: colors.success[50],
            border: `1px solid ${colors.success[500]}`,
            borderRadius: borderRadius.md,
            display: 'flex',
            alignItems: 'flex-start',
            gap: spacing[2],
          }}
        >
          <Icons.MapPin size={20} color={colors.success[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[1],
              }}
            >
              {t('supplierOnboarding.location.selectedLocation')}
            </div>
            <div
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              {address}
            </div>
            <div
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
                marginTop: spacing[1],
                fontFamily: 'monospace',
              }}
            >
              {t('supplierOnboarding.location.coordinates')}: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
