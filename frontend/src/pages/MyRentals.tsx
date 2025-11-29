/**
 * My Rentals Page
 * List and manage all buyer's rental bookings
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wrench, MapPin, Truck, Calendar, Clock, Search, Plus } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { TabNavigation, PageHeader, EmptyState, StatusBadge, ListCard } from '../components/shared';
import { API_BASE_URL } from '../services/api/client';

interface RentalBooking {
  id: string;
  booking_number: string;
  supplier_id: string;
  supplier_name: string;
  tool_name: string;
  tool_spec?: string;
  start_date: string;
  end_date: string;
  rental_duration_days: number;
  total_rental_amount: number;
  deposit_amount: number;
  delivery_fee: number;
  pickup_or_delivery: 'pickup' | 'delivery';
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

type TabType = 'active' | 'upcoming' | 'completed';

export const MyRentals: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [rentals, setRentals] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_BASE_URL}/buyers/rentals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRentals(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab as TabType);
  };

  const getStatusType = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'pending',
      confirmed: 'confirmed',
      active: 'active',
      completed: 'completed',
      cancelled: 'cancelled',
    };
    return statusMap[status] || 'pending';
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t('myRentals.status.pending', 'Pending'),
      confirmed: t('myRentals.status.confirmed', 'Confirmed'),
      active: t('myRentals.status.active', 'Active'),
      completed: t('myRentals.status.completed', 'Completed'),
      cancelled: t('myRentals.status.cancelled', 'Cancelled'),
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if rental is currently active (today is between start and end date)
  const isActive = (rental: RentalBooking) => {
    const now = new Date();
    const start = new Date(rental.start_date);
    const end = new Date(rental.end_date);
    return now >= start && now <= end && rental.status !== 'completed' && rental.status !== 'cancelled';
  };

  // Check if rental is upcoming (start date in future)
  const isUpcoming = (rental: RentalBooking) => {
    const now = new Date();
    const start = new Date(rental.start_date);
    return start > now && rental.status !== 'completed' && rental.status !== 'cancelled';
  };

  // Filter rentals by tab
  const filterByTab = (rental: RentalBooking) => {
    if (selectedTab === 'active') {
      return isActive(rental);
    } else if (selectedTab === 'upcoming') {
      return isUpcoming(rental) || rental.status === 'confirmed' || rental.status === 'pending';
    } else if (selectedTab === 'completed') {
      return rental.status === 'completed' || rental.status === 'cancelled';
    }
    return false;
  };

  const filteredRentals = rentals.filter((rental) => {
    if (!filterByTab(rental)) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        rental.booking_number.toLowerCase().includes(query) ||
        rental.supplier_name?.toLowerCase().includes(query) ||
        rental.tool_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Count rentals by tab for badges
  const activeCount = rentals.filter((r) => isActive(r)).length;
  const upcomingCount = rentals.filter((r) => isUpcoming(r) || r.status === 'confirmed' || r.status === 'pending').length;
  const completedCount = rentals.filter((r) => r.status === 'completed' || r.status === 'cancelled').length;

  const tabs = [
    { id: 'active', label: t('myRentals.tabs.active', 'Active'), count: activeCount },
    { id: 'upcoming', label: t('myRentals.tabs.upcoming', 'Upcoming'), count: upcomingCount },
    { id: 'completed', label: t('myRentals.tabs.completed', 'Completed'), count: completedCount },
  ];

  return (
    <>
      <style>{`
        .my-rentals-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: ${spacing[6]};
        }
        @media (max-width: 640px) {
          .my-rentals-page {
            padding: ${spacing[4]};
          }
        }
        .my-rentals-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: ${spacing[4]};
          margin-bottom: ${spacing[6]};
        }
        @media (max-width: 640px) {
          .my-rentals-header {
            flex-direction: column;
            gap: ${spacing[3]};
            margin-bottom: ${spacing[4]};
          }
        }
        .browse-btn {
          display: flex;
          align-items: center;
          gap: ${spacing[2]};
          padding: ${spacing[2]} ${spacing[4]};
          background-color: ${colors.primary[600]};
          color: ${colors.neutral[0]};
          border: none;
          border-radius: ${borderRadius.lg};
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.medium};
          cursor: pointer;
          box-shadow: ${shadows.sm};
          transition: background-color 200ms ease;
          white-space: nowrap;
        }
        .browse-btn:hover {
          background-color: ${colors.primary[700]};
        }
        @media (max-width: 640px) {
          .browse-btn {
            width: 100%;
            justify-content: center;
            padding: ${spacing[3]} ${spacing[4]};
          }
        }
        .search-container {
          position: relative;
          margin-bottom: ${spacing[4]};
        }
        .search-icon {
          position: absolute;
          left: ${spacing[3]};
          top: 50%;
          transform: translateY(-50%);
          color: ${colors.text.tertiary};
        }
        .search-input {
          width: 100%;
          padding: ${spacing[3]} ${spacing[3]} ${spacing[3]} ${spacing[10]};
          border: 1px solid ${colors.border.light};
          border-radius: ${borderRadius.lg};
          font-size: ${typography.fontSize.base};
          background-color: ${colors.neutral[0]};
          box-sizing: border-box;
        }
        @media (max-width: 640px) {
          .search-input {
            font-size: ${typography.fontSize.sm};
            padding: ${spacing[2.5]} ${spacing[3]} ${spacing[2.5]} ${spacing[10]};
          }
        }
        .rental-card-content {
          display: flex;
          flex-direction: column;
          gap: ${spacing[3]};
        }
        .rental-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: ${spacing[3]};
        }
        .rental-card-info {
          flex: 1;
          min-width: 0;
        }
        .rental-booking-number {
          display: flex;
          align-items: center;
          gap: ${spacing[2]};
          margin-bottom: ${spacing[1]};
        }
        .rental-booking-number span {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.tertiary};
        }
        .rental-tool-name {
          font-size: ${typography.fontSize.base};
          font-weight: ${typography.fontWeight.semibold};
          color: ${colors.text.primary};
          margin: 0 0 ${spacing[1]} 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .rental-tool-name {
            font-size: ${typography.fontSize.sm};
            white-space: normal;
          }
        }
        .rental-supplier {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.secondary};
          margin: 0;
        }
        .rental-status-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: ${spacing[1]};
          flex-shrink: 0;
        }
        .rental-price {
          font-size: ${typography.fontSize.lg};
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.primary[600]};
          margin: 0;
        }
        @media (max-width: 640px) {
          .rental-price {
            font-size: ${typography.fontSize.base};
          }
        }
        .rental-deposit {
          font-size: ${typography.fontSize.xs};
          color: ${colors.text.tertiary};
          margin: 0;
        }
        .rental-meta {
          display: flex;
          flex-wrap: wrap;
          gap: ${spacing[3]};
          padding-top: ${spacing[3]};
          border-top: 1px solid ${colors.border.light};
        }
        .rental-meta-item {
          display: flex;
          align-items: center;
          gap: ${spacing[1.5]};
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.secondary};
        }
        @media (max-width: 640px) {
          .rental-meta-item {
            font-size: ${typography.fontSize.xs};
          }
        }
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: ${spacing[12]};
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid ${colors.neutral[200]};
          border-top-color: ${colors.primary[600]};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="my-rentals-page">
        <div className="my-rentals-header">
          <PageHeader
            title={t('myRentals.title', 'My Rentals')}
            subtitle={t('myRentals.subtitle', 'View and manage your equipment rentals')}
          />
          <button className="browse-btn" onClick={() => navigate('/rentals')}>
            <Plus size={18} />
            {t('myRentals.browseRentals', 'Browse Rentals')}
          </button>
        </div>

        {/* Tabs */}
        <TabNavigation tabs={tabs} activeTab={selectedTab} onTabChange={handleTabChange} />

        {/* Search */}
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={t('myRentals.searchPlaceholder', 'Search by booking number, tool, or supplier...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Rentals List */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : filteredRentals.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title={
              searchQuery
                ? t('myRentals.noSearchResults', 'No rentals found')
                : selectedTab === 'active'
                ? t('myRentals.noActiveRentals', 'No active rentals')
                : selectedTab === 'upcoming'
                ? t('myRentals.noUpcomingRentals', 'No upcoming rentals')
                : t('myRentals.noCompletedRentals', 'No completed rentals')
            }
            description={
              searchQuery
                ? t('myRentals.tryDifferentSearch', 'Try a different search term')
                : t('myRentals.browseToRent', 'Browse available equipment to rent')
            }
            action={
              !searchQuery && (
                <button
                  onClick={() => navigate('/rentals')}
                  style={{
                    padding: `${spacing[3]} ${spacing[6]}`,
                    backgroundColor: colors.primary[600],
                    color: colors.neutral[0],
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                >
                  {t('myRentals.browseRentals', 'Browse Rentals')}
                </button>
              )
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {filteredRentals.map((rental) => (
              <ListCard key={rental.id} onClick={() => navigate(`/rentals/${rental.id}`)}>
                <div className="rental-card-content">
                  {/* Top row: Info + Status/Price */}
                  <div className="rental-card-top">
                    <div className="rental-card-info">
                      <div className="rental-booking-number">
                        <Wrench size={14} color={colors.primary[600]} />
                        <span>{rental.booking_number}</span>
                      </div>
                      <h3 className="rental-tool-name">
                        {rental.tool_spec ? `${rental.tool_spec} ` : ''}
                        {rental.tool_name}
                      </h3>
                      <p className="rental-supplier">{rental.supplier_name}</p>
                    </div>

                    <div className="rental-status-price">
                      <StatusBadge status={getStatusType(rental.status)} label={getStatusLabel(rental.status)} />
                      <p className="rental-price">{rental.total_rental_amount?.toLocaleString()} ₾</p>
                      {rental.deposit_amount > 0 && (
                        <p className="rental-deposit">+ {rental.deposit_amount?.toLocaleString()} ₾ {t('myRentals.deposit', 'deposit')}</p>
                      )}
                    </div>
                  </div>

                  {/* Bottom row: Meta info */}
                  <div className="rental-meta">
                    <div className="rental-meta-item">
                      <Calendar size={14} color={colors.text.tertiary} />
                      <span>{formatDate(rental.start_date)} - {formatDate(rental.end_date)}</span>
                    </div>
                    <div className="rental-meta-item">
                      <Clock size={14} color={colors.text.tertiary} />
                      <span>{rental.rental_duration_days} {t('myRentals.days', 'days')}</span>
                    </div>
                    <div className="rental-meta-item">
                      {rental.pickup_or_delivery === 'delivery' ? (
                        <Truck size={14} color={colors.text.tertiary} />
                      ) : (
                        <MapPin size={14} color={colors.text.tertiary} />
                      )}
                      <span>
                        {rental.pickup_or_delivery === 'delivery'
                          ? t('myRentals.delivery', 'Delivery')
                          : t('myRentals.pickup', 'Pickup')}
                      </span>
                    </div>
                  </div>
                </div>
              </ListCard>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyRentals;
