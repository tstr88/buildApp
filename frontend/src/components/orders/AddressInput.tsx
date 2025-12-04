/**
 * Address Input with Autocomplete and Map
 * Provides address suggestions and interactive map for precise location selection
 */

import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import MapPinPicker from '../map/MapPinPicker';

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    country?: string;
  };
}

interface AddressInputProps {
  value: string;
  onChange: (address: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
  latitude?: number;
  longitude?: number;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  placeholder = 'Start typing address...',
  latitude,
  longitude,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );
  const debounceTimer = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (latitude && longitude) {
      setMapCoords({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const searchAddress = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Use multiple strategies to get better results
      const allSuggestions: AddressSuggestion[] = [];

      // Strategy 1: Photon API (better for street-level searches)
      try {
        const photonResponse = await fetch(
          `https://photon.komoot.io/api/?` +
            `q=${encodeURIComponent(query)}&` +
            `lat=41.7151&lon=44.8271&` + // Tbilisi center
            `limit=10&` +
            `lang=en`
        );

        if (photonResponse.ok) {
          const photonData = await photonResponse.json();
          const photonResults = photonData.features.map((feature: any) => {
            // Build display name with house number first if available
            let displayName = '';
            if (feature.properties.housenumber && feature.properties.street) {
              displayName = `${feature.properties.housenumber} ${feature.properties.street}`;
            } else if (feature.properties.street) {
              displayName = feature.properties.street;
            } else if (feature.properties.name) {
              displayName = feature.properties.name;
            } else {
              displayName = feature.properties.city || 'Tbilisi';
            }

            // Add city/district
            const location = feature.properties.city || 'Tbilisi';
            displayName += `, ${location}`;
            if (feature.properties.country) {
              displayName += `, ${feature.properties.country}`;
            }

            return {
              display_name: displayName,
              lat: feature.geometry.coordinates[1].toString(),
              lon: feature.geometry.coordinates[0].toString(),
              address: {
                road: feature.properties.street || feature.properties.name,
                house_number: feature.properties.housenumber,
                suburb: feature.properties.district,
                city: feature.properties.city || 'Tbilisi',
                country: feature.properties.country || 'Georgia',
              },
            };
          });
          allSuggestions.push(...photonResults);
        }
      } catch (error) {
        console.log('Photon API error:', error);
      }

      // Strategy 2: Nominatim with structured query (street-focused)
      try {
        const nominatimStructured = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            `format=json&` +
            `street=${encodeURIComponent(query)}&` +
            `city=Tbilisi&` +
            `country=Georgia&` +
            `limit=5&` +
            `addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );

        if (nominatimStructured.ok) {
          const structuredData: AddressSuggestion[] = await nominatimStructured.json();
          allSuggestions.push(...structuredData);
        }
      } catch (error) {
        console.log('Nominatim structured search error:', error);
      }

      // Strategy 3: Standard Nominatim search (fallback)
      try {
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            `format=json&` +
            `q=${encodeURIComponent(query + ', Tbilisi, Georgia')}&` +
            `limit=5&` +
            `addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );

        if (nominatimResponse.ok) {
          const nominatimData: AddressSuggestion[] = await nominatimResponse.json();
          allSuggestions.push(...nominatimData);
        }
      } catch (error) {
        console.log('Nominatim search error:', error);
      }

      // Remove duplicates based on coordinates (within 10 meters)
      const uniqueSuggestions: AddressSuggestion[] = [];
      allSuggestions.forEach(suggestion => {
        const isDuplicate = uniqueSuggestions.some(existing => {
          const latDiff = Math.abs(parseFloat(existing.lat) - parseFloat(suggestion.lat));
          const lonDiff = Math.abs(parseFloat(existing.lon) - parseFloat(suggestion.lon));
          return latDiff < 0.0001 && lonDiff < 0.0001; // ~10 meters
        });
        if (!isDuplicate) {
          uniqueSuggestions.push(suggestion);
        }
      });

      // Prioritize results with street names
      const sortedSuggestions = uniqueSuggestions.sort((a, b) => {
        const aHasStreet = a.address?.road ? 1 : 0;
        const bHasStreet = b.address?.road ? 1 : 0;
        return bHasStreet - aHasStreet;
      });

      setSuggestions(sortedSuggestions.slice(0, 10));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Address search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Debounce the search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddress(newValue);
    }, 300); // Faster response
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    const coords = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    };

    // Build a proper address string that includes the house number
    let addressString = suggestion.display_name;
    if (suggestion.address) {
      const parts: string[] = [];

      // Add house number and road together if both exist
      if (suggestion.address.house_number && suggestion.address.road) {
        parts.push(`${suggestion.address.house_number} ${suggestion.address.road}`);
      } else if (suggestion.address.road) {
        parts.push(suggestion.address.road);
      }

      // Add other location details
      if (suggestion.address.suburb) parts.push(suggestion.address.suburb);
      if (suggestion.address.city) parts.push(suggestion.address.city);
      if (suggestion.address.country) parts.push(suggestion.address.country);

      if (parts.length > 0) {
        addressString = parts.join(', ');
      }
    }

    setInputValue(addressString);
    setMapCoords(coords);
    onChange(addressString, coords);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleMapChange = (lat: number, lng: number) => {
    setMapCoords({ lat, lng });

    // Reverse geocode to get address from coordinates
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
          `format=json&` +
          `lat=${lat}&` +
          `lon=${lng}&` +
          `addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.display_name;
        setInputValue(address);
        onChange(address, { lat, lng });
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      // Still update coords even if reverse geocode fails
      onChange(inputValue, { lat, lng });
    }
  };

  const handleBlur = () => {
    // Delay to allow suggestion click to register
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div>
      {/* Address Input with Autocomplete */}
      <div style={{ position: 'relative', marginBottom: spacing[3] }}>
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={handleBlur}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: `${spacing[3]} ${spacing[10]} ${spacing[3]} ${spacing[3]}`,
              fontSize: typography.fontSize.base,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = colors.primary[400];
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = colors.border.light;
            }}
          />

          {/* Loading indicator */}
          {loading && (
            <div
              style={{
                position: 'absolute',
                right: spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <Icons.Loader size={18} color={colors.text.tertiary} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {/* Map toggle button */}
          {!loading && (
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              style={{
                position: 'absolute',
                right: spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: spacing[1],
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
              }}
              title={showMap ? 'Hide map' : 'Show map'}
            >
              <Icons.MapPin size={18} color={showMap ? colors.primary[600] : colors.text.tertiary} />
            </button>
          )}
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              marginTop: spacing[1],
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  border: 'none',
                  borderBottom: index < suggestions.length - 1 ? `1px solid ${colors.border.light}` : 'none',
                  backgroundColor: colors.neutral[0],
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[0];
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[2] }}>
                  <Icons.MapPin size={16} color={colors.primary[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        color: colors.text.primary,
                        margin: 0,
                        marginBottom: spacing[1],
                      }}
                    >
                      {suggestion.address?.house_number && suggestion.address?.road
                        ? `${suggestion.address.house_number} ${suggestion.address.road}`
                        : suggestion.address?.road || suggestion.display_name}
                    </p>
                    {suggestion.address && (suggestion.address.suburb || suggestion.address.city) && (
                      <p
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.secondary,
                          margin: 0,
                        }}
                      >
                        {[suggestion.address.suburb, suggestion.address.city, suggestion.address.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map */}
      {showMap && (
        <div
          style={{
            marginBottom: spacing[4],
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.md,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: spacing[2],
              backgroundColor: colors.info[50],
              borderBottom: `1px solid ${colors.info[200]}`,
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            <Icons.Info size={16} color={colors.info[600]} />
            <p
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.info[700],
                margin: 0,
              }}
            >
              Click on the map to set precise delivery location
            </p>
          </div>
          <MapPinPicker
            latitude={mapCoords?.lat}
            longitude={mapCoords?.lng}
            onChange={handleMapChange}
          />
        </div>
      )}

      {/* Coordinates display (if set) */}
      {mapCoords && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: spacing[2],
            backgroundColor: colors.success[50],
            border: `1px solid ${colors.success[200]}`,
            borderRadius: borderRadius.sm,
            marginBottom: spacing[4],
          }}
        >
          <Icons.CheckCircle size={16} color={colors.success[600]} />
          <span style={{ fontSize: typography.fontSize.xs, color: colors.success[700] }}>
            Location set: {Number(mapCoords.lat).toFixed(5)}, {Number(mapCoords.lng).toFixed(5)}
          </span>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
