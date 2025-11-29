/**
 * Supplier RFQ Inbox
 * View and manage RFQs from buyers with tabs for different statuses
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Inbox, MapPin, Package, Calendar } from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../theme/tokens';
import { useWebSocket } from '../context/WebSocketContext';
import { TabNavigation, PageHeader, EmptyState, StatusBadge, ListCard } from '../components/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type TabType = 'new' | 'sent' | 'accepted' | 'expired';

interface RFQCard {
  id: string;
  rfq_id: string;
  buyer_type: 'homeowner' | 'contractor';
  buyer_name: string;
  is_new_buyer: boolean;
  project_location: string;
  distance_km: number;
  item_count: number;
  preferred_window_start: string | null;
  preferred_window_end: string | null;
  received_at: string;
  relative_time: string;
  viewed_at?: string | null;
  offer_status?: 'pending' | 'accepted' | 'rejected' | 'expired' | null;
  offer_total?: number | null;
}

export function SupplierRFQInbox() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>((searchParams.get('tab') as TabType) || 'new');
  const [rfqs, setRfqs] = useState<RFQCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    new: 0,
    sent: 0,
    accepted: 0,
    expired: 0,
  });
  const { socket, subscribeToOrders, unsubscribeFromOrders } = useWebSocket();

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['new', 'sent', 'accepted', 'expired'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRFQs();
  }, [activeTab]);

  // Subscribe to real-time RFQ updates
  useEffect(() => {
    if (!socket) return;

    subscribeToOrders();

    const handleRFQsListUpdate = () => {
      console.log('[SupplierRFQInbox] RFQs list updated, refreshing...');
      fetchRFQs();
    };

    socket.on('rfqs:list-updated', handleRFQsListUpdate);
    socket.on('orders:list-updated', handleRFQsListUpdate);

    return () => {
      socket.off('rfqs:list-updated', handleRFQsListUpdate);
      socket.off('orders:list-updated', handleRFQsListUpdate);
      unsubscribeFromOrders();
    };
  }, [socket, subscribeToOrders, unsubscribeFromOrders]);

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const url = `${API_URL}/api/suppliers/rfqs?status=${activeTab}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRfqs(data.data || []);
        setCounts(data.counts || counts);
      }
    } catch (error) {
      console.error('[SupplierRFQInbox] Failed to fetch RFQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    setSearchParams({ tab });
  };

  const formatDeliveryWindow = (start: string | null, end: string | null) => {
    if (!start || !end) {
      return t('common.notSpecified', 'Not specified');
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';

    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString(locale, options);
    }
    return `${startDate.toLocaleDateString(locale, options)} - ${endDate.toLocaleDateString(locale, options)}`;
  };

  const tabs = [
    { id: 'new', label: t('supplierRFQInbox.tabs.new', 'New'), count: counts.new, hasAlert: counts.new > 0 },
    { id: 'sent', label: t('supplierRFQInbox.tabs.sent', 'Sent Offers'), count: counts.sent },
    { id: 'accepted', label: t('supplierRFQInbox.tabs.accepted', 'Accepted'), count: counts.accepted },
    { id: 'expired', label: t('supplierRFQInbox.tabs.expired', 'Expired'), count: counts.expired },
  ];

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: spacing[6],
      }}
    >
      <PageHeader
        title={t('supplierRFQInbox.title', 'RFQ Inbox')}
        subtitle={t('supplierRFQInbox.subtitle', 'Manage quote requests from buyers')}
      />

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* RFQ List */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
          }}
        >
          <div style={{ color: colors.text.tertiary }}>{t('common.loading')}</div>
        </div>
      ) : rfqs.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t('supplierRFQInbox.noRFQs', 'No RFQs found')}
          description={
            activeTab === 'new'
              ? t('supplierRFQInbox.noNewRFQs', 'New quote requests will appear here')
              : activeTab === 'sent'
                ? t('supplierRFQInbox.noSentOffers', 'Offers you send will appear here')
                : activeTab === 'accepted'
                  ? t('supplierRFQInbox.noAcceptedOffers', 'Accepted offers will appear here')
                  : t('supplierRFQInbox.noExpiredRFQs', 'Expired RFQs will appear here')
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {rfqs.map((rfq) => (
            <ListCard
              key={rfq.id}
              onClick={() => navigate(`/supplier/rfqs/${rfq.rfq_id}`)}
              isUnread={!rfq.viewed_at && activeTab === 'new'}
            >
              {/* Header Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: spacing[3],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}
                  >
                    RFQ #{rfq.rfq_id.slice(0, 8)}
                  </span>

                  {/* Buyer Type Badge */}
                  <StatusBadge
                    status={rfq.buyer_type}
                    label={rfq.buyer_type === 'homeowner' ? t('common.homeowner', 'Homeowner') : t('common.contractor', 'Contractor')}
                    size="sm"
                  />

                  {/* New Buyer Indicator */}
                  {rfq.is_new_buyer && (
                    <span
                      style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium,
                        padding: `${spacing[0.5]} ${spacing[2]}`,
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.success[50],
                        color: colors.success[700],
                        border: `1px solid ${colors.success[200]}`,
                      }}
                    >
                      {t('supplierRFQInbox.newBuyer', 'New buyer')}
                    </span>
                  )}
                </div>

                <span style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, whiteSpace: 'nowrap' }}>
                  {rfq.relative_time}
                </span>
              </div>

              {/* Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: spacing[4],
                }}
              >
                {/* Location */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      marginBottom: spacing[1],
                    }}
                  >
                    <MapPin size={12} />
                    {t('supplierRFQInbox.location', 'Location')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    {rfq.project_location}
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                    {rfq.distance_km.toFixed(1)} km
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      marginBottom: spacing[1],
                    }}
                  >
                    <Package size={12} />
                    {t('supplierRFQInbox.items', 'Items')}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                    }}
                  >
                    {rfq.item_count} {t('common.items', 'items')}
                  </div>
                </div>

                {/* Delivery Window */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      marginBottom: spacing[1],
                    }}
                  >
                    <Calendar size={12} />
                    {t('supplierRFQInbox.deliveryWindow', 'Delivery')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    {formatDeliveryWindow(rfq.preferred_window_start, rfq.preferred_window_end)}
                  </div>
                </div>

                {/* Offer Amount (for sent/accepted tabs) */}
                {activeTab !== 'new' && rfq.offer_total && (
                  <div>
                    <div
                      style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary,
                        marginBottom: spacing[1],
                      }}
                    >
                      {t('supplierRFQInbox.offerAmount', 'Offer')}
                    </div>
                    <div
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.success[600],
                      }}
                    >
                      ₾{Number(rfq.offer_total).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </ListCard>
          ))}
        </div>
      )}
    </div>
  );
}
