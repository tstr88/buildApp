/**
 * Rentals Page
 * Browse all rental tools with search and filters - matches Catalog page styling
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import * as Icons from 'lucide-react';
import { RentalToolCard } from '../components/rentals/RentalToolCard';
import { RentalFilters } from '../components/rentals/RentalFilters';
import { API_BASE_URL } from '../services/api/client';

interface RentalTool {
  id: string;
  tool_name: string;
  spec_string?: string;
  photo_url?: string;
  supplier_id: string;
  supplier_name: string;
  daily_rate?: number;
  weekly_rate?: number;
  deposit_amount?: number;
  delivery_available: boolean;
  pickup_available: boolean;
  direct_booking_available: boolean;
  category?: string;
}

interface RentalFiltersState {
  search: string;
  categories: string[];
  suppliers: string[];
  directBookingOnly: boolean;
  deliveryAvailable: boolean;
  minDailyRate?: number;
  maxDailyRate?: number;
  minWeeklyRate?: number;
  maxWeeklyRate?: number;
}

type SortOption = 'recommended' | 'price_low' | 'price_high' | 'name';

const Rentals: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [tools, setTools] = useState<RentalTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<RentalFiltersState>({
    search: searchParams.get('search') || '',
    categories: searchParams.getAll('category'),
    suppliers: searchParams.getAll('supplier'),
    directBookingOnly: searchParams.get('direct') === 'true',
    deliveryAvailable: searchParams.get('delivery') === 'true',
    minDailyRate: searchParams.get('min_daily') ? Number(searchParams.get('min_daily')) : undefined,
    maxDailyRate: searchParams.get('max_daily') ? Number(searchParams.get('max_daily')) : undefined,
  });

  useEffect(() => {
    fetchRentalTools();
  }, [filters, sortBy, page, i18n.language]);

  const fetchRentalTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.search) params.set('search', filters.search);
      filters.categories.forEach(cat => params.append('category', cat));
      filters.suppliers.forEach(sup => params.append('supplier_id', sup));
      if (filters.directBookingOnly) params.set('direct_booking', 'true');
      if (filters.deliveryAvailable) params.set('delivery_available', 'true');
      if (filters.minDailyRate) params.set('min_daily_rate', filters.minDailyRate.toString());
      if (filters.maxDailyRate) params.set('max_daily_rate', filters.maxDailyRate.toString());
      params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', '20');
      params.set('lang', i18n.language);

      const response = await fetch(`${API_BASE_URL}/rentals/tools?${params.toString()}`);

      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};
        setTools(data.tools || []);
        setTotalPages(Math.ceil((data.total || 0) / (data.limit || 20)));
        setTotalResults(data.total || data.tools?.length || 0);
      } else {
        console.error('Failed to fetch rental tools');
        setTools([]);
      }
    } catch (error) {
      console.error('Error fetching rental tools:', error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
    setPage(1);
  };

  const handleFilterChange = (newFilters: Partial<RentalFiltersState>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      categories: [],
      suppliers: [],
      directBookingOnly: false,
      deliveryAvailable: false,
    });
    setPage(1);
  };

  return (
    <>
      <style>{`
        .rentals-page {
          min-height: 100vh;
          background-color: ${colors.neutral[50]};
          padding-bottom: 80px;
        }
        .rentals-header {
          background: linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%);
          padding: ${spacing[5]} ${spacing[6]};
          box-shadow: ${shadows.md};
          position: sticky;
          top: 0;
          z-index: 1020;
        }
        @media (max-width: 640px) {
          .rentals-header {
            padding: ${spacing[4]} ${spacing[3]};
          }
        }
        .rentals-header-inner {
          max-width: 1400px;
          margin: 0 auto;
        }
        .rentals-title {
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.neutral[0]};
          margin: 0;
          margin-bottom: ${spacing[4]};
        }
        @media (max-width: 640px) {
          .rentals-title {
            font-size: ${typography.fontSize.xl};
            margin-bottom: ${spacing[3]};
          }
        }
        .rentals-controls {
          display: flex;
          flex-direction: column;
          gap: ${spacing[2]};
        }
        .rentals-controls-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: ${spacing[3]};
          width: 100%;
        }
        .rentals-controls-right {
          display: flex;
          align-items: center;
          gap: ${spacing[2]};
        }
        .results-count-row {
          display: flex;
          align-items: center;
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
        }
        .mobile-filter-btn:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }
        @media (max-width: 768px) {
          .mobile-filter-btn {
            display: flex;
          }
        }
        .results-count {
          font-size: ${typography.fontSize.sm};
          color: rgba(255, 255, 255, 0.85);
          white-space: nowrap;
        }
        .sort-select {
          padding: ${spacing[2]} ${spacing[3]};
          padding-right: ${spacing[8]};
          font-size: ${typography.fontSize.sm};
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
            padding: 0 ${spacing[6]} 0 ${spacing[2]};
            font-size: 12px;
            height: 36px;
          }
          .mobile-filter-btn {
            padding: 0 ${spacing[2]};
            font-size: 12px;
            gap: ${spacing[1]};
            height: 36px;
          }
        }
      `}</style>

      <div className="rentals-page">
        {/* Header */}
        <div className="rentals-header">
          <div className="rentals-header-inner">
            <h1 className="rentals-title">
              {t('rentalsPage.title')}
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
                placeholder={t('rentalsPage.searchPlaceholder', 'Search tools...')}
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
                  transition: 'all 200ms ease',
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
            <div className="rentals-controls">
              {/* Top row: Filters + Sort */}
              <div className="rentals-controls-top">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="mobile-filter-btn"
                >
                  <Icons.SlidersHorizontal size={16} />
                  <span>{t('rentalsPage.filtersButton', 'Filters')}</span>
                </button>

                {/* Right side controls */}
                <div className="rentals-controls-right">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="sort-select"
                  >
                    <option value="recommended">{t('rentalsPage.sort.recommended')}</option>
                    <option value="price_low">{t('rentalsPage.sort.priceLow')}</option>
                    <option value="price_high">{t('rentalsPage.sort.priceHigh')}</option>
                    <option value="name">{t('rentalsPage.sort.name')}</option>
                  </select>
                </div>
              </div>

              {/* Bottom row: Results Count */}
              <div className="results-count-row">
                <span className="results-count">
                  {totalResults} {totalResults === 1 ? t('rentalsPage.result') : t('rentalsPage.results')}
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
                  {t('rentalsPage.filters.title')}
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
                  overscrollBehavior: 'contain',
                  touchAction: 'pan-y',
                }}
              >
                <RentalFilters
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
                  {t('rentalsPage.filters.apply', 'Apply Filters')}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div
          className="rentals-layout"
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
              .rentals-layout {
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
            <RentalFilters
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
            ) : tools.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: spacing[12],
                }}
              >
                <Icons.Wrench size={64} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[4] }} />
                <h3
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[2],
                  }}
                >
                  {t('rentalsPage.empty.title')}
                </h3>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary,
                    margin: 0,
                    marginBottom: spacing[4],
                  }}
                >
                  {t('rentalsPage.empty.description')}
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
                  {t('rentalsPage.empty.resetFilters')}
                </button>
              </div>
            ) : (
              <>
                {/* Results Grid */}
                <div
                  className="results-container"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: spacing[4],
                  }}
                >
                  {tools.map((tool) => (
                    <RentalToolCard key={tool.id} tool={tool} />
                  ))}
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
                      {t('rentalsPage.pagination.previous', 'Previous')}
                    </button>

                    <span
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                      }}
                    >
                      {t('rentalsPage.pagination.pageOf', { page, totalPages, defaultValue: `${page} / ${totalPages}` })}
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
                      {t('rentalsPage.pagination.next', 'Next')}
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

export default Rentals;
