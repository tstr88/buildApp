import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  categories: string[];
  suppliers: string[];
  directBookingOnly: boolean;
  deliveryAvailable: boolean;
  minDailyRate?: number;
  maxDailyRate?: number;
  minWeeklyRate?: number;
  maxWeeklyRate?: number;
}

const Rentals: React.FC = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [tools, setTools] = useState<RentalTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RentalFiltersState>({
    categories: [],
    suppliers: [],
    directBookingOnly: false,
    deliveryAvailable: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('recommended');

  useEffect(() => {
    fetchRentalTools();
  }, [filters, sortBy, i18n.language]);

  const fetchRentalTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      filters.categories.forEach(cat => params.append('category', cat));
      filters.suppliers.forEach(sup => params.append('supplier_id', sup));
      if (filters.directBookingOnly) params.set('direct_booking', 'true');
      if (filters.deliveryAvailable) params.set('delivery_available', 'true');
      if (filters.minDailyRate) params.set('min_daily_rate', filters.minDailyRate.toString());
      if (filters.maxDailyRate) params.set('max_daily_rate', filters.maxDailyRate.toString());
      params.set('sort', sortBy);
      params.set('lang', i18n.language);

      const response = await fetch(`${API_BASE_URL}/rentals/tools?${params.toString()}`);

      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};
        setTools(data.tools || []);
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

  const handleFilterChange = (newFilters: Partial<RentalFiltersState>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleResetFilters = () => {
    setFilters({
      categories: [],
      suppliers: [],
      directBookingOnly: false,
      deliveryAvailable: false,
    });
  };

  return (
    <>
      <style>{`
        .rentals-page {
          min-height: 100vh;
          background-color: ${colors.neutral[50]};
        }
        .rentals-header {
          background-color: ${colors.neutral[0]};
          border-bottom: 1px solid ${colors.border.light};
          padding: ${spacing[4]} ${spacing[6]};
        }
        @media (max-width: 640px) {
          .rentals-header {
            padding: ${spacing[3]} ${spacing[3]};
          }
        }
        .rentals-header-inner {
          max-width: 1400px;
          margin: 0 auto;
        }
        .rentals-title {
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.text.primary};
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
          justify-content: space-between;
          align-items: center;
          gap: ${spacing[3]};
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .rentals-controls {
            gap: ${spacing[2]};
          }
        }
        .rentals-controls-left {
          display: flex;
          align-items: center;
          gap: ${spacing[2]};
        }
        .rentals-controls-right {
          display: flex;
          align-items: center;
          gap: ${spacing[2]};
        }
        .mobile-filter-btn {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-filter-btn {
            display: flex;
            padding: ${spacing[2]} ${spacing[3]};
            background-color: ${colors.neutral[0]};
            border: 1px solid ${colors.border.light};
            border-radius: ${borderRadius.md};
            font-size: ${typography.fontSize.sm};
            font-weight: ${typography.fontWeight.medium};
            color: ${colors.text.primary};
            cursor: pointer;
            align-items: center;
            gap: ${spacing[2]};
            white-space: nowrap;
          }
        }
        .sort-select {
          padding: ${spacing[2]} ${spacing[3]};
          font-size: ${typography.fontSize.sm};
          border: 1px solid ${colors.border.light};
          border-radius: ${borderRadius.md};
          background-color: ${colors.neutral[0]};
          color: ${colors.text.primary};
          cursor: pointer;
          max-width: 180px;
        }
        @media (max-width: 480px) {
          .sort-select {
            max-width: 140px;
            font-size: ${typography.fontSize.xs};
            padding: ${spacing[2]};
          }
        }
        .rfq-btn {
          padding: ${spacing[2]} ${spacing[4]};
          background-color: ${colors.primary[600]};
          color: ${colors.neutral[0]};
          border: none;
          border-radius: ${borderRadius.md};
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.semibold};
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: ${spacing[2]};
        }
        @media (max-width: 640px) {
          .rfq-btn {
            padding: ${spacing[2]} ${spacing[3]};
            font-size: ${typography.fontSize.xs};
          }
          .rfq-btn-text {
            display: none;
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

            {/* Controls Row */}
            <div className="rentals-controls">
              <div className="rentals-controls-left">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="mobile-filter-btn"
                >
                  <Icons.Filter size={16} />
                  {t('rentalsPage.filtersButton', 'Filters')}
                </button>

                {/* Results Count */}
                <span
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tools.length} {tools.length === 1 ? t('rentalsPage.result') : t('rentalsPage.results')}
                </span>
              </div>

              <div className="rentals-controls-right">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="recommended">{t('rentalsPage.sort.recommended')}</option>
                  <option value="price_low">{t('rentalsPage.sort.priceLow')}</option>
                  <option value="price_high">{t('rentalsPage.sort.priceHigh')}</option>
                  <option value="name">{t('rentalsPage.sort.name')}</option>
                </select>

                {/* Request Rental Quote Button */}
                <button
                  onClick={() => navigate('/rentals/rfq')}
                  className="rfq-btn"
                >
                  <Icons.FileText size={18} />
                  <span className="rfq-btn-text">{t('rentalsPage.requestQuote')}</span>
                </button>
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
            )}
          </div>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
};

export default Rentals;
