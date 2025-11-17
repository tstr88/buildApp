/**
 * Pickup/Delivery Toggle Component
 * Allows buyer to choose between pickup and delivery options
 */

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { AddressInput } from './AddressInput';

interface Project {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface SupplierLocation {
  address: string;
  latitude?: number;
  longitude?: number;
}

interface PickupDeliveryToggleProps {
  selectedOption: 'pickup' | 'delivery';
  onOptionChange: (option: 'pickup' | 'delivery') => void;
  selectedProjectId?: string | null;
  onProjectSelect: (projectId: string) => void;
  supplierLocation?: SupplierLocation;
  availableOptions?: 'both' | 'pickup' | 'delivery';
  onManualAddressChange?: (address: string, coords?: { lat: number; lng: number }) => void;
  manualAddress?: string;
  onDeliveryNotesChange?: (notes: string) => void;
  deliveryNotes?: string;
}

export const PickupDeliveryToggle: React.FC<PickupDeliveryToggleProps> = ({
  selectedOption,
  onOptionChange,
  selectedProjectId,
  onProjectSelect,
  supplierLocation,
  availableOptions = 'both',
  onManualAddressChange,
  manualAddress = '',
  onDeliveryNotesChange,
  deliveryNotes = '',
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProjectSelection, setShowProjectSelection] = useState(false);
  const [addressInput, setAddressInput] = useState(manualAddress);
  const [notesInput, setNotesInput] = useState(deliveryNotes);
  const [addressCoords, setAddressCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (selectedOption === 'delivery') {
      fetchProjects();
    }
  }, [selectedOption]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch('http://localhost:3001/api/buyers/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const canSelectPickup = availableOptions === 'both' || availableOptions === 'pickup';
  const canSelectDelivery = availableOptions === 'both' || availableOptions === 'delivery';

  return (
    <div>
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[4],
        }}
      >
        Pickup or Delivery
      </h3>

      {/* Toggle Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing[3],
          marginBottom: spacing[4],
        }}
      >
        {/* Pickup Option */}
        <button
          onClick={() => canSelectPickup && onOptionChange('pickup')}
          disabled={!canSelectPickup}
          style={{
            padding: spacing[4],
            border: `2px solid ${
              selectedOption === 'pickup' ? colors.primary[600] : colors.border.light
            }`,
            borderRadius: borderRadius.lg,
            backgroundColor:
              selectedOption === 'pickup' ? colors.primary[50] : colors.neutral[0],
            cursor: canSelectPickup ? 'pointer' : 'not-allowed',
            opacity: canSelectPickup ? 1 : 0.5,
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            if (canSelectPickup && selectedOption !== 'pickup') {
              e.currentTarget.style.borderColor = colors.primary[300];
              e.currentTarget.style.backgroundColor = colors.neutral[50];
            }
          }}
          onMouseLeave={(e) => {
            if (selectedOption !== 'pickup') {
              e.currentTarget.style.borderColor = colors.border.light;
              e.currentTarget.style.backgroundColor = colors.neutral[0];
            }
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Icons.MapPin
              size={32}
              color={selectedOption === 'pickup' ? colors.primary[600] : colors.text.tertiary}
              style={{ margin: '0 auto', marginBottom: spacing[2] }}
            />
            <h4
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color:
                  selectedOption === 'pickup' ? colors.primary[700] : colors.text.primary,
                margin: 0,
                marginBottom: spacing[1],
              }}
            >
              Pickup
            </h4>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              Collect from supplier depot
            </p>
          </div>
        </button>

        {/* Delivery Option */}
        <button
          onClick={() => canSelectDelivery && onOptionChange('delivery')}
          disabled={!canSelectDelivery}
          style={{
            padding: spacing[4],
            border: `2px solid ${
              selectedOption === 'delivery' ? colors.primary[600] : colors.border.light
            }`,
            borderRadius: borderRadius.lg,
            backgroundColor:
              selectedOption === 'delivery' ? colors.primary[50] : colors.neutral[0],
            cursor: canSelectDelivery ? 'pointer' : 'not-allowed',
            opacity: canSelectDelivery ? 1 : 0.5,
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            if (canSelectDelivery && selectedOption !== 'delivery') {
              e.currentTarget.style.borderColor = colors.primary[300];
              e.currentTarget.style.backgroundColor = colors.neutral[50];
            }
          }}
          onMouseLeave={(e) => {
            if (selectedOption !== 'delivery') {
              e.currentTarget.style.borderColor = colors.border.light;
              e.currentTarget.style.backgroundColor = colors.neutral[0];
            }
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Icons.Truck
              size={32}
              color={selectedOption === 'delivery' ? colors.primary[600] : colors.text.tertiary}
              style={{ margin: '0 auto', marginBottom: spacing[2] }}
            />
            <h4
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color:
                  selectedOption === 'delivery' ? colors.primary[700] : colors.text.primary,
                margin: 0,
                marginBottom: spacing[1],
              }}
            >
              Delivery
            </h4>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              Deliver to project site
            </p>
          </div>
        </button>
      </div>

      {/* Pickup Details */}
      {selectedOption === 'pickup' && supplierLocation && (
        <div>
          <div
            style={{
              padding: spacing[4],
              backgroundColor: colors.primary[50],
              border: `1px solid ${colors.primary[200]}`,
              borderRadius: borderRadius.lg,
              marginBottom: spacing[4],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
              <Icons.MapPin size={20} color={colors.primary[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4
                  style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[1],
                  }}
                >
                  Pickup Location
                </h4>
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    margin: 0,
                  }}
                >
                  {supplierLocation.address}
                </p>
              </div>
            </div>
          </div>

          {/* Pickup Time Availability Info */}
          <div
            style={{
              padding: spacing[4],
              backgroundColor: colors.success[50],
              border: `1px solid ${colors.success[200]}`,
              borderRadius: borderRadius.lg,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
              <Icons.Clock size={20} color={colors.success[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4
                  style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[2],
                  }}
                >
                  Pickup Availability
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: colors.success[600],
                      }}
                    />
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        margin: 0,
                      }}
                    >
                      <strong style={{ color: colors.text.primary }}>Same-day pickup:</strong> Order before 2 PM
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: colors.success[600],
                      }}
                    />
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        margin: 0,
                      }}
                    >
                      <strong style={{ color: colors.text.primary }}>Next-day pickup:</strong> Any time after
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: colors.success[600],
                      }}
                    />
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        margin: 0,
                      }}
                    >
                      <strong style={{ color: colors.text.primary }}>Hours:</strong> Mon-Sat, 8:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    margin: 0,
                    marginTop: spacing[3],
                  }}
                >
                  Specific pickup time will be confirmed after order placement
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Address and Notes */}
      {selectedOption === 'delivery' && (
        <div>
          {/* Delivery Address Field with Autocomplete and Map */}
          <div style={{ marginBottom: spacing[4] }}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                marginBottom: spacing[2],
              }}
            >
              Delivery Address *
            </label>
            <AddressInput
              value={addressInput}
              onChange={(address, coords) => {
                setAddressInput(address);
                if (coords) {
                  setAddressCoords(coords);
                  onManualAddressChange?.(address, coords);
                } else {
                  onManualAddressChange?.(address);
                }
              }}
              placeholder="Start typing address for suggestions..."
              latitude={addressCoords?.lat}
              longitude={addressCoords?.lng}
            />
          </div>

          {/* Delivery Notes Field */}
          <div style={{ marginBottom: spacing[4] }}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                marginBottom: spacing[2],
              }}
            >
              Notes for Driver/Courier
            </label>
            <textarea
              value={notesInput}
              onChange={(e) => {
                setNotesInput(e.target.value);
                onDeliveryNotesChange?.(e.target.value);
              }}
              placeholder="Any special instructions for the delivery (e.g., gate code, parking instructions, contact person)..."
              rows={3}
              style={{
                width: '100%',
                padding: spacing[3],
                fontSize: typography.fontSize.base,
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border.light;
              }}
            />
          </div>

          {/* Optional: Link to Project */}
          <div
            style={{
              padding: spacing[4],
              backgroundColor: colors.neutral[50],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.lg,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: showProjectSelection ? spacing[3] : 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <Icons.FolderPlus size={20} color={colors.text.secondary} />
                <span
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                  }}
                >
                  Link to Project (Optional)
                </span>
              </div>
              <button
                onClick={() => setShowProjectSelection(!showProjectSelection)}
                style={{
                  padding: `${spacing[1]} ${spacing[3]}`,
                  backgroundColor: showProjectSelection ? colors.primary[600] : colors.neutral[0],
                  color: showProjectSelection ? colors.neutral[0] : colors.primary[600],
                  border: `1px solid ${colors.primary[600]}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!showProjectSelection) {
                    e.currentTarget.style.backgroundColor = colors.primary[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showProjectSelection) {
                    e.currentTarget.style.backgroundColor = colors.neutral[0];
                  }
                }}
              >
                {showProjectSelection ? 'Hide Projects' : 'Add to Project'}
              </button>
            </div>

            {showProjectSelection && (
              <div style={{ marginTop: spacing[3] }}>
                {loading ? (
                  <div
                    style={{
                      padding: spacing[4],
                      textAlign: 'center',
                      color: colors.text.tertiary,
                    }}
                  >
                    Loading projects...
                  </div>
                ) : projects.length === 0 ? (
                  <div
                    style={{
                      padding: spacing[3],
                      backgroundColor: colors.neutral[0],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      textAlign: 'center',
                    }}
                  >
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        margin: 0,
                        marginBottom: spacing[2],
                      }}
                    >
                      No projects found. Create a project to link this order.
                    </p>
                    <button
                      onClick={() => (window.location.href = '/projects/new')}
                      style={{
                        padding: `${spacing[2]} ${spacing[4]}`,
                        backgroundColor: colors.primary[600],
                        color: colors.neutral[0],
                        border: 'none',
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.primary[700];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.primary[600];
                      }}
                    >
                      Create Project
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          onProjectSelect(project.id);
                          // Populate address and coordinates from project
                          if (project.address) {
                            setAddressInput(project.address);
                            if (project.latitude && project.longitude) {
                              const coords = { lat: project.latitude, lng: project.longitude };
                              setAddressCoords(coords);
                              onManualAddressChange?.(project.address, coords);
                            } else {
                              onManualAddressChange?.(project.address);
                            }
                          }
                        }}
                        style={{
                          padding: spacing[3],
                          border: `2px solid ${
                            selectedProjectId === project.id
                              ? colors.primary[600]
                              : colors.border.light
                          }`,
                          borderRadius: borderRadius.md,
                          backgroundColor:
                            selectedProjectId === project.id
                              ? colors.primary[50]
                              : colors.neutral[0],
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 200ms ease',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedProjectId !== project.id) {
                            e.currentTarget.style.borderColor = colors.primary[300];
                            e.currentTarget.style.backgroundColor = colors.neutral[50];
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedProjectId !== project.id) {
                            e.currentTarget.style.borderColor = colors.border.light;
                            e.currentTarget.style.backgroundColor = colors.neutral[0];
                          }
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4
                              style={{
                                fontSize: typography.fontSize.base,
                                fontWeight: typography.fontWeight.semibold,
                                color:
                                  selectedProjectId === project.id
                                    ? colors.primary[700]
                                    : colors.text.primary,
                                margin: 0,
                                marginBottom: spacing[1],
                              }}
                            >
                              {project.name}
                            </h4>
                            <p
                              style={{
                                fontSize: typography.fontSize.sm,
                                color: colors.text.secondary,
                                margin: 0,
                              }}
                            >
                              {project.address}
                            </p>
                          </div>
                          {selectedProjectId === project.id && (
                            <Icons.Check size={20} color={colors.primary[600]} />
                          )}
                        </div>
                        {selectedProjectId === project.id && !addressInput && (
                          <div
                            style={{
                              marginTop: spacing[2],
                              padding: spacing[2],
                              backgroundColor: colors.info[50],
                              borderRadius: borderRadius.sm,
                              fontSize: typography.fontSize.xs,
                              color: colors.info[700],
                            }}
                          >
                            Click again to use project address above
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
