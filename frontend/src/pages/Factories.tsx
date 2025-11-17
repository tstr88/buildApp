/**
 * Factories Directory Page
 * Browse suppliers with map and list views
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { FactoryCard } from '../components/factories/FactoryCard';
import { SupplierDirectoryMap } from '../components/map';

interface Supplier {
  id: string;
  business_name: string;
  depot_address: string;
  depot_lat: number;
  depot_lng: number;
  delivery_radius_km: number;
  categories: string[];
  trust_metrics: {
    spec_reliability: number;
    on_time_delivery: number;
    issue_rate: number;
    total_deliveries: number;
  };
  sku_count: number;
  has_direct_order: boolean;
  distance_km?: number;
}

type SortOption = 'nearest' | 'reliability' | 'most_skus' | 'newest';
type DistanceFilter = 'all' | '10km' | '25km' | '50km';
type TrustTier = 'all' | 'verified' | 'trusted';

export const Factories: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map-list' | 'list-only'>('map-list');
  const [sortBy, setSortBy] = useState<SortOption>('reliability');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('all');
  const [trustTier, setTrustTier] = useState<TrustTier>('all');
  const [directOrderOnly, setDirectOrderOnly] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const CATEGORIES = [
    { value: 'concrete', label: t('factoriesPage.filters.categories.concrete') },
    { value: 'blocks', label: t('factoriesPage.filters.categories.blocks') },
    { value: 'rebar', label: t('factoriesPage.filters.categories.rebar') },
    { value: 'aggregates', label: t('factoriesPage.filters.categories.aggregates') },
    { value: 'metal', label: t('factoriesPage.filters.categories.metal') },
    { value: 'tools', label: t('factoriesPage.filters.categories.tools') },
  ];

  useEffect(() => {
    fetchSuppliers();
  }, [selectedCategories, distanceFilter, trustTier, directOrderOnly, sortBy, selectedProject, i18n.language]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      selectedCategories.forEach(cat => params.append('category[]', cat));
      if (distanceFilter !== 'all' && selectedProject) {
        params.set('distance_filter', distanceFilter);
        params.set('project_id', selectedProject);
      }
      if (trustTier !== 'all') params.set('trust_tier', trustTier);
      if (directOrderOnly) params.set('direct_order_available', 'true');
      params.set('sort', sortBy);
      params.set('lang', i18n.language);

      const response = await fetch(`http://localhost:3001/api/factories?${params.toString()}`);

      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};
        setSuppliers(data.suppliers || []);
      } else {
        console.error('Failed to fetch suppliers');
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setDistanceFilter('all');
    setTrustTier('all');
    setDirectOrderOnly(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderBottom: `1px solid ${colors.border.light}`,
          padding: `${spacing[4]} ${spacing[6]}`,
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing[4],
            }}
          >
            <h1
              style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              {t('factoriesPage.title')}
            </h1>

            <div style={{ display: 'flex', gap: spacing[2] }}>
              {/* View Mode Toggle */}
              <div
                style={{
                  display: 'flex',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setViewMode('map-list')}
                  style={{
                    padding: spacing[2],
                    backgroundColor:
                      viewMode === 'map-list' ? colors.primary[50] : colors.neutral[0],
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    fontSize: typography.fontSize.sm,
                    color: viewMode === 'map-list' ? colors.primary[600] : colors.text.tertiary,
                  }}
                >
                  <Icons.Map size={16} />
                  {t('factoriesPage.viewMode.map')}
                </button>
                <button
                  onClick={() => setViewMode('list-only')}
                  style={{
                    padding: spacing[2],
                    backgroundColor:
                      viewMode === 'list-only' ? colors.primary[50] : colors.neutral[0],
                    border: 'none',
                    borderLeft: `1px solid ${colors.border.light}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    fontSize: typography.fontSize.sm,
                    color: viewMode === 'list-only' ? colors.primary[600] : colors.text.tertiary,
                  }}
                >
                  <Icons.List size={16} />
                  {t('factoriesPage.viewMode.list')}
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  fontSize: typography.fontSize.sm,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.neutral[0],
                  color: colors.text.primary,
                  cursor: 'pointer',
                }}
              >
                <option value="reliability">{t('factoriesPage.sort.reliability')}</option>
                <option value="nearest">{t('factoriesPage.sort.nearest')}</option>
                <option value="most_skus">{t('factoriesPage.sort.mostSkus')}</option>
                <option value="newest">{t('factoriesPage.sort.newest')}</option>
              </select>
            </div>
          </div>

          {/* Filters Row */}
          <div
            style={{
              display: 'flex',
              gap: spacing[2],
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mobile-filter-btn"
              style={{
                display: 'none',
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: colors.neutral[0],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                cursor: 'pointer',
                alignItems: 'center',
                gap: spacing[1],
              }}
            >
              <Icons.Filter size={16} />
              {t('factoriesPage.filters.button')}
            </button>

            {/* Category Filters */}
            <div className="desktop-filters" style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryToggle(cat.value)}
                  style={{
                    padding: `${spacing[1]} ${spacing[3]}`,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    backgroundColor: selectedCategories.includes(cat.value)
                      ? colors.primary[100]
                      : colors.neutral[100],
                    color: selectedCategories.includes(cat.value)
                      ? colors.primary[700]
                      : colors.text.secondary,
                    border: `1px solid ${
                      selectedCategories.includes(cat.value)
                        ? colors.primary[300]
                        : colors.border.light
                    }`,
                    borderRadius: borderRadius.full,
                    cursor: 'pointer',
                  }}
                >
                  {cat.label}
                </button>
              ))}

              {/* Direct Order Toggle */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[1]} ${spacing[3]}`,
                  backgroundColor: directOrderOnly ? colors.warning[50] : colors.neutral[100],
                  border: `1px solid ${
                    directOrderOnly ? colors.warning[300] : colors.border.light
                  }`,
                  borderRadius: borderRadius.full,
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                }}
              >
                <input
                  type="checkbox"
                  checked={directOrderOnly}
                  onChange={(e) => setDirectOrderOnly(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <Icons.Zap size={14} color={colors.warning[600]} />
                {t('factoriesPage.filters.directOrder')}
              </label>

              {/* Trust Tier */}
              <select
                value={trustTier}
                onChange={(e) => setTrustTier(e.target.value as TrustTier)}
                style={{
                  padding: `${spacing[1]} ${spacing[3]}`,
                  fontSize: typography.fontSize.sm,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.neutral[100],
                  color: colors.text.primary,
                  cursor: 'pointer',
                }}
              >
                <option value="all">{t('factoriesPage.filters.trustTier.all')}</option>
                <option value="verified">{t('factoriesPage.filters.trustTier.verified')}</option>
                <option value="trusted">{t('factoriesPage.filters.trustTier.trusted')}</option>
              </select>

              {/* Distance Filter */}
              {selectedProject && (
                <select
                  value={distanceFilter}
                  onChange={(e) => setDistanceFilter(e.target.value as DistanceFilter)}
                  style={{
                    padding: `${spacing[1]} ${spacing[3]}`,
                    fontSize: typography.fontSize.sm,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.full,
                    backgroundColor: colors.neutral[100],
                    color: colors.text.primary,
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">{t('factoriesPage.filters.distance.all')}</option>
                  <option value="10km">{t('factoriesPage.filters.distance.10km')}</option>
                  <option value="25km">{t('factoriesPage.filters.distance.25km')}</option>
                  <option value="50km">{t('factoriesPage.filters.distance.50km')}</option>
                </select>
              )}

              {/* Reset Button */}
              {(selectedCategories.length > 0 ||
                directOrderOnly ||
                trustTier !== 'all' ||
                distanceFilter !== 'all') && (
                <button
                  onClick={handleResetFilters}
                  style={{
                    padding: `${spacing[1]} ${spacing[3]}`,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    backgroundColor: 'transparent',
                    color: colors.primary[600],
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {t('factoriesPage.filters.reset')}
                </button>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .mobile-filter-btn {
              display: flex !important;
            }
            .desktop-filters {
              display: ${showFilters ? 'flex' : 'none'} !important;
              width: 100%;
              margin-top: ${spacing[2]};
            }
          }
        `}</style>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: spacing[6],
        }}
      >
        {/* Map View */}
        {viewMode === 'map-list' && suppliers.length > 0 && (
          <div
            style={{
              marginBottom: spacing[6],
            }}
          >
            <SupplierDirectoryMap
              suppliers={suppliers.map(s => ({
                id: s.id,
                name: s.business_name,
                depotLat: s.depot_lat,
                depotLng: s.depot_lng,
                deliveryRadiusKm: s.delivery_radius_km,
                categories: s.categories,
              }))}
              categoryFilter={selectedCategories.length === 1 ? selectedCategories[0] : null}
              onSupplierClick={(id) => navigate(`/factories/${id}`)}
              height="500px"
            />
          </div>
        )}

        {/* Results Count */}
        <div
          style={{
            marginBottom: spacing[4],
          }}
        >
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            {suppliers.length} {suppliers.length === 1 ? t('factoriesPage.results.supplier') : t('factoriesPage.results.suppliers')} {t('factoriesPage.results.found')}
          </p>
        </div>

        {/* Supplier List */}
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <Icons.Loader
              size={48}
              color={colors.text.tertiary}
              style={{ animation: 'spin 1s linear infinite' }}
            />
          </div>
        ) : suppliers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: spacing[12],
            }}
          >
            <Icons.Building size={64} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[4] }} />
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              {t('factoriesPage.empty.title')}
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing[4],
              }}
            >
              {t('factoriesPage.empty.description')}
            </p>
            <button
              onClick={handleResetFilters}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.primary[600],
                color: colors.neutral[0],
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
              }}
            >
              {t('factoriesPage.empty.reset')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            {suppliers.map((supplier) => (
              <FactoryCard
                key={supplier.id}
                supplier={supplier}
                onClick={() => navigate(`/factories/${supplier.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
