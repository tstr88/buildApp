/**
 * Supplier Checkbox List Component
 * Allows selecting suppliers with distance and trust labels
 */

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface Supplier {
  id: string;
  business_name: string;
  depot_latitude: number | null;
  depot_longitude: number | null;
  categories: string[];
  is_verified: boolean;
  distance?: number; // in km
}

interface SupplierCheckboxListProps {
  selectedSupplierIds: string[];
  onSelectionChange: (supplierIds: string[]) => void;
  projectLocation?: { lat: number; lng: number };
}

export const SupplierCheckboxList: React.FC<SupplierCheckboxListProps> = ({
  selectedSupplierIds,
  onSelectionChange,
  projectLocation,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      // TODO: Create API endpoint for fetching suppliers
      // For now, we'll mock the data with actual supplier IDs from database
      const mockSuppliers: Supplier[] = [
        {
          id: 'bbc89928-3895-4184-b22b-9d6d8c408651',
          business_name: 'Tbilisi Concrete Plant LLC',
          depot_latitude: 41.7151,
          depot_longitude: 44.8271,
          categories: ['concrete', 'cement'],
          is_verified: true,
        },
        {
          id: '2a869097-3922-466a-86f6-d4d8dd4d5f43',
          business_name: 'Kavkaz Materials LLC',
          depot_latitude: 41.7225,
          depot_longitude: 44.7910,
          categories: ['cement', 'aggregates', 'bricks'],
          is_verified: true,
        },
        {
          id: '83f5f138-ca65-429f-8aab-70112d7cdb5f',
          business_name: 'ProTools Rental LLC',
          depot_latitude: 41.7100,
          depot_longitude: 44.7850,
          categories: ['tools', 'hardware', 'cement'],
          is_verified: true,
        },
      ];

      // Calculate distances if project location is provided
      const suppliersWithDistance = mockSuppliers.map((supplier) => ({
        ...supplier,
        distance: projectLocation && supplier.depot_latitude && supplier.depot_longitude
          ? calculateDistance(
              projectLocation.lat,
              projectLocation.lng,
              supplier.depot_latitude,
              supplier.depot_longitude
            )
          : undefined,
      }));

      // Sort by distance if available
      suppliersWithDistance.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });

      setSuppliers(suppliersWithDistance);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toggleSupplier = (supplierId: string) => {
    if (selectedSupplierIds.includes(supplierId)) {
      onSelectionChange(selectedSupplierIds.filter((id) => id !== supplierId));
    } else {
      if (selectedSupplierIds.length >= 5) {
        alert('Maximum 5 suppliers can be selected');
        return;
      }
      onSelectionChange([...selectedSupplierIds, supplierId]);
    }
  };

  const allCategories = Array.from(
    new Set(suppliers.flatMap((s) => s.categories))
  ).sort();

  const filteredSuppliers = categoryFilter
    ? suppliers.filter((s) => s.categories.includes(categoryFilter))
    : suppliers;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: spacing[4] }}>
        <h3
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[1],
          }}
        >
          Select Suppliers
        </h3>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
          }}
        >
          Choose 1-5 suppliers to send this RFQ to
        </p>
      </div>

      {/* Category Filter */}
      <div
        style={{
          display: 'flex',
          gap: spacing[2],
          marginBottom: spacing[4],
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setCategoryFilter(null)}
          style={{
            padding: `${spacing[2]} ${spacing[3]}`,
            backgroundColor: categoryFilter === null ? colors.primary[600] : colors.neutral[0],
            color: categoryFilter === null ? colors.neutral[0] : colors.text.secondary,
            border: `1px solid ${categoryFilter === null ? colors.primary[600] : colors.border.light}`,
            borderRadius: borderRadius.full,
            fontSize: typography.fontSize.sm,
            cursor: 'pointer',
          }}
        >
          All
        </button>
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              backgroundColor: categoryFilter === category ? colors.primary[600] : colors.neutral[0],
              color: categoryFilter === category ? colors.neutral[0] : colors.text.secondary,
              border: `1px solid ${categoryFilter === category ? colors.primary[600] : colors.border.light}`,
              borderRadius: borderRadius.full,
              fontSize: typography.fontSize.sm,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Selection Count */}
      <div
        style={{
          padding: spacing[3],
          backgroundColor: selectedSupplierIds.length >= 5 ? colors.warning[50] : colors.primary[50],
          borderRadius: borderRadius.md,
          marginBottom: spacing[4],
        }}
      >
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: selectedSupplierIds.length >= 5 ? colors.warning[700] : colors.primary[700],
            margin: 0,
            fontWeight: typography.fontWeight.medium,
          }}
        >
          {selectedSupplierIds.length} of 5 suppliers selected
          {selectedSupplierIds.length === 0 && ' (minimum 1 required)'}
          {selectedSupplierIds.length >= 5 && ' (maximum reached)'}
        </p>
      </div>

      {/* Supplier List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: spacing[8] }}>
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.tertiary }}>
            Loading suppliers...
          </p>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: spacing[8],
            backgroundColor: colors.neutral[50],
            borderRadius: borderRadius.lg,
          }}
        >
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.tertiary }}>
            No suppliers found
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {filteredSuppliers.map((supplier) => {
            const isSelected = selectedSupplierIds.includes(supplier.id);
            return (
              <div
                key={supplier.id}
                onClick={() => toggleSupplier(supplier.id)}
                style={{
                  padding: spacing[4],
                  backgroundColor: isSelected ? colors.primary[50] : colors.neutral[0],
                  border: `2px solid ${isSelected ? colors.primary[600] : colors.border.light}`,
                  borderRadius: borderRadius.lg,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = colors.primary[300];
                    e.currentTarget.style.backgroundColor = colors.neutral[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = colors.border.light;
                    e.currentTarget.style.backgroundColor = colors.neutral[0];
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                  {/* Checkbox */}
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: borderRadius.sm,
                      border: `2px solid ${isSelected ? colors.primary[600] : colors.border.light}`,
                      backgroundColor: isSelected ? colors.primary[600] : colors.neutral[0],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && <Icons.Check size={14} color={colors.neutral[0]} />}
                  </div>

                  {/* Supplier Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                      <h4
                        style={{
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                          margin: 0,
                        }}
                      >
                        {supplier.business_name}
                      </h4>
                      {supplier.is_verified && (
                        <div
                          style={{
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: colors.success[50],
                            borderRadius: borderRadius.full,
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing[1],
                          }}
                        >
                          <Icons.BadgeCheck size={12} color={colors.success[600]} />
                          <span
                            style={{
                              fontSize: typography.fontSize.xs,
                              color: colors.success[700],
                              fontWeight: typography.fontWeight.medium,
                            }}
                          >
                            Verified
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4], marginBottom: spacing[2] }}>
                      {supplier.distance !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                          <Icons.MapPin size={14} color={colors.text.tertiary} />
                          <span style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                            {supplier.distance.toFixed(1)} km away
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
                      {supplier.categories.map((category) => (
                        <span
                          key={category}
                          style={{
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: colors.neutral[100],
                            color: colors.text.secondary,
                            fontSize: typography.fontSize.xs,
                            borderRadius: borderRadius.sm,
                            textTransform: 'capitalize',
                          }}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
