/**
 * MapPinPicker Component
 * Interactive map for selecting project location with draggable pin
 */

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { GEORGIA_BOUNDS } from '../../types/project';

// Fix for default marker icon in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Default center: Tbilisi
const DEFAULT_CENTER: [number, number] = [41.7151, 44.8271];
const DEFAULT_ZOOM = 13;

interface MapPinPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

/**
 * Component to handle map click events and update marker position
 */
function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      // Validate coordinates are within Georgia bounds
      if (
        lat >= GEORGIA_BOUNDS.minLat &&
        lat <= GEORGIA_BOUNDS.maxLat &&
        lng >= GEORGIA_BOUNDS.minLng &&
        lng <= GEORGIA_BOUNDS.maxLng
      ) {
        onChange(lat, lng);
      }
    },
  });
  return null;
}

/**
 * Component to handle map centering
 */
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

/**
 * MapPinPicker Component
 */
export default function MapPinPicker({ latitude, longitude, onChange, className = '' }: MapPinPickerProps) {
  const { t } = useTranslation();
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const markerRef = useRef<L.Marker>(null);

  // Update position when props change
  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t('projects.map.geolocationNotSupported'));
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        // Check if within Georgia bounds
        if (
          lat >= GEORGIA_BOUNDS.minLat &&
          lat <= GEORGIA_BOUNDS.maxLat &&
          lng >= GEORGIA_BOUNDS.minLng &&
          lng <= GEORGIA_BOUNDS.maxLng
        ) {
          setPosition([lat, lng]);
          onChange(lat, lng);
        } else {
          alert(t('projects.map.outsideGeorgia'));
        }
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(t('projects.map.geolocationError'));
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker) {
      const newPos = marker.getLatLng();
      // Validate coordinates are within Georgia bounds
      if (
        newPos.lat >= GEORGIA_BOUNDS.minLat &&
        newPos.lat <= GEORGIA_BOUNDS.maxLat &&
        newPos.lng >= GEORGIA_BOUNDS.minLng &&
        newPos.lng <= GEORGIA_BOUNDS.maxLng
      ) {
        setPosition([newPos.lat, newPos.lng]);
        onChange(newPos.lat, newPos.lng);
      }
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onChange(lat, lng);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {position && (
            <Marker
              position={position}
              draggable={true}
              ref={markerRef}
              eventHandlers={{
                dragend: handleMarkerDragEnd,
              }}
            />
          )}

          <MapClickHandler onChange={handleMapClick} />
          {position && <MapCenterController center={position} />}
        </MapContainer>

        {/* Current Location Button */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-lg shadow-md border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('projects.map.currentLocation')}
        >
          {isLocating ? (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Instructions */}
      <p className="mt-2 text-sm text-gray-600">
        {position
          ? t('projects.map.dragOrClickToMove')
          : t('projects.map.clickToSetLocation')}
      </p>

      {/* Coordinates Display */}
      {position && (
        <div className="mt-2 text-xs text-gray-500">
          {t('projects.map.coordinates')}: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      )}
    </div>
  );
}
