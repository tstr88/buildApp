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
      year: 'numeric',
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

  const BrowseRentalsButton = () => (
    <button
      onClick={() => navigate('/rentals')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: `${spacing[2]} ${spacing[4]}`,
        backgroundColor: colors.primary[600],
        color: colors.neutral[0],
        border: 'none',
        borderRadius: borderRadius.lg,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        cursor: 'pointer',
        boxShadow: shadows.sm,
        transition: 'background-color 200ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary[700];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary[600];
      }}
    >
      <Plus size={20} />
      {t('myRentals.browseRentals', 'Browse Rentals')}
    </button>
  );

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: spacing[6],
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: spacing[6],
        }}
      >
        <PageHeader
          title={t('myRentals.title', 'My Rentals')}
          subtitle={t('myRentals.subtitle', 'View and manage your equipment rentals')}
        />
        <BrowseRentalsButton />
      </div>

      {/* Tabs */}
      <TabNavigation tabs={tabs} selectedTab={selectedTab} onTabChange={handleTabChange} />

      {/* Search */}
      <div
        style={{
          position: 'relative',
          marginBottom: spacing[4],
        }}
      >
        <Search
          size={20}
          style={{
            position: 'absolute',
            left: spacing[3],
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.text.tertiary,
          }}
        />
        <input
          type="text"
          placeholder={t('myRentals.searchPlaceholder', 'Search by booking number, tool, or supplier...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: `${spacing[3]} ${spacing[3]} ${spacing[3]} ${spacing[10]}`,
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.lg,
            fontSize: typography.fontSize.base,
            backgroundColor: colors.neutral[0],
          }}
        />
      </div>

      {/* Rentals List */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing[12],
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: `3px solid ${colors.neutral[200]}`,
              borderTopColor: colors.primary[600],
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : filteredRentals.length === 0 ? (
        <EmptyState
          icon={<Wrench size={48} color={colors.text.tertiary} />}
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
            <ListCard
              key={rental.id}
              onClick={() => navigate(`/rentals/${rental.id}`)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: spacing[4],
                }}
              >
                {/* Left: Tool info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      marginBottom: spacing[1],
                    }}
                  >
                    <Wrench size={16} color={colors.primary[600]} />
                    <span
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.tertiary,
                      }}
                    >
                      {rental.booking_number}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                      marginBottom: spacing[1],
                    }}
                  >
                    {rental.tool_name}
                  </h3>
                  {rental.tool_spec && (
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        margin: 0,
                        marginBottom: spacing[2],
                      }}
                    >
                      {rental.tool_spec}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      margin: 0,
                    }}
                  >
                    {rental.supplier_name}
                  </p>
                </div>

                {/* Middle: Dates */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing[2],
                    minWidth: 180,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                    <Calendar size={16} color={colors.text.tertiary} />
                    <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                      {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                    <Clock size={16} color={colors.text.tertiary} />
                    <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                      {rental.rental_duration_days} {rental.rental_duration_days === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                    {rental.pickup_or_delivery === 'delivery' ? (
                      <Truck size={16} color={colors.text.tertiary} />
                    ) : (
                      <MapPin size={16} color={colors.text.tertiary} />
                    )}
                    <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                      {rental.pickup_or_delivery === 'delivery' ? 'Delivery' : 'Pickup'}
                    </span>
                  </div>
                </div>

                {/* Right: Status and price */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: spacing[2],
                  }}
                >
                  <StatusBadge status={getStatusType(rental.status)}>
                    {getStatusLabel(rental.status)}
                  </StatusBadge>
                  <p
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.primary[600],
                      margin: 0,
                    }}
                  >
                    {rental.total_rental_amount?.toLocaleString()} GEL
                  </p>
                  {rental.deposit_amount > 0 && (
                    <p
                      style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary,
                        margin: 0,
                      }}
                    >
                      + {rental.deposit_amount?.toLocaleString()} GEL deposit
                    </p>
                  )}
                </div>
              </div>
            </ListCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRentals;
