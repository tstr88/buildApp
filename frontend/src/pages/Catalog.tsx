/**
 * Catalog Page
 * Browse all supplier SKUs with search and filters
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { CatalogFilters } from '../components/catalog/CatalogFilters';
import { SKUCard } from '../components/catalog/SKUCard';
import { SKURow } from '../components/catalog/SKURow';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SKU {
  id: string;
  supplier_id: string;
  supplier_name_ka: string;
  supplier_name_en: string;
  name_ka: string;
  name_en: string;
  spec_string_ka?: string;
  spec_string_en?: string;
  category_ka: string;
  category_en: string;
  base_price?: number;
  unit_ka: string;
  unit_en: string;
  direct_order_available: boolean;
  lead_time_category?: 'same_day' | 'next_day' | 'negotiable';
  pickup_available: boolean;
  delivery_available: boolean;
  updated_at: string;
  thumbnail_url?: string;
}

interface CatalogFilters {
  search: string;
  categories: string[];
  suppliers: string[];
  directOrderOnly: boolean;
  deliveryOption: 'any' | 'pickup' | 'delivery' | 'both';
  leadTime: 'any' | 'same_day' | 'next_day' | 'negotiable';
  priceMin?: number;
  priceMax?: number;
  updatedSince?: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'updated_desc';

export const Catalog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [skus, setSkus] = useState<SKU[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<CatalogFilters>({
    search: searchParams.get('search') || '',
    categories: searchParams.getAll('category'),
    suppliers: searchParams.getAll('supplier'),
    directOrderOnly: searchParams.get('direct') === 'true',
    deliveryOption: (searchParams.get('delivery') as any) || 'any',
    leadTime: (searchParams.get('lead_time') as any) || 'any',
    priceMin: searchParams.get('price_min') ? Number(searchParams.get('price_min')) : undefined,
    priceMax: searchParams.get('price_max') ? Number(searchParams.get('price_max')) : undefined,
    updatedSince: searchParams.get('updated_since') || undefined,
  });

  useEffect(() => {
    fetchSKUs();
  }, [filters, sortBy, page]);

  const fetchSKUs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.search) params.set('search', filters.search);
      filters.categories.forEach(cat => params.append('category', cat));
      filters.suppliers.forEach(sup => params.append('supplier_id', sup));
      if (filters.directOrderOnly) params.set('direct_order_available', 'true');
      if (filters.deliveryOption !== 'any') params.set('delivery_option', filters.deliveryOption);
      if (filters.leadTime !== 'any') params.set('lead_time', filters.leadTime);
      if (filters.priceMin) params.set('price_min', filters.priceMin.toString());
      if (filters.priceMax) params.set('price_max', filters.priceMax.toString());
      if (filters.updatedSince) params.set('updated_since', filters.updatedSince);
      params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', '20');

      const response = await fetch(`${API_URL}/api/catalog/skus?${params.toString()}`);

      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};
        setSkus(data.skus || []);
        setTotalPages(Math.ceil((data.total || 0) / (data.limit || 20)));
        setTotalResults(data.total || 0);
      } else {
        console.error('Failed to fetch SKUs');
        setSkus([]);
      }
    } catch (error) {
      console.error('Error fetching SKUs:', error);
      setSkus([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
    setPage(1);
  };

  const handleFilterChange = (newFilters: Partial<CatalogFilters>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      categories: [],
      suppliers: [],
      directOrderOnly: false,
      deliveryOption: 'any',
      leadTime: 'any',
      priceMin: undefined,
      priceMax: undefined,
      updatedSince: undefined,
    });
    setPage(1);
  };

  const handleAddToRFQ = (sku: SKU) => {
    // Navigate to RFQ creation with pre-filled SKU
    navigate(`/rfqs/create?sku_id=${sku.id}`);
  };

  const handleDirectOrder = (sku: SKU) => {
    // Navigate to direct order with pre-filled SKU and supplier
    navigate(`/orders/direct?supplier_id=${sku.supplier_id}&sku_id=${sku.id}`);
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
          <h1
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            {t('catalogPage.title')}
          </h1>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: spacing[4] }}>
            <Icons.Search
              size={20}
              color={colors.text.tertiary}
              style={{
                position: 'absolute',
                left: spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              type="text"
              placeholder={t('catalogPage.searchPlaceholder')}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: `${spacing[3]} ${spacing[3]} ${spacing[3]} ${spacing[10]}`,
                fontSize: typography.fontSize.base,
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.lg,
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary[600];
                e.target.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border.light;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Controls Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: spacing[3],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
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
                {t('catalogPage.filters')}
              </button>

              {/* Results Count */}
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                {totalResults} {totalResults === 1 ? t('catalogPage.result') : t('catalogPage.results')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
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
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: spacing[2],
                    backgroundColor: viewMode === 'grid' ? colors.primary[50] : colors.neutral[0],
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.Grid size={18} color={viewMode === 'grid' ? colors.primary[600] : colors.text.tertiary} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: spacing[2],
                    backgroundColor: viewMode === 'list' ? colors.primary[50] : colors.neutral[0],
                    border: 'none',
                    borderLeft: `1px solid ${colors.border.light}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.List size={18} color={viewMode === 'list' ? colors.primary[600] : colors.text.tertiary} />
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
                <option value="relevance">{t('catalogPage.sort.relevance')}</option>
                <option value="price_asc">{t('catalogPage.sort.priceAsc')}</option>
                <option value="price_desc">{t('catalogPage.sort.priceDesc')}</option>
                <option value="updated_desc">{t('catalogPage.sort.updated')}</option>
              </select>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .mobile-filter-btn {
              display: flex !important;
            }
          }
        `}</style>
      </div>

      {/* Main Content */}
      <div
        className="catalog-layout"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: spacing[6],
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: spacing[6],
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .catalog-layout {
              grid-template-columns: 1fr !important;
            }
            .desktop-filters {
              display: none !important;
            }
          }
        `}</style>

        {/* Filters Sidebar */}
        <div className="desktop-filters">
          <CatalogFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Results */}
        <div>
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
          ) : skus.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: spacing[12],
              }}
            >
              <Icons.Package size={64} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[4] }} />
              <h3
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[2],
                }}
              >
                {t('catalogPage.empty.title')}
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  margin: 0,
                  marginBottom: spacing[4],
                }}
              >
                {t('catalogPage.empty.description')}
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
                {t('catalogPage.empty.resetFilters')}
              </button>
            </div>
          ) : (
            <>
              {/* Results Grid/List */}
              <div
                className="results-container"
                style={{
                  display: viewMode === 'grid' ? 'grid' : 'flex',
                  flexDirection: viewMode === 'list' ? 'column' : undefined,
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
                  gap: spacing[4],
                }}
              >
                {skus.map((sku) =>
                  viewMode === 'grid' ? (
                    <SKUCard
                      key={sku.id}
                      sku={sku}
                      onAddToRFQ={() => handleAddToRFQ(sku)}
                      onDirectOrder={() => handleDirectOrder(sku)}
                    />
                  ) : (
                    <SKURow
                      key={sku.id}
                      sku={sku}
                      onAddToRFQ={() => handleAddToRFQ(sku)}
                      onDirectOrder={() => handleDirectOrder(sku)}
                    />
                  )
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: spacing[2],
                    marginTop: spacing[8],
                  }}
                >
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    style={{
                      padding: `${spacing[2]} ${spacing[3]}`,
                      backgroundColor: page === 1 ? colors.neutral[100] : colors.neutral[0],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      color: page === 1 ? colors.text.tertiary : colors.text.primary,
                    }}
                  >
                    {t('catalogPage.pagination.previous')}
                  </button>

                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    {t('catalogPage.pagination.pageOf', { page, totalPages })}
                  </span>

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    style={{
                      padding: `${spacing[2]} ${spacing[3]}`,
                      backgroundColor: page === totalPages ? colors.neutral[100] : colors.neutral[0],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      color: page === totalPages ? colors.text.tertiary : colors.text.primary,
                    }}
                  >
                    {t('catalogPage.pagination.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
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
