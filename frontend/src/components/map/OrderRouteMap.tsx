/**
 * Order Route Map Component
 * Displays supplier depot and delivery address with distance
 * Optional: Shows route line between them (V2 feature)
 */

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme/tokens';
import { calculateDistance, formatDistance } from '../../utils/formatters';

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

// Depot icon (blue - starting point)
const depotIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Delivery icon (green - destination)
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface OrderRouteMapProps {
  // Depot (supplier location)
  depotLat: number;
  depotLng: number;
  depotName?: string;
  depotAddress?: string;

  // Delivery location (project/buyer address)
  deliveryLat: number;
  deliveryLng: number;
  deliveryName?: string;
  deliveryAddress?: string;

  // Optional route line (V2 feature)
  showRoute?: boolean;

  className?: string;
  height?: string;
}

export const OrderRouteMap: React.FC<OrderRouteMapProps> = ({
  depotLat,
  depotLng,
  depotName = 'Supplier Depot',
  depotAddress,
  deliveryLat,
  deliveryLng,
  deliveryName = 'Delivery Address',
  deliveryAddress,
  showRoute = false,
  className = '',
  height = '300px',
}) => {
  const { t, i18n } = useTranslation();

  // Calculate distance
  const distanceKm = calculateDistance(depotLat, depotLng, deliveryLat, deliveryLng);
  const distanceText = formatDistance(distanceKm, i18n.language);

  // Calculate map center (midpoint between depot and delivery)
  const center: [number, number] = [
    (depotLat + deliveryLat) / 2,
    (depotLng + deliveryLng) / 2
  ];

  // Calculate zoom level based on distance
  const getZoom = () => {
    if (distanceKm < 5) return 13;
    if (distanceKm < 10) return 12;
    if (distanceKm < 25) return 11;
    if (distanceKm < 50) return 10;
    return 9;
  };

  // Route coordinates for polyline
  const routeCoordinates: [number, number][] = [
    [depotLat, depotLng],
    [deliveryLat, deliveryLng]
  ];

  return (
    <div className={className} style={{ width: '100%', position: 'relative' }}>
      {/* Distance Badge */}
      <div
        style={{
          position: 'absolute',
          top: spacing[3],
          right: spacing[3],
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: `${spacing[2]} ${spacing[3]}`,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
        }}
      >
        {i18n.language === 'ka' ? 'მანძილი' : 'Distance'}: {distanceText}
      </div>

      {/* Map */}
      <div style={{ width: '100%', height, borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer
          center={center}
          zoom={getZoom()}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Route Line (optional) */}
          {showRoute && (
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: colors.primary[600],
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10',
              }}
            />
          )}

          {/* Depot Marker */}
          <Marker position={[depotLat, depotLng]} icon={depotIcon}>
            <Popup>
              <div style={{ padding: spacing[2] }}>
                <div style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.secondary,
                  marginBottom: spacing[1],
                  fontWeight: typography.fontWeight.semibold
                }}>
                  {i18n.language === 'ka' ? '🏭 საწყობი' : '🏭 Depot'}
                </div>
                <strong style={{ fontSize: typography.fontSize.base }}>
                  {depotName}
                </strong>
                {depotAddress && (
                  <>
                    <br />
                    <span style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                      {depotAddress}
                    </span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Delivery Marker */}
          <Marker position={[deliveryLat, deliveryLng]} icon={deliveryIcon}>
            <Popup>
              <div style={{ padding: spacing[2] }}>
                <div style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.secondary,
                  marginBottom: spacing[1],
                  fontWeight: typography.fontWeight.semibold
                }}>
                  {i18n.language === 'ka' ? '📍 მიწოდების მისამართი' : '📍 Delivery Address'}
                </div>
                <strong style={{ fontSize: typography.fontSize.base }}>
                  {deliveryName}
                </strong>
                {deliveryAddress && (
                  <>
                    <br />
                    <span style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                      {deliveryAddress}
                    </span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: spacing[3],
          display: 'flex',
          justifyContent: 'center',
          gap: spacing[4],
          fontSize: typography.fontSize.xs,
          color: colors.text.secondary,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: colors.primary[600],
            borderRadius: '50%'
          }} />
          <span>{i18n.language === 'ka' ? 'საწყობი' : 'Depot'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: colors.success[500],
            borderRadius: '50%'
          }} />
          <span>{i18n.language === 'ka' ? 'მიწოდების ადგილი' : 'Delivery Location'}</span>
        </div>
        {showRoute && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <div style={{
              width: '20px',
              height: '2px',
              background: `repeating-linear-gradient(
                to right,
                ${colors.primary[600]} 0px,
                ${colors.primary[600]} 5px,
                transparent 5px,
                transparent 10px
              )`
            }} />
            <span>{i18n.language === 'ka' ? 'მარშრუტი' : 'Route'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
