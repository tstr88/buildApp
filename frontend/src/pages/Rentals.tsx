import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius } from '../theme/tokens';
import * as Icons from 'lucide-react';
import { RentalToolCard } from '../components/rentals/RentalToolCard';
import { RentalFilters } from '../components/rentals/RentalFilters';

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

interface RentalFilters {
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
  const [filters, setFilters] = useState<RentalFilters>({
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

      const response = await fetch(`http://localhost:3001/api/rentals/tools?${params.toString()}`);

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

  const handleFilterChange = (newFilters: Partial<RentalFilters>) => {
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
    <div style={{ backgroundColor: colors.neutral[50], minHeight: '100vh' }}>
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
            {t('rentalsPage.title')}
          </h1>

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
                {t('rentalsPage.filters')}
              </button>

              {/* Results Count */}
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                {tools.length} {tools.length === 1 ? t('rentalsPage.result') : t('rentalsPage.results')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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
                <option value="recommended">{t('rentalsPage.sort.recommended')}</option>
                <option value="price_low">{t('rentalsPage.sort.priceLow')}</option>
                <option value="price_high">{t('rentalsPage.sort.priceHigh')}</option>
                <option value="name">{t('rentalsPage.sort.name')}</option>
              </select>

              {/* Request Rental Quote Button */}
              <button
                onClick={() => navigate('/rentals/rfq')}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}
              >
                <Icons.FileText size={18} />
                {t('rentalsPage.requestQuote')}
              </button>
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
            }
            .desktop-filters {
              display: none !important;
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
  );
};

export default Rentals;
