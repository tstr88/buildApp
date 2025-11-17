/**
 * Supplier Directory Map Component
 * Displays all suppliers as pins on a map with filtering by category
 * Centers on buyer's project if available and shows suppliers within delivery range
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme/tokens';
import { calculateDistance } from '../../utils/formatters';

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

// Supplier icon (blue)
const supplierIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Project icon (green)
const projectIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Supplier {
  id: string;
  name: string;
  businessNameKa?: string;
  businessNameEn?: string;
  depotLat: number;
  depotLng: number;
  deliveryRadiusKm: number;
  categories: string[];
}

interface SupplierDirectoryMapProps {
  suppliers: Supplier[];
  categoryFilter?: string | null;
  projectLat?: number;
  projectLng?: number;
  projectName?: string;
  onSupplierClick?: (supplierId: string) => void;
  className?: string;
  height?: string;
}

// Default center: Tbilisi
const DEFAULT_CENTER: [number, number] = [41.7151, 44.8271];
const DEFAULT_ZOOM = 11;

export const SupplierDirectoryMap: React.FC<SupplierDirectoryMapProps> = ({
  suppliers,
  categoryFilter,
  projectLat,
  projectLng,
  projectName = 'Project',
  onSupplierClick,
  className = '',
  height = '500px',
}) => {
  const { t, i18n } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(true);

  // Filter suppliers by category if provided
  const filteredSuppliers = categoryFilter
    ? suppliers.filter(s => s.categories.includes(categoryFilter))
    : suppliers;

  // Get user's current location on mount
  useEffect(() => {
    if (!projectLat && !projectLng && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setIsLocating(false);
        },
        (error) => {
          console.log('Geolocation not available:', error);
          setIsLocating(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    } else {
      setIsLocating(false);
    }
  }, [projectLat, projectLng]);

  // Determine map center (project > user location > Tbilisi)
  const center: [number, number] = projectLat && projectLng
    ? [projectLat, projectLng]
    : userLocation || DEFAULT_CENTER;

  // Smart zoom: Show user location with nearby suppliers or fit all suppliers
  useEffect(() => {
    if (!mapRef.current || filteredSuppliers.length === 0 || isLocating) return;

    const map = mapRef.current;
    const currentCenter = userLocation || (projectLat && projectLng ? [projectLat, projectLng] : null);

    if (currentCenter) {
      // Calculate distances from current center to all suppliers
      const suppliersWithDistance = filteredSuppliers.map(s => ({
        ...s,
        distance: calculateDistance(currentCenter[0], currentCenter[1], s.depotLat, s.depotLng)
      }));

      // Sort by distance
      suppliersWithDistance.sort((a, b) => a.distance - b.distance);

      // Try to show at least 5 suppliers within reasonable distance
      const nearbySuppliers = suppliersWithDistance.slice(0, Math.min(5, suppliersWithDistance.length));

      if (nearbySuppliers.length > 0) {
        // Calculate bounds that include current location and nearby suppliers
        const bounds = L.latLngBounds([currentCenter]);
        nearbySuppliers.forEach(s => {
          bounds.extend([s.depotLat, s.depotLng]);
        });

        // If we have less than 5 suppliers and the farthest one is very close, zoom out a bit
        if (nearbySuppliers.length < 5 && nearbySuppliers[nearbySuppliers.length - 1].distance < 10) {
          // Add padding to show more area
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: 11 });
        } else if (nearbySuppliers.length >= 5 || nearbySuppliers[nearbySuppliers.length - 1].distance > 20) {
          // We have enough suppliers or they're spread out
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        } else {
          // Standard zoom for 10-20km range
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 11 });
        }
      } else {
        // No suppliers, just center on location with default zoom
        map.setView(currentCenter, 11);
      }
    } else {
      // No user location or project - fit all suppliers
      const bounds = L.latLngBounds(
        filteredSuppliers.map(s => [s.depotLat, s.depotLng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [filteredSuppliers, projectLat, projectLng, userLocation, isLocating]);

  // Get supplier name in current language
  const getSupplierName = (supplier: Supplier): string => {
    if (i18n.language === 'ka' && supplier.businessNameKa) {
      return supplier.businessNameKa;
    }
    if (i18n.language === 'en' && supplier.businessNameEn) {
      return supplier.businessNameEn;
    }
    return supplier.name;
  };

  return (
    <div className={className} style={{ width: '100%', height, borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker (if available and no project) */}
        {userLocation && !projectLat && !projectLng && (
          <Circle
            center={userLocation}
            radius={100}
            pathOptions={{
              color: colors.info[600],
              fillColor: colors.info[500],
              fillOpacity: 0.3,
              weight: 3,
            }}
          >
            <Popup>
              <div style={{ padding: spacing[2] }}>
                <strong>{i18n.language === 'ka' ? '📍 თქვენი მდებარეობა' : '📍 Your Location'}</strong>
              </div>
            </Popup>
          </Circle>
        )}

        {/* Project Marker (if provided) */}
        {projectLat && projectLng && (
          <>
            <Marker position={[projectLat, projectLng]} icon={projectIcon}>
              <Popup>
                <div style={{ padding: spacing[2] }}>
                  <strong>{projectName}</strong>
                  <br />
                  <span style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                    {i18n.language === 'ka' ? 'თქვენი პროექტი' : 'Your Project'}
                  </span>
                </div>
              </Popup>
            </Marker>

            {/* Show delivery zones from project perspective */}
            {filteredSuppliers.map((supplier) => (
              <Circle
                key={`zone-${supplier.id}`}
                center={[supplier.depotLat, supplier.depotLng]}
                radius={supplier.deliveryRadiusKm * 1000}
                pathOptions={{
                  color: colors.primary[400],
                  fillColor: colors.primary[100],
                  fillOpacity: 0.1,
                  weight: 1,
                  dashArray: '5, 5',
                }}
              />
            ))}
          </>
        )}

        {/* Supplier Markers */}
        {filteredSuppliers.map((supplier) => (
          <Marker
            key={supplier.id}
            position={[supplier.depotLat, supplier.depotLng]}
            icon={supplierIcon}
            eventHandlers={{
              click: () => {
                if (onSupplierClick) {
                  onSupplierClick(supplier.id);
                }
              },
            }}
          >
            {/* Modern Tooltip */}
            <Tooltip
              direction="top"
              offset={[0, -35]}
              opacity={1}
              permanent={false}
              className="custom-supplier-tooltip"
            >
              <div style={{
                padding: `${spacing[3]} ${spacing[4]}`,
                minWidth: '220px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
              }}>
                <div style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  marginBottom: spacing[2],
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}>
                  <span style={{
                    fontSize: '20px',
                    lineHeight: 1,
                  }}>🏭</span>
                  {getSupplierName(supplier)}
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing[1],
                }}>
                  {supplier.categories.slice(0, 3).map((cat, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-block',
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: colors.primary[100],
                        color: colors.primary[800],
                        borderRadius: '8px',
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium,
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                  {supplier.categories.length > 3 && (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: colors.neutral[200],
                        color: colors.text.secondary,
                        borderRadius: '8px',
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium,
                      }}
                    >
                      +{supplier.categories.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </Tooltip>

            {/* Detailed Popup on Click */}
            <Popup>
              <div style={{ padding: spacing[2], minWidth: '200px' }}>
                <strong style={{ fontSize: typography.fontSize.lg, display: 'block', marginBottom: spacing[2] }}>
                  {getSupplierName(supplier)}
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    <strong>{i18n.language === 'ka' ? '📦 კატეგორიები:' : '📦 Categories:'}</strong>
                    <div style={{ marginTop: spacing[1] }}>
                      {supplier.categories.map((cat, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-block',
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: colors.primary[50],
                            color: colors.primary[700],
                            borderRadius: '12px',
                            fontSize: typography.fontSize.xs,
                            marginRight: spacing[1],
                            marginBottom: spacing[1],
                          }}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: spacing[1] }}>
                    <strong>{i18n.language === 'ka' ? '🚚 მიწოდების რადიუსი:' : '🚚 Delivery Radius:'}</strong>
                    <span style={{ marginLeft: spacing[1], color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                      {supplier.deliveryRadiusKm} {i18n.language === 'ka' ? 'კმ' : 'km'}
                    </span>
                  </div>
                </div>
                {onSupplierClick && (
                  <button
                    onClick={() => onSupplierClick(supplier.id)}
                    style={{
                      marginTop: spacing[3],
                      padding: `${spacing[2]} ${spacing[3]}`,
                      backgroundColor: colors.primary[600],
                      color: colors.neutral[0],
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary[700];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary[600];
                    }}
                  >
                    {i18n.language === 'ka' ? '👉 დეტალების ნახვა' : '👉 View Details'}
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      {projectLat && projectLng && (
        <div
          style={{
            position: 'absolute',
            bottom: spacing[4],
            left: spacing[4],
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: spacing[3],
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            fontSize: typography.fontSize.xs,
          }}
        >
          <div style={{ marginBottom: spacing[1], fontWeight: typography.fontWeight.semibold }}>
            {i18n.language === 'ka' ? 'ლეგენდა' : 'Legend'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: colors.success[500], borderRadius: '50%' }} />
            <span>{i18n.language === 'ka' ? 'თქვენი პროექტი' : 'Your Project'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: colors.primary[600], borderRadius: '50%' }} />
            <span>{i18n.language === 'ka' ? 'მიმწოდებლები' : 'Suppliers'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                border: `2px dashed ${colors.primary[400]}`,
                borderRadius: '50%',
                backgroundColor: colors.primary[100],
              }}
            />
            <span>{i18n.language === 'ka' ? 'მიწოდების ზონა' : 'Delivery Zone'}</span>
          </div>
        </div>
      )}

      {/* Custom Tooltip Styles */}
      <style>{`
        .custom-supplier-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .custom-supplier-tooltip::before {
          display: none !important;
        }

        .custom-supplier-tooltip .leaflet-tooltip-content {
          margin: 0 !important;
          padding: 0 !important;
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.98) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 16px;
          box-shadow:
            0 20px 40px -12px rgba(0, 0, 0, 0.25),
            0 8px 16px -8px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.5),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(59, 130, 246, 0.2);
          animation: tooltipPopUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: bottom center;
          position: relative;
          overflow: visible;
        }

        .custom-supplier-tooltip .leaflet-tooltip-content::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 14px;
          padding: 2px;
          background: linear-gradient(135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(147, 197, 253, 0.1) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        @keyframes tooltipPopUp {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.9);
          }
          60% {
            transform: translateY(-2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .custom-supplier-tooltip .leaflet-tooltip-content::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.98) 100%);
          border-right: 2px solid rgba(59, 130, 246, 0.2);
          border-bottom: 2px solid rgba(59, 130, 246, 0.2);
          transform: translateX(-50%) rotate(45deg);
          box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1);
          clip-path: polygon(0 0, 100% 0, 100% 100%);
        }

        .custom-supplier-tooltip .leaflet-tooltip-left::after {
          left: auto;
          right: -10px;
          bottom: 50%;
          transform: translateY(50%) rotate(-45deg);
          border-right: 2px solid rgba(59, 130, 246, 0.2);
          border-bottom: 2px solid rgba(59, 130, 246, 0.2);
          border-left: none;
          border-top: none;
          clip-path: polygon(0 0, 100% 0, 100% 100%);
        }

        .custom-supplier-tooltip .leaflet-tooltip-right::after {
          left: -10px;
          right: auto;
          bottom: 50%;
          transform: translateY(50%) rotate(135deg);
          border-right: 2px solid rgba(59, 130, 246, 0.2);
          border-bottom: 2px solid rgba(59, 130, 246, 0.2);
          border-left: none;
          border-top: none;
          clip-path: polygon(0 0, 100% 0, 100% 100%);
        }

        /* Hover effect on markers to enhance tooltip appearance */
        .leaflet-marker-icon:hover {
          filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4));
          transform: scale(1.1);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};
