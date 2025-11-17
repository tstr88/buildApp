/**
 * Delivery Zone Map Component
 * Displays supplier depot location with delivery zone overlay
 * Optionally shows buyer's project location and indicates if within zone
 */

import React from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/tokens';
import { calculateDistance, isWithinDeliveryZone } from '../../utils/formatters';

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

// Custom depot icon (factory)
const depotIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom project icon (green for within zone, red for outside)
const projectIconGreen = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const projectIconRed = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface DeliveryZoneMapProps {
  depotLat: number;
  depotLng: number;
  depotName?: string;
  radiusKm: number;
  projectLat?: number;
  projectLng?: number;
  projectName?: string;
  className?: string;
  height?: string;
}

export const DeliveryZoneMap: React.FC<DeliveryZoneMapProps> = ({
  depotLat,
  depotLng,
  depotName = 'Depot',
  radiusKm,
  projectLat,
  projectLng,
  projectName = 'Project Location',
  className = '',
  height = '400px',
}) => {
  const { t, i18n } = useTranslation();

  // Check if project is within delivery zone
  const withinZone = projectLat && projectLng
    ? isWithinDeliveryZone(projectLat, projectLng, depotLat, depotLng, radiusKm)
    : null;

  // Calculate distance if project exists
  const distance = projectLat && projectLng
    ? calculateDistance(depotLat, depotLng, projectLat, projectLng)
    : null;

  // Get project icon based on zone status
  const projectIcon = withinZone ? projectIconGreen : projectIconRed;

  // Calculate map center and zoom
  const center: [number, number] = projectLat && projectLng
    ? [(depotLat + projectLat) / 2, (depotLng + projectLng) / 2]
    : [depotLat, depotLng];

  // Auto-calculate zoom based on radius
  const getZoom = () => {
    if (radiusKm <= 15) return 12;
    if (radiusKm <= 25) return 11;
    if (radiusKm <= 50) return 10;
    return 9; // All Georgia
  };

  return (
    <div className={className} style={{ width: '100%', height, borderRadius: '8px', overflow: 'hidden' }}>
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

        {/* Delivery Zone Circle */}
        <Circle
          center={[depotLat, depotLng]}
          radius={radiusKm * 1000} // Convert km to meters
          pathOptions={{
            color: colors.primary[600],
            fillColor: colors.primary[100],
            fillOpacity: 0.2,
            weight: 2,
          }}
        />

        {/* Depot Marker */}
        <Marker position={[depotLat, depotLng]} icon={depotIcon}>
          <Popup>
            <div style={{ padding: '8px' }}>
              <strong>{depotName}</strong>
              <br />
              <span style={{ fontSize: '12px', color: colors.text.secondary }}>
                {i18n.language === 'ka' ? 'საწყობი' : 'Depot'}
              </span>
              <br />
              <span style={{ fontSize: '12px', color: colors.text.secondary }}>
                {i18n.language === 'ka'
                  ? `მიწოდების ზონა: ${radiusKm} კმ`
                  : `Delivery zone: ${radiusKm} km`}
              </span>
            </div>
          </Popup>
        </Marker>

        {/* Project Marker (if provided) */}
        {projectLat && projectLng && (
          <Marker position={[projectLat, projectLng]} icon={projectIcon}>
            <Popup>
              <div style={{ padding: '8px' }}>
                <strong>{projectName}</strong>
                <br />
                {distance !== null && (
                  <>
                    <span style={{ fontSize: '12px', color: colors.text.secondary }}>
                      {i18n.language === 'ka' ? 'მანძილი' : 'Distance'}: {distance.toFixed(1)} {i18n.language === 'ka' ? 'კმ' : 'km'}
                    </span>
                    <br />
                  </>
                )}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: withinZone ? colors.success[600] : colors.error
                  }}
                >
                  {withinZone
                    ? (i18n.language === 'ka' ? '✓ მიწოდების ზონაში' : '✓ Within delivery zone')
                    : (i18n.language === 'ka' ? '✗ მიწოდების ზონის გარეთ' : '✗ Outside delivery zone')}
                </span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
