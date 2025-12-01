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
    <>
      <style>{`
        .catalog-page {
          min-height: 100vh;
          background-color: ${colors.neutral[50]};
          padding-bottom: 80px;
        }
        .catalog-header {
          background: linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%);
          padding: ${spacing[5]} ${spacing[6]};
          box-shadow: ${shadows.md};
          position: sticky;
          top: 0;
          z-index: 1020;
        }
        @media (max-width: 640px) {
          .catalog-header {
            padding: ${spacing[4]} ${spacing[3]};
          }
        }
        .catalog-header-inner {
          max-width: 1400px;
          margin: 0 auto;
        }
        .catalog-title {
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.neutral[0]};
          margin: 0;
          margin-bottom: ${spacing[4]};
        }
        @media (max-width: 640px) {
          .catalog-title {
            font-size: ${typography.fontSize.xl};
            margin-bottom: ${spacing[3]};
          }
        }
        .catalog-controls {
          display: flex;
          flex-direction: column;
          gap: ${spacing[2]};
        }
        .catalog-controls-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: ${spacing[3]};
          width: 100%;
        }
        .catalog-controls-right {
          display: flex;
          align-items: center;
          gap: ${spacing[2]};
        }
        .results-count-row {
          display: flex;
          align-items: center;
        }
        .results-count {
          font-size: ${typography.fontSize.sm};
          color: rgba(255, 255, 255, 0.85);
          white-space: nowrap;
        }
        .mobile-filter-btn {
          display: none;
          padding: ${spacing[2]} ${spacing[3]};
          background-color: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: ${borderRadius.md};
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.medium};
          color: ${colors.neutral[0]};
          cursor: pointer;
          align-items: center;
          gap: ${spacing[2]};
          white-space: nowrap;
          flex-shrink: 0;
        }
        .mobile-filter-btn:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }
        @media (max-width: 768px) {
          .mobile-filter-btn {
            display: flex;
          }
        }
        .view-toggle {
          display: flex;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: ${borderRadius.md};
          overflow: hidden;
          background-color: rgba(255, 255, 255, 0.1);
        }
        .view-toggle button {
          background-color: transparent !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        .view-toggle button.active, .view-toggle button:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
        }
        @media (max-width: 480px) {
          .view-toggle {
            display: none;
          }
        }
        .sort-select {
          padding: ${spacing[2]} ${spacing[3]};
          padding-right: ${spacing[8]};
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.medium};
          font-family: inherit;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: ${borderRadius.md};
          background-color: rgba(255, 255, 255, 0.15);
          color: ${colors.neutral[0]};
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right ${spacing[2]} center;
        }
        .sort-select:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }
        .sort-select option {
          background-color: ${colors.neutral[0]};
          color: ${colors.text.primary};
        }
        @media (max-width: 768px) {
          .sort-select {
            padding: 0 ${spacing[5]} 0 ${spacing[2]};
            font-size: 11px;
            height: 34px;
          }
          .mobile-filter-btn {
            padding: 0 ${spacing[2]};
            font-size: 11px;
            gap: ${spacing[1]};
            height: 34px;
          }
        }
      `}</style>
      <div className="catalog-page">
      {/* Header */}
      <div className="catalog-header">
        <div className="catalog-header-inner">
          <h1 className="catalog-title">
            {t('catalogPage.title')}
          </h1>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: spacing[3] }}>
            <Icons.Search
              size={20}
              color={colors.neutral[400]}
              style={{
                position: 'absolute',
                left: spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
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
                border: 'none',
                borderRadius: borderRadius.lg,
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: shadows.sm,
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = colors.neutral[0];
                e.target.style.boxShadow = `0 0 0 3px rgba(255, 255, 255, 0.3)`;
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                e.target.style.boxShadow = shadows.sm;
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="catalog-controls">
            {/* Top row: Filters + View Toggle + Sort */}
            <div className="catalog-controls-top">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="mobile-filter-btn"
              >
                <Icons.SlidersHorizontal size={16} />
                <span>{t('catalogPage.filtersButton')}</span>
              </button>

              <div className="catalog-controls-right">
                {/* View Mode Toggle */}
                <div className="view-toggle">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'active' : ''}
                    style={{
                      padding: spacing[2],
                      backgroundColor: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.Grid size={18} color={colors.neutral[0]} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'active' : ''}
                    style={{
                      padding: spacing[2],
                      backgroundColor: viewMode === 'list' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      border: 'none',
                      borderLeft: `1px solid rgba(255, 255, 255, 0.3)`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.List size={18} color={colors.neutral[0]} />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="sort-select"
                >
                  <option value="relevance">{t('catalogPage.sort.relevance')}</option>
                  <option value="price_asc">{t('catalogPage.sort.priceAsc')}</option>
                  <option value="price_desc">{t('catalogPage.sort.priceDesc')}</option>
                  <option value="updated_desc">{t('catalogPage.sort.updated')}</option>
                </select>
              </div>
            </div>

            {/* Bottom row: Results Count */}
            <div className="results-count-row">
              <span className="results-count">
                {totalResults} {totalResults === 1 ? t('catalogPage.result') : t('catalogPage.results')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {showFilters && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowFilters(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040,
            }}
          />
          {/* Filter Sheet */}
          <div
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.neutral[0],
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              boxShadow: shadows.xl,
              zIndex: 1050,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Drag Handle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: spacing[3],
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  backgroundColor: colors.neutral[300],
                  borderRadius: borderRadius.full,
                }}
              />
            </div>

            {/* Header with Title and Close */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: `0 ${spacing[4]} ${spacing[3]}`,
                borderBottom: `1px solid ${colors.border.light}`,
                flexShrink: 0,
              }}
            >
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {t('catalogPage.filters.title')}
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                style={{
                  padding: spacing[2],
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icons.X size={24} color={colors.text.secondary} />
              </button>
            </div>

            {/* Scrollable Filter Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: spacing[4],
                WebkitOverflowScrolling: 'touch',
                // Prevent scroll chaining to parent
                overscrollBehavior: 'contain',
                // Ensure touch scrolling works
                touchAction: 'pan-y',
              }}
            >
              <CatalogFilters
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
                isMobile={true}
              />
            </div>

            {/* Fixed Apply Button at Bottom */}
            <div
              style={{
                padding: spacing[4],
                paddingBottom: `calc(${spacing[4]} + env(safe-area-inset-bottom, 0px))`,
                borderTop: `1px solid ${colors.border.light}`,
                backgroundColor: colors.neutral[0],
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setShowFilters(false)}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  backgroundColor: colors.primary[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: 'pointer',
                }}
              >
                {t('catalogPage.filters.apply')}
              </button>
            </div>
          </div>
        </>
      )}

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
              padding: ${spacing[3]} !important;
            }
            .desktop-filters {
              display: none !important;
            }
          }
          @media (max-width: 640px) {
            .results-container {
              grid-template-columns: 1fr !important;
            }
          }
          @media (min-width: 641px) and (max-width: 900px) {
            .results-container {
              grid-template-columns: repeat(2, 1fr) !important;
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
    </>
  );
};
